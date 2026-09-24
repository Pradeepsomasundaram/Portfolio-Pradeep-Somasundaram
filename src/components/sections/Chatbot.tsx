import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiPaperAirplane, HiSparkles, HiOutlineClipboardCheck, HiOutlineDownload, HiMicrophone, HiVolumeUp, HiVolumeOff, HiCode } from 'react-icons/hi';
import { useAppStore } from '../../stores/appStore';
import type { Message } from '../../types/chatbot.types';
import { generateResponse, matchJobDescription, initialQuickQuestions } from '../../lib/assistantEngine';
import { useVoice } from '../../hooks/useVoice';
import { printTailoredResume } from '../../lib/resumeBuilder';
import { askAgent, AgentUnavailableError, toolLabels, type AgentAction, type TraceEntry } from '../../lib/agentClient';
import { visitContext } from '../../lib/visitContext';

const JOB_MATCH_TRIGGERS = ['Match a job description', 'Match another job description'];
const LIVE_FOLLOW_UPS = ['What is he building lately?', 'Best projects for ML roles', 'Why hire Pradeep?'];
const LIMIT_CODES = ['rate_limited', 'capacity', 'busy'];

const welcomeMessage: Message = {
  id: '1',
  role: 'assistant',
  content: `${visitContext.company ? `Hi ${visitContext.company} team! ` : 'Hi! '}I'm Pradeep's portfolio assistant. I can tell you about his experience, projects, skills, education, and more.\n\nTry asking me a question or pick a topic below!`,
  timestamp: new Date(),
};

function loadMessages(): Message[] {
  try {
    const saved = sessionStorage.getItem('chatbot-messages');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) }));
    }
  } catch { /* ignore */ }
  return [welcomeMessage];
}

// Animated gradient orb avatar — the "AI" visual signature reused across the site
const AiOrb = ({ size = 'w-7 h-7', pulse = false }: { size?: string; pulse?: boolean }) => (
  <div className={`relative ${size} shrink-0`}>
    {pulse && (
      <motion.span
        className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-secondary to-accent"
        animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
      />
    )}
    <motion.div
      className="relative w-full h-full rounded-full bg-gradient-to-br from-primary via-secondary to-accent shadow-lg"
      animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      style={{ backgroundSize: '200% 200%' }}
    />
  </div>
);

// Reveals assistant text progressively for a "live-generated" feel
const TypewriterText = memo(({ text, onDone }: { text: string; onDone?: () => void }) => {
  const [shown, setShown] = useState('');

  useEffect(() => {
    setShown('');
    let i = 0;
    const chunk = Math.max(1, Math.round(text.length / 60));
    const interval = setInterval(() => {
      i += chunk;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        onDone?.();
      }
    }, 12);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return <>{shown}</>;
});
TypewriterText.displayName = 'TypewriterText';

const reasoningPhases = ['Analyzing query', 'Retrieving context', 'Generating response'];

// Shows the agent's real tool calls once it starts using tools; until then it
// cycles through generic phases while the request is in flight.
const ReasoningTrace = ({ tools = [] }: { tools?: string[] }) => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => Math.min(p + 1, reasoningPhases.length - 1));
    }, 380);
    return () => clearInterval(interval);
  }, []);

  const steps = tools.length > 0 ? tools.map((t) => toolLabels[t] ?? t) : reasoningPhases.slice(0, phase + 1);
  const active = steps.length - 1;

  return (
    <div className="flex flex-col gap-1 font-mono text-xs text-gray-400">
      {steps.map((label, i) => (
        <motion.span
          key={label}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: i === active ? 1 : 0.4 }}
          className="flex items-center gap-1.5"
        >
          {i === active ? (
            <span className="flex gap-0.5">
              <span className="w-1 h-1 bg-secondary rounded-full typing-dot" />
              <span className="w-1 h-1 bg-secondary rounded-full typing-dot" />
              <span className="w-1 h-1 bg-secondary rounded-full typing-dot" />
            </span>
          ) : (
            <span className="text-secondary">✓</span>
          )}
          {label}...
        </motion.span>
      ))}
    </div>
  );
};

// "Under the hood": the agent's real model turns and tool calls with timings
const TracePanel = ({ trace }: { trace: TraceEntry[] }) => (
  <div className="mt-2 rounded-lg bg-black/30 p-2 font-mono text-[10px] leading-relaxed text-gray-300 space-y-1.5 max-h-40 overflow-y-auto">
    {trace.map((t, i) =>
      t.kind === 'model' ? (
        <p key={i} className="text-secondary">
          ◆ model turn {t.turn + 1} · {t.ms} ms{t.tokens ? ` · ${t.tokens} tokens` : ''}
        </p>
      ) : (
        <div key={i}>
          <p className={t.isError ? 'text-red-400' : 'text-primary'}>
            ⚙ {t.name}({t.args}) · {t.ms} ms
          </p>
          <p className="text-gray-400 break-all">→ {t.result}{t.result.length >= 500 ? '…' : ''}</p>
        </div>
      )
    )}
  </div>
);

// Chips showing which tools the live agent used for an answer
const ToolChips = ({ tools }: { tools: string[] }) => (
  <div className="flex flex-wrap gap-1 mt-1.5 pt-1.5 border-t border-black/5 dark:border-white/10">
    {tools.map((t) => (
      <span key={t} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary/10 text-secondary">
        ⚙ {toolLabels[t] ?? t}
      </span>
    ))}
  </div>
);

// Deterministic pseudo-confidence score so the same query always scores the same
function confidenceFor(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return 90 + (hash % 10);
}

export const Chatbot = () => {
  const { chatbotOpen, toggleChatbot, setChatbotOpen, jobMatchRequested, clearJobMatchRequest, openProject } = useAppStore();
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [confidenceById, setConfidenceById] = useState<Record<string, number>>({});
  const [jobMatchMode, setJobMatchMode] = useState(false);
  const [liveText, setLiveText] = useState('');
  const [liveTools, setLiveTools] = useState<string[]>([]);
  // null until the first answer tells us whether the live agent is reachable
  const [liveMode, setLiveMode] = useState<boolean | null>(null);
  const [speakReplies, setSpeakReplies] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  const [liveTrace, setLiveTrace] = useState<TraceEntry[]>([]);
  const sendRef = useRef<(text?: string) => void>();
  const voice = useVoice((transcript) => sendRef.current?.(transcript));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    sessionStorage.setItem('chatbot-messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, streamingId, liveText]);

  useEffect(() => {
    if (chatbotOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [chatbotOpen]);

  // The live agent can drive the page: scroll to a section or open a project
  const performAction = useCallback(
    ({ action, target }: AgentAction) => {
      // On phones the chat covers the page, so tuck it away to reveal what was asked for
      if (window.innerWidth < 640) setChatbotOpen(false);
      const id = action === 'open_project' ? 'projects' : target;
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (action === 'open_project') setTimeout(() => openProject(target), 500);
    },
    [setChatbotOpen, openProject]
  );

  const enterJobMatchMode = useCallback(() => {
    setJobMatchMode(true);
    setFollowUps([]);
    const promptMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Paste a job description below (or just the requirements/qualifications section) and I'll compare it against Pradeep's actual skills, projects, and experience — matches, gaps, and all.`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, promptMessage]);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSend = useCallback((text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isTyping) return;

    if (JOB_MATCH_TRIGGERS.includes(messageText)) {
      enterJobMatchMode();
      return;
    }

    const wasJobMatch = jobMatchMode;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setFollowUps([]);
    setIsTyping(true);
    setJobMatchMode(false);
    setLiveText('');
    setLiveTools([]);
    setLiveTrace([]);
    const trace: TraceEntry[] = [];

    const answerOffline = (note = '') => {
      const response = wasJobMatch ? matchJobDescription(messageText) : generateResponse(messageText);
      const delay = Math.min(500 + response.text.length, 1200);
      setTimeout(() => {
        const botId = (Date.now() + 1).toString();
        const content = note + response.text;
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          { id: botId, role: 'assistant', content, timestamp: new Date(), resumeJd: wasJobMatch ? messageText : undefined },
        ]);
        setStreamingId(botId);
        if (speakReplies) voice.speak(content);
        setConfidenceById((prev) => ({ ...prev, [botId]: confidenceFor(response.text) }));
        setFollowUps(response.followUps);
      }, delay);
    };

    const history = [...messages, userMessage].slice(-8).map((m) => ({
      role: m.role,
      content:
        m === userMessage && wasJobMatch
          ? `Here is a job description. Assess how well Pradeep fits it.\n\n${m.content}`
          : m.content,
    }));
    // The API needs the conversation to open with a user turn
    while (history.length > 0 && history[0].role !== 'user') history.shift();

    let answer = '';
    askAgent(history, {
      onText: (chunk) => {
        answer += chunk;
        setLiveText(answer);
      },
      onTool: (name) => setLiveTools((prev) => (prev.includes(name) ? prev : [...prev, name])),
      onAction: performAction,
      onTrace: (entry) => {
        trace.push(entry);
        setLiveTrace([...trace]);
      },
    }, {
      visitor: { company: visitContext.company, role: visitContext.persona ?? undefined },
      trace: true,
    })
      .then((tools) => {
        if (!answer.trim()) throw new AgentUnavailableError('empty', 'Live AI returned nothing.');
        setLiveMode(true);
        setIsTyping(false);
        setLiveText('');
        setLiveTools([]);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: answer.trim(),
            timestamp: new Date(),
            tools,
            trace,
            resumeJd: wasJobMatch ? messageText : undefined,
          },
        ]);
        setFollowUps(LIVE_FOLLOW_UPS);
        if (speakReplies) voice.speak(answer);
      })
      .catch((err: unknown) => {
        setLiveMode(false);
        setLiveText('');
        setLiveTools([]);
        const code = err instanceof AgentUnavailableError ? err.code : 'error';
        const note = LIMIT_CODES.includes(code)
          ? `${(err as AgentUnavailableError).message} Answering from my built-in knowledge instead.\n\n`
          : '';
        answerOffline(note);
      });
  }, [input, isTyping, jobMatchMode, messages, enterJobMatchMode, performAction, speakReplies, voice]);

  sendRef.current = handleSend;

  // Triggered from the ⌘K command palette's "Match a job description" action
  useEffect(() => {
    if (jobMatchRequested) {
      enterJobMatchMode();
      clearJobMatchRequest();
    }
  }, [jobMatchRequested, enterJobMatchMode, clearJobMatchRequest]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      toggleChatbot();
    }
  };

  const showQuickQuestions = messages.length <= 2 && followUps.length === 0 && !jobMatchMode && !isTyping;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg hover:shadow-2xl hover:shadow-primary/30 transition-shadow bg-gradient-to-br from-primary via-secondary to-accent text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Toggle AI chat assistant"
      >
        {!chatbotOpen && (
          <motion.span
            className="absolute inset-0 rounded-full bg-primary"
            animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        <span className="relative">
          {chatbotOpen ? <HiX className="w-6 h-6" /> : <HiSparkles className="w-6 h-6" />}
        </span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {chatbotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-label="Portfolio AI assistant"
            className="fixed bottom-24 right-4 left-4 sm:left-auto sm:right-6 z-50 sm:w-[380px] max-h-[70vh] sm:max-h-[520px] glass-panel rounded-2xl shadow-glow flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-primary via-secondary to-accent text-white px-4 py-3 flex items-center gap-3 overflow-hidden">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  background:
                    'radial-gradient(circle at 20% 0%, rgba(255,255,255,0.35), transparent 55%)',
                }}
              />
              <AiOrb pulse />
              <div className="relative">
                <h3 className="font-bold text-sm flex items-center gap-1">
                  AI Portfolio Assistant
                </h3>
                <p className="text-xs opacity-80">
                  {jobMatchMode
                    ? 'Job match mode — paste a JD below'
                    : liveMode === true
                      ? 'Live AI agent · Gemini with tools'
                      : liveMode === false
                        ? 'Offline mode · built-in answers'
                        : "Trained on Pradeep's work & skills"}
                </p>
              </div>
              <button
                onClick={() => setShowTrace((v) => !v)}
                className="relative ml-auto p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                aria-label={showTrace ? 'Hide agent internals' : 'Show agent internals'}
                aria-pressed={showTrace}
                title="Under the hood"
              >
                <HiCode className={`w-5 h-5 ${showTrace ? '' : 'opacity-70'}`} />
              </button>
              {voice.canSpeak && (
                <button
                  onClick={() => {
                    if (speakReplies) voice.stopSpeaking();
                    setSpeakReplies((v) => !v);
                  }}
                  className="relative p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                  aria-label={speakReplies ? 'Turn off spoken replies' : 'Read replies aloud'}
                  aria-pressed={speakReplies}
                  title={speakReplies ? 'Spoken replies on' : 'Read replies aloud'}
                >
                  {speakReplies ? <HiVolumeUp className="w-5 h-5" /> : <HiVolumeOff className="w-5 h-5 opacity-70" />}
                </button>
              )}
              <button
                onClick={toggleChatbot}
                className={`relative p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors`}
                aria-label="Close chat"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[250px] max-h-[340px]" aria-live="polite">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && <AiOrb size="w-6 h-6" />}
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-primary text-white rounded-br-sm'
                        : 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-bl-sm'
                    }`}
                  >
                    {msg.role === 'assistant' && msg.id === streamingId ? (
                      <TypewriterText
                        text={msg.content}
                        onDone={() => setStreamingId(null)}
                      />
                    ) : (
                      msg.content
                    )}
                    {msg.resumeJd && msg.id !== streamingId && (
                      <button
                        onClick={() => printTailoredResume(msg.resumeJd!)}
                        className="mt-2 w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-void hover:shadow-glow transition-shadow"
                      >
                        <HiOutlineDownload className="w-4 h-4" />
                        Download tailored resume (PDF)
                      </button>
                    )}
                    {showTrace && msg.trace && msg.trace.length > 0 && <TracePanel trace={msg.trace} />}
                    {msg.role === 'assistant' && msg.tools && msg.tools.length > 0 && <ToolChips tools={msg.tools} />}
                    {msg.role === 'assistant' && msg.id !== streamingId && confidenceById[msg.id] && (
                      <p className="mt-1.5 pt-1.5 border-t border-black/5 dark:border-white/10 font-mono text-[10px] text-secondary/80">
                        confidence: {confidenceById[msg.id]}%
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex items-end gap-2 justify-start">
                  <AiOrb size="w-6 h-6" pulse />
                  {liveText ? (
                    <div className="max-w-[80%] px-3 py-2 rounded-2xl rounded-bl-sm text-sm whitespace-pre-line bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200">
                      {liveText}
                      {liveTools.length > 0 && <ToolChips tools={liveTools} />}
                      {showTrace && liveTrace.length > 0 && <TracePanel trace={liveTrace} />}
                    </div>
                  ) : (
                    <div className="bg-gray-100 dark:bg-white/10 px-4 py-3 rounded-2xl rounded-bl-sm">
                      <ReasoningTrace tools={liveTools} />
                      {showTrace && liveTrace.length > 0 && <TracePanel trace={liveTrace} />}
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Follow-up suggestions */}
            {followUps.length > 0 && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 pb-2 flex flex-wrap gap-1.5"
              >
                {followUps.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-white transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Initial Quick Questions */}
            {showQuickQuestions && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {initialQuickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-primary hover:text-white transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Job match trigger — always available, not just as a one-time quick question */}
            {!jobMatchMode && !isTyping && (
              <div className="px-4 pb-2">
                <button
                  onClick={enterJobMatchMode}
                  className="w-full flex items-center justify-center gap-2 text-xs font-medium px-3 py-2 rounded-full border border-dashed border-secondary/40 text-secondary hover:bg-secondary/10 hover:border-secondary transition-colors"
                >
                  <HiOutlineClipboardCheck className="w-4 h-4" />
                  Match a job description
                </button>
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-gray-200 dark:border-white/10">
              {jobMatchMode && (
                <div className="flex items-center justify-between gap-2 mb-2 px-1">
                  <span className="text-[11px] font-mono text-secondary">
                    paste job description ↴
                  </span>
                  <button
                    onClick={() => setJobMatchMode(false)}
                    className="text-[11px] text-gray-400 hover:text-primary transition-colors"
                  >
                    cancel
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={voice.listening && voice.interim ? voice.interim : input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={voice.listening ? 'Listening…' : jobMatchMode ? 'Paste job description here...' : 'Ask about skills, projects, experience...'}
                  className={`flex-1 px-3 py-2 rounded-full border bg-white dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none ${
                    jobMatchMode
                      ? 'border-secondary/50 focus:border-secondary'
                      : 'border-gray-300 dark:border-white/10 focus:border-primary'
                  }`}
                />
                {voice.canListen && (
                  <motion.button
                    onClick={voice.listening ? voice.stopListening : voice.startListening}
                    disabled={isTyping}
                    className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
                      voice.listening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-white/10 text-primary'
                    }`}
                    aria-label={voice.listening ? 'Stop listening' : 'Speak your question'}
                    aria-pressed={voice.listening}
                    whileTap={{ scale: 0.95 }}
                  >
                    <HiMicrophone className="w-4 h-4" />
                  </motion.button>
                )}
                <motion.button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="p-2 bg-gradient-to-br from-primary to-accent text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Send message"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <HiPaperAirplane className="w-4 h-4 rotate-90" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
