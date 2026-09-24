import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSparkles, HiArrowRight, HiSearch, HiOutlineClipboardCheck } from 'react-icons/hi';
import { generateResponse, searchPages, type CommandResult } from '../../lib/assistantEngine';
import { useAppStore } from '../../stores/appStore';
import { enableSemanticSearch, semanticReady, semanticSearch, SEMANTIC_FLAG, type SemanticDoc } from '../../lib/semanticSearch';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export const CommandPalette = ({ open, onClose }: CommandPaletteProps) => {
  const [query, setQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestJobMatch = useAppStore((s) => s.requestJobMatch);
  const setTerminalOpen = useAppStore((s) => s.setTerminalOpen);
  const openProject = useAppStore((s) => s.openProject);

  // Optional on-device semantic search: finds things by meaning, not just keywords
  const [semStatus, setSemStatus] = useState<{ state: 'off' | 'loading' | 'ready' | 'error'; progress: number }>({
    state: semanticReady() ? 'ready' : 'off',
    progress: 0,
  });
  const [semResults, setSemResults] = useState<SemanticDoc[]>([]);

  const turnOnSemantic = useCallback(() => {
    setSemStatus({ state: 'loading', progress: 0 });
    enableSemanticSearch((progress) => setSemStatus({ state: 'loading', progress }))
      .then(() => {
        setSemStatus({ state: 'ready', progress: 100 });
        try { localStorage.setItem(SEMANTIC_FLAG, '1'); } catch { /* storage blocked */ }
      })
      .catch(() => setSemStatus({ state: 'error', progress: 0 }));
  }, []);

  // Returning visitors who opted in before get it automatically (model is browser-cached)
  useEffect(() => {
    if (!open || semStatus.state !== 'off') return;
    try {
      if (localStorage.getItem(SEMANTIC_FLAG) === '1') turnOnSemantic();
    } catch { /* storage blocked */ }
  }, [open, semStatus.state, turnOnSemantic]);

  useEffect(() => {
    if (semStatus.state !== 'ready' || !query.trim()) {
      setSemResults([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(() => {
      semanticSearch(query.trim()).then((r) => !cancelled && setSemResults(r));
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, semStatus.state]);

  const openSemantic = useCallback((doc: SemanticDoc) => {
    onClose();
    setTimeout(() => {
      if (doc.kind === 'project') {
        document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => openProject(doc.target), 400);
      } else {
        document.getElementById(doc.target)?.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  }, [onClose, openProject]);

  const pages = searchPages(query);

  useEffect(() => {
    if (open) {
      setQuery('');
      setAiAnswer(null);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
    setAiAnswer(null);
  }, [query]);

  const askAi = useCallback((q: string) => {
    if (!q.trim()) return;
    setThinking(true);
    setAiAnswer(null);
    setTimeout(() => {
      setThinking(false);
      setAiAnswer(generateResponse(q).text);
    }, 550);
  }, []);

  const goTo = useCallback((result: CommandResult) => {
    onClose();
    setTimeout(() => {
      document.getElementById(result.id)?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, [onClose]);

  const openJobMatch = useCallback(() => {
    requestJobMatch();
    onClose();
  }, [requestJobMatch, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, pages.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex < pages.length) {
        goTo(pages[activeIndex]);
      } else {
        askAi(query);
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-label="AI command palette"
            className="relative w-full max-w-xl glass-panel rounded-2xl shadow-glow overflow-hidden"
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          >
            <div className="relative flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-gradient-to-r from-primary/10 via-transparent to-accent/10">
              <HiSearch className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages, or ask the AI anything about Pradeep..."
                className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder:text-gray-400 text-sm"
              />
              <kbd className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded border border-gray-300 dark:border-white/20 text-gray-400">
                esc
              </kbd>
            </div>

            <div className="max-h-[50vh] overflow-y-auto">
              {pages.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Pages
                  </p>
                  {pages.map((p, i) => (
                    <button
                      key={p.id}
                      onClick={() => goTo(p)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeIndex === i
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                      }`}
                    >
                      <span>
                        <span className="font-medium">{p.label}</span>
                        {p.sublabel && (
                          <span className="ml-2 text-xs text-gray-400">{p.sublabel}</span>
                        )}
                      </span>
                      <HiArrowRight className="w-4 h-4 opacity-50" />
                    </button>
                  ))}
                </div>
              )}

              {semResults.length > 0 && (
                <div className="p-2 border-t border-gray-100 dark:border-gray-700/60">
                  <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-secondary">
                    Smart matches · on-device
                  </p>
                  {semResults.map((r) => (
                    <button
                      key={`${r.kind}-${r.title}`}
                      onClick={() => openSemantic(r)}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      <span className="min-w-0">
                        <span className="block font-medium truncate">{r.title}</span>
                        <span className="block text-xs text-gray-400 truncate">{r.subtitle}</span>
                      </span>
                      <HiArrowRight className="w-4 h-4 opacity-50 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {query.trim() && (
                <div className="p-2 border-t border-gray-100 dark:border-gray-700/60">
                  <button
                    onClick={() => askAi(query)}
                    onMouseEnter={() => setActiveIndex(pages.length)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeIndex === pages.length
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                    }`}
                  >
                    <HiSparkles className="w-4 h-4 shrink-0" />
                    Ask AI: <span className="italic">&ldquo;{query}&rdquo;</span>
                  </button>

                  <AnimatePresence mode="wait">
                    {thinking && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 px-3 py-3 text-sm text-gray-400"
                      >
                        <span className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full typing-dot" />
                          <span className="w-1.5 h-1.5 bg-primary rounded-full typing-dot" />
                          <span className="w-1.5 h-1.5 bg-primary rounded-full typing-dot" />
                        </span>
                        thinking...
                      </motion.div>
                    )}
                    {aiAnswer && !thinking && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-3 mb-3 mt-1 p-3 rounded-lg bg-gray-50 dark:bg-gray-900/60 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-line max-h-48 overflow-y-auto"
                      >
                        {aiAnswer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {!query.trim() && (
                <div className="p-2 border-t border-gray-100 dark:border-white/10">
                  <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Quick Actions
                  </p>
                  <button
                    onClick={openJobMatch}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-secondary hover:bg-secondary/10 transition-colors"
                  >
                    <HiOutlineClipboardCheck className="w-4 h-4 shrink-0" />
                    Match a job description
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      setTerminalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-gray-600 dark:text-gray-300 hover:bg-primary/10 transition-colors"
                  >
                    <span className="w-4 text-center font-mono text-xs shrink-0">&gt;_</span>
                    Open terminal <kbd className="ml-auto text-[10px] opacity-60 border border-current/30 rounded px-1">`</kbd>
                  </button>
                  {semStatus.state !== 'ready' && (
                    <button
                      onClick={turnOnSemantic}
                      disabled={semStatus.state === 'loading'}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-secondary hover:bg-secondary/10 transition-colors disabled:opacity-70"
                    >
                      <HiSparkles className="w-4 h-4 shrink-0" />
                      {semStatus.state === 'loading'
                        ? `Loading smart search… ${Math.round(semStatus.progress)}%`
                        : semStatus.state === 'error'
                          ? "Couldn't load — tap to retry smart search"
                          : 'Enable smart search (~23 MB, runs on your device)'}
                    </button>
                  )}
                  <p className="px-3 pt-3 pb-1 text-xs text-gray-400">
                    Or ask a question like{' '}
                    <span className="italic">&ldquo;what has he built with AI?&rdquo;</span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
