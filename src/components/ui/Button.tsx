import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: ReactNode;
  href?: string;
  download?: boolean | string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  href,
  download,
  className = '',
  onClick,
  disabled,
}: ButtonProps) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-300 cursor-pointer';

  const variantClasses = {
    primary:
      'bg-primary text-white hover:bg-opacity-90 shadow-md hover:shadow-lg',
    secondary:
      'bg-secondary text-white hover:bg-opacity-90 shadow-md hover:shadow-lg',
    outline:
      'border-2 border-primary text-primary hover:bg-primary hover:text-white',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <motion.a
        href={href}
        download={download}
        className={classes}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        target={download ? undefined : '_blank'}
        rel={download ? undefined : 'noopener noreferrer'}
      >
        {icon}
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
      {children}
    </motion.button>
  );
};