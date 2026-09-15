import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Replaces the system cursor with a dot + trailing ring, desktop-only.
 * The ring scales and tints when hovering anything clickable, signalling
 * interactivity before the user even clicks.
 */
export const CustomCursor = () => {
  const [enabled, setEnabled] = useState(false);
  const [hoveringLink, setHoveringLink] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 300, damping: 30, mass: 0.4 });
  const ringY = useSpring(y, { stiffness: 300, damping: 30, mass: 0.4 });

  useEffect(() => {
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!isFinePointer || reducedMotion) return;
    setEnabled(true);
    document.documentElement.classList.add('custom-cursor-active');

    const handleMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!visible) setVisible(true);
      const target = e.target as HTMLElement;
      setHoveringLink(!!target.closest('a, button, [role="button"], input, textarea'));
    };
    const handleLeave = () => setVisible(false);

    window.addEventListener('mousemove', handleMove);
    document.documentElement.addEventListener('mouseleave', handleLeave);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      document.documentElement.removeEventListener('mouseleave', handleLeave);
      document.documentElement.classList.remove('custom-cursor-active');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!enabled) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[200] rounded-full bg-primary"
        animate={{ opacity: visible ? 1 : 0, scale: hoveringLink ? 0 : 1 }}
        transition={{ duration: 0.15 }}
        style={{ x, y, width: 8, height: 8, translateX: '-50%', translateY: '-50%' }}
      />
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[200] rounded-full border-2"
        animate={{
          opacity: visible ? 1 : 0,
          scale: hoveringLink ? 1.8 : 1,
          borderColor: hoveringLink ? 'rgba(232,200,116,0.9)' : 'rgba(201,162,39,0.7)',
          backgroundColor: hoveringLink ? 'rgba(232,200,116,0.12)' : 'rgba(201,162,39,0)',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
        style={{ x: ringX, y: ringY, width: 32, height: 32, translateX: '-50%', translateY: '-50%' }}
      />
    </>
  );
};
