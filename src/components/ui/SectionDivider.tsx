import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

/**
 * A thin animated seam between sections — replaces the old flat
 * alternating-background blocks (which read as separate "pages" once the
 * site became one continuous scroll) with a single light punctuation mark.
 */
export const SectionDivider = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });

  return (
    <div ref={ref} className="relative max-w-4xl mx-auto px-4 py-2" aria-hidden="true">
      <div className="flex items-center gap-4">
        <motion.div
          className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/40"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8 }}
          style={{ transformOrigin: 'right' }}
        />
        <motion.div
          className="w-2 h-2 rounded-full bg-gradient-to-br from-primary to-secondary shrink-0"
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.4 }}
        />
        <motion.div
          className="h-px flex-1 bg-gradient-to-l from-transparent to-secondary/40"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8 }}
          style={{ transformOrigin: 'left' }}
        />
      </div>
    </div>
  );
};
