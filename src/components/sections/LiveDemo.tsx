import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineChip, HiOutlineLightningBolt } from 'react-icons/hi';
import { AnimatedSection } from '../ui';

// Loaded on demand from a CDN so the ~MBs of runtime never touch the main bundle.
const TRANSFORMERS_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3';
const MODEL_ID = 'Xenova/distilbert-base-uncased-finetuned-sst-2-english';

type Classifier = (text: string) => Promise<{ label: string; score: number }[]>;

const samples = [
  'The dashboard cut our reporting time in half — the team loves it.',
  'The deployment keeps failing and nobody knows why.',
  'The results were fine, nothing special.',
];

type Status =
  | { state: 'idle' }
  | { state: 'loading'; progress: number }
  | { state: 'ready' }
  | { state: 'error'; message: string };

export const LiveDemo = () => {
  const [status, setStatus] = useState<Status>({ state: 'idle' });
  const [classifier, setClassifier] = useState<Classifier | null>(null);
  const [text, setText] = useState(samples[0]);
  const [result, setResult] = useState<{ label: string; score: number; ms: number } | null>(null);
  const [running, setRunning] = useState(false);

  const loadModel = useCallback(async () => {
    setStatus({ state: 'loading', progress: 0 });
    try {
      const { pipeline } = await import(/* @vite-ignore */ TRANSFORMERS_URL);
      const files: Record<string, number> = {};
      const pipe = await pipeline('sentiment-analysis', MODEL_ID, {
        progress_callback: (p: { status: string; file?: string; progress?: number }) => {
          if (p.status === 'progress' && p.file && typeof p.progress === 'number') {
            files[p.file] = p.progress;
            const values = Object.values(files);
            setStatus({ state: 'loading', progress: values.reduce((a, b) => a + b, 0) / values.length });
          }
        },
      });
      setClassifier(() => pipe as Classifier);
      setStatus({ state: 'ready' });
    } catch (err) {
      console.error(err);
      setStatus({ state: 'error', message: "Couldn't load the model — check your connection and try again." });
    }
  }, []);

  const analyze = useCallback(async () => {
    if (!classifier || !text.trim() || running) return;
    setRunning(true);
    const start = performance.now();
    try {
      const [top] = await classifier(text.trim());
      setResult({ label: top.label, score: top.score, ms: Math.round(performance.now() - start) });
    } finally {
      setRunning(false);
    }
  }, [classifier, text, running]);

  const positive = result?.label === 'POSITIVE';

  return (
    <section id="demo" className="py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <AnimatedSection>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-2 heading-shimmer">Try It Live</h2>
          <p className="text-center font-mono text-xs text-secondary/80 mb-10">
            // a real DistilBERT model running entirely in your browser — no server, no API
          </p>

          <div className="glass-panel rounded-2xl p-6 md:p-8">
            {status.state !== 'ready' ? (
              <div className="text-center py-4">
                <HiOutlineChip className="w-10 h-10 mx-auto text-primary mb-3" />
                <p className="text-gray-600 dark:text-gray-300 mb-1">
                  Sentiment analysis with the same family of transformer models used in Pradeep's NLP projects.
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                  Downloads a ~65 MB model once (cached by your browser). Nothing you type leaves your device.
                </p>

                {status.state === 'loading' ? (
                  <div className="max-w-xs mx-auto">
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-secondary"
                        animate={{ width: `${Math.max(4, status.progress)}%` }}
                        transition={{ ease: 'easeOut' }}
                      />
                    </div>
                    <p className="mt-2 font-mono text-xs text-secondary">loading model… {Math.round(status.progress)}%</p>
                  </div>
                ) : (
                  <button
                    onClick={loadModel}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-medium bg-gradient-to-r from-primary to-accent text-void hover:shadow-glow transition-shadow"
                  >
                    <HiOutlineLightningBolt className="w-5 h-5" />
                    Load model & try it
                  </button>
                )}
                {status.state === 'error' && <p className="mt-3 text-sm text-red-400">{status.message}</p>}
              </div>
            ) : (
              <div>
                <label htmlFor="demo-text" className="block text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Type any sentence
                </label>
                <textarea
                  id="demo-text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={3}
                  maxLength={300}
                  className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-white/5 border-gray-300 dark:border-white/10 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-primary resize-none"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {samples.map((s) => (
                    <button
                      key={s}
                      onClick={() => setText(s)}
                      className="text-xs px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white transition-colors truncate max-w-[16rem]"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <button
                  onClick={analyze}
                  disabled={running || !text.trim()}
                  className="mt-5 px-6 py-2.5 rounded-full font-medium bg-gradient-to-r from-primary to-accent text-void disabled:opacity-50 hover:shadow-glow transition-shadow"
                >
                  {running ? 'Running…' : 'Analyze'}
                </button>

                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 rounded-xl border border-white/10 p-4"
                      aria-live="polite"
                    >
                      <div className="flex items-baseline justify-between mb-2">
                        <span className={`text-lg font-bold ${positive ? 'text-secondary' : 'text-red-400'}`}>
                          {positive ? 'Positive' : 'Negative'}
                        </span>
                        <span className="font-mono text-xs text-gray-400">
                          {(result.score * 100).toFixed(1)}% · {result.ms} ms on-device
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          className={`h-full ${positive ? 'bg-secondary' : 'bg-red-400'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${result.score * 100}%` }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
