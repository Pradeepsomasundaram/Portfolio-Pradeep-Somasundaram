import { motion } from 'framer-motion';

interface DoodleProps {
  className?: string;
  color?: string;
}

/**
 * Small hand-drawn-style flourishes — the one deliberate nod to the
 * scrapbook/sketch reference alongside the cinematic 3D theme. Used
 * sparingly as accents, not a theme of their own.
 */
export const DoodleUnderline = ({ className = '', color = 'currentColor' }: DoodleProps) => (
  <svg viewBox="0 0 200 20" className={className} fill="none" aria-hidden="true">
    <motion.path
      d="M2 12 Q 40 3, 80 10 T 160 7 Q 182 6, 198 13"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
    />
  </svg>
);

export const DoodleCircle = ({ className = '', color = 'currentColor' }: DoodleProps) => (
  <svg
    viewBox="0 0 120 60"
    className={className}
    fill="none"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <motion.path
      d="M60 4 C 22 3, 4 18, 7 31 C 10 45, 28 56, 61 56 C 96 56, 114 44, 113 29 C 112 14, 94 3, 58 6"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      whileInView={{ pathLength: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
    />
  </svg>
);
