import { useEffect, useState } from 'react';

/**
 * A cinematic diagonal light beam that sweeps across the entire page on a
 * loop — the kind of bold, unmistakable motion a subtle scroll-linked
 * gradient can't deliver. Purely decorative, sits above page content
 * (pointer-events disabled) so it reads clearly instead of getting lost
 * behind cards and text.
 */
export const LightSweep = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 z-[45] overflow-hidden pointer-events-none mix-blend-screen">
      <div className="absolute top-[-50vh] left-[-30vw] h-[220vh] w-[26vw] blur-2xl bg-gradient-to-r from-transparent via-primary/70 to-transparent animate-light-sweep" />
      <div className="absolute top-[-50vh] left-[-30vw] h-[220vh] w-[5vw] bg-gradient-to-r from-transparent via-white/80 to-transparent animate-light-sweep" />
      <div className="absolute top-[-50vh] left-[-30vw] h-[220vh] w-[18vw] blur-2xl bg-gradient-to-r from-transparent via-secondary/70 to-transparent animate-light-sweep-delayed" />
    </div>
  );
};
