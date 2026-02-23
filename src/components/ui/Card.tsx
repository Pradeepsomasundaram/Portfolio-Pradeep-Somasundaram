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

  const baseClasses =
    'relative overflow-hidden bg-white dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700/50 rounded-lg p-6 transition-all duration-300';
  const shadowClasses = 'shadow-md';
  const hoverClasses = hover
    ? 'hover:shadow-lg hover:shadow-primary/10 transform hover:-translate-y-1 hover:border-gray-300 dark:hover:border-gray-600/50'
    : '';
  const cursorClass = onClick ? 'cursor-pointer' : '';

  return (
    <motion.div
      ref={cardRef}
      className={`${baseClasses} ${shadowClasses} ${hoverClasses} ${cursorClass} ${className}`}
      whileHover={hover && onClick ? { scale: 1.02 } : undefined}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {hover && isHovered && (
        <div
          className="pointer-events-none absolute w-64 h-64 rounded-full opacity-15 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
            left: glowPosition.x - 128,
            top: glowPosition.y - 128,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
