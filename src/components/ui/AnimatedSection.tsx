import { ReactNode, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/**
 * Reveals content with a continuous, scroll-scrubbed 3D transform — opacity,
 * scale and a slight forward tilt are driven directly by how far the element
 * has travelled through the bottom half of the viewport, rather than a
 * one-shot triggered fade. That's what gives scrolling itself a sense of
 * depth ("the page is a camera moving through a scene") instead of content
 * just blinking in.
 */
export const AnimatedSection = ({
  children,
  className = '',
  delay = 0,
}: AnimatedSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 95%', 'start 55%'],
  });

  // `delay` shifts where each element's own reveal window starts within its
  // own scroll range, which staggers siblings (e.g. cards in a grid) without
  // resorting to a time-based delay that would fight the scroll-scrub.
  const start = Math.min(delay, 0.7);
  const opacity = useTransform(scrollYProgress, [start, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [start, 1], [70, 0]);
  const scale = useTransform(scrollYProgress, [start, 1], [0.92, 1]);
  const rotateX = useTransform(scrollYProgress, [start, 1], [10, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y, scale, rotateX, transformPerspective: 1200 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
