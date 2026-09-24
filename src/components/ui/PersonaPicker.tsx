import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';
import { useAppStore } from '../../stores/appStore';
import { personas } from '../../lib/persona';

const DISMISS_KEY = 'persona-dismissed';

/** Asks first-time visitors what they're hiring for, then tunes the Projects
 * section to that role. Stays as a small "tuned for" chip so it can be undone. */
export const PersonaPicker = () => {
  const { persona, setPersona } = useAppStore();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch { /* storage blocked */ }
    if (persona || dismissed) return;
    const t = setTimeout(() => setShowPrompt(true), 6000);
    return () => clearTimeout(t);
  }, [persona]);

  const dismiss = () => {
    setShowPrompt(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch { /* storage blocked */ }
  };

  const choose = (label: string) => {
    setPersona(label);
    setShowPrompt(false);
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="fixed bottom-24 left-4 sm:bottom-6 sm:left-24 z-40 max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-12rem)]">
      <AnimatePresence mode="wait">
        {showPrompt && !persona && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="glass-panel rounded-2xl shadow-glow p-3 sm:p-4 w-full sm:w-72"
            role="dialog"
            aria-label="Tailor this portfolio"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">What are you hiring for?</p>
              <button onClick={dismiss} aria-label="Dismiss" className="text-gray-400 hover:text-primary -mt-1">
                <HiX className="w-4 h-4" />
              </button>
            </div>
            <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 mb-3">I'll surface the most relevant projects first.</p>
            <div className="flex flex-wrap gap-1.5">
              {personas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => choose(p.label)}
                  className="text-xs px-3 py-1.5 rounded-full border border-primary/40 text-primary hover:bg-primary hover:text-void transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
        {persona && (
          <motion.button
            key="chip"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onClick={() => setPersona(null)}
            className="glass-panel rounded-full pl-3 pr-2 py-1.5 text-xs text-gray-700 dark:text-gray-200 inline-flex items-center gap-2 hover:text-primary transition-colors"
            aria-label={`Tuned for ${persona}. Click to clear.`}
          >
            <span>
              Tuned for <b className="text-primary">{persona}</b>
            </span>
            <HiX className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
