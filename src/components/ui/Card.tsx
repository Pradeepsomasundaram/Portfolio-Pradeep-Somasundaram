import { ReactNode, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const Card = ({
  children,
  className = '',
  hover = true,
  onClick,
}: CardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !hover) return;
    const rect = cardRef.current.getBoundingClientRect();
    setGlowPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const cursorClass = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`relative rounded-lg p-[1px] transition-all duration-300 ${
        hover && isHovered
          ? 'bg-gradient-to-r from-primary via-secondary to-accent shadow-glow'
          : 'bg-gray-200 dark:bg-white/10'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        ref={cardRef}
        className={`relative overflow-hidden bg-white dark:bg-void-card/95 backdrop-blur-sm rounded-[7px] p-6 transition-all duration-300 ${
          hover ? 'transform hover:-translate-y-0.5' : ''
        } ${cursorClass} ${className}`}
        whileHover={hover && onClick ? { scale: 1.02 } : undefined}
        onClick={onClick}
        onMouseMove={handleMouseMove}
      >
        {hover && isHovered && (
          <div
            className="pointer-events-none absolute w-64 h-64 rounded-full opacity-20 transition-opacity duration-300"
            style={{
              background: 'radial-gradient(circle, rgba(201, 162, 39, 0.5) 0%, transparent 70%)',
              left: glowPosition.x - 128,
              top: glowPosition.y - 128,
            }}
          />
        )}
        <div className="relative z-10">{children}</div>
      </motion.div>
    </div>
  );
};
