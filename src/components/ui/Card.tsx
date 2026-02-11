import { ReactNode } from 'react';
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
  const baseClasses =
    'bg-white dark:bg-gray-800 rounded-lg p-6 transition-all duration-300';
  const shadowClasses = 'shadow-md';
  const hoverClasses = hover
    ? 'hover:shadow-lg transform hover:-translate-y-1'
    : '';
  const cursorClass = onClick ? 'cursor-pointer' : '';

  return (
    <motion.div
      className={`${baseClasses} ${shadowClasses} ${hoverClasses} ${cursorClass} ${className}`}
      whileHover={hover && onClick ? { scale: 1.02 } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};