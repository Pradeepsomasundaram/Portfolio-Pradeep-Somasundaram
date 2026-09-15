import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * A fixed, full-page layer of large blurred color fields that drift and
 * shift hue as the whole document scrolls — parallax "chapters" of color
 * (gold near the top, emerald mid-page, champagne toward the bottom)
 * instead of a static backdrop. This is what gives scrolling a cinematic,
 * video-like sense of motion rather than a flat page moving past a fixed
 * picture.
 */
export const CinematicBackground = () => {
  const { scrollYProgress } = useScroll();
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '-35%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const y3 = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);

  const opacity1 = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [0.75, 0.3, 0.15, 0.5]);
  const opacity2 = useTransform(scrollYProgress, [0, 0.3, 0.55, 0.85, 1], [0.15, 0.55, 0.75, 0.45, 0.2]);
  const opacity3 = useTransform(scrollYProgress, [0, 0.5, 0.75, 1], [0.15, 0.3, 0.6, 0.75]);

  const rotate = useTransform(scrollYProgress, [0, 1], [0, 25]);

  if (reduced) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[42rem] h-[42rem] rounded-full blur-[100px] bg-primary"
        style={{ top: '-5%', left: '-10%', y: y1, opacity: opacity1, rotate }}
      />
      <motion.div
        className="absolute w-[38rem] h-[38rem] rounded-full blur-[100px] bg-secondary"
        style={{ top: '55%', right: '-15%', y: y2, opacity: opacity2 }}
      />
      <motion.div
        className="absolute w-[34rem] h-[34rem] rounded-full blur-[100px] bg-accent"
        style={{ top: '120%', left: '15%', y: y3, opacity: opacity3 }}
      />
    </div>
  );
};
