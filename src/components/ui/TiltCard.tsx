import { ReactNode, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
  scale?: number;
}

/**
 * Wraps content in a mouse-tracked 3D tilt with an optional glare sweep.
 * Pointer math is skipped on touch devices — tilt only makes sense with a mouse.
 */
export const TiltCard = ({
  children,
  className = '',
  maxTilt = 12,
  glare = true,
  scale = 1.03,
}: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { stiffness: 150, damping: 15, mass: 0.5 };
  const rotateX = useSpring(useTransform(y, [0, 1], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(x, [0, 1], [-maxTilt, maxTilt]), springConfig);
  const glareX = useTransform(x, [0, 1], ['0%', '100%']);
  const glareY = useTransform(y, [0, 1], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    setHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative [perspective:1000px] ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, scale: hovered ? scale : 1, transformStyle: 'preserve-3d' }}
      transition={{ scale: { type: 'spring', stiffness: 300, damping: 20 } }}
    >
      {children}
      {glare && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0"
          animate={{ opacity: hovered ? 0.5 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            background: 'radial-gradient(circle at var(--gx) var(--gy), rgba(255,255,255,0.35), transparent 60%)',
            ['--gx' as string]: glareX,
            ['--gy' as string]: glareY,
          }}
        />
      )}
    </motion.div>
  );
};
