import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { visitContext } from '../../lib/visitContext';

const bootLines = [
  '> initializing portfolio_ai.core',
  '> loading neural profile... pradeep_somasundaram.json',
  '> indexing experience, projects, skills [ok]',
  '> compiling interface... done',
];

const STORAGE_KEY = 'portfolio-boot-seen';

/**
 * Brief terminal-style boot sequence on a visitor's first load this session.
 * Kept to about a second, skippable with a click or key, and never shown to
 * visitors arriving through a personalised link (they're here to evaluate, so
 * nothing should sit between them and the content).
 */
export const BootIntro = () => {
  const [show, setShow] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const seen = sessionStorage.getItem(STORAGE_KEY);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (seen || reducedMotion || visitContext.company) return;
    setShow(true);
    sessionStorage.setItem(STORAGE_KEY, '1');
  }, []);

  useEffect(() => {
    if (!show) return;
    if (lineIndex >= bootLines.length) {
      const timeout = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setLineIndex((i) => i + 1), 140);
    return () => clearTimeout(timeout);
  }, [show, lineIndex]);

  // Any key dismisses it too
  useEffect(() => {
    if (!show) return;
    const onKey = () => setShow(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center bg-void px-6"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => setShow(false)}
        >
          <div className="w-full max-w-md font-mono text-sm text-secondary">
            {bootLines.slice(0, lineIndex).map((line, i) => (
              <p key={i} className="mb-2 opacity-90">
                {line}
              </p>
            ))}
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden mt-4">
              <motion.div
                className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
                initial={{ width: '0%' }}
                animate={{ width: `${(lineIndex / bootLines.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <button
              onClick={() => setShow(false)}
              className="mt-6 text-xs text-gray-500 hover:text-secondary transition-colors"
            >
              Skip intro →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
