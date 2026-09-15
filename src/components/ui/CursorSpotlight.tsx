import { useEffect, useState } from 'react';
import { motion, useMotionValue, useMotionTemplate, useSpring } from 'framer-motion';

/**
 * A soft light that follows the cursor across the whole page, desktop-only.
 * Purely decorative (pointer-events: none) — gives scroll/hover moments a
 * "living" background without competing with content contrast.
 */
export const CursorSpotlight = () => {
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const springX = useSpring(x, { stiffness: 60, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 60, damping: 20, mass: 0.5 });
  const background = useMotionTemplate`radial-gradient(650px circle at ${springX}px ${springY}px, rgba(201,162,39,0.4), transparent 70%)`;

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;
    setEnabled(true);

    const handleMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[1] mix-blend-soft-light"
      style={{ background }}
    />
  );
};
