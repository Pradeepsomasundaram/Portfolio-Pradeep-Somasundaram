import { motion } from 'framer-motion';

interface BadgeProps {
  text: string;
  color?: string;
  className?: string;
}

const techColors: Record<string, string> = {
  Python: 'bg-blue-500',
  JavaScript: 'bg-yellow-500',
  TypeScript: 'bg-blue-600',
  React: 'bg-cyan-500',
  'Node.js': 'bg-green-600',
  TensorFlow: 'bg-orange-500',
  PyTorch: 'bg-red-500',
  AWS: 'bg-orange-600',
  GCP: 'bg-blue-400',
  Azure: 'bg-blue-700',
  SQL: 'bg-purple-500',
  MongoDB: 'bg-green-500',
  Docker: 'bg-blue-500',
  Kubernetes: 'bg-blue-600',
  'Machine Learning': 'bg-indigo-500',
  'Data Science': 'bg-purple-600',
  'Full Stack': 'bg-teal-500',
};

export const Badge = ({ text, color, className = '' }: BadgeProps) => {
  const bgColor = color || techColors[text] || 'bg-gray-500';

  return (
    <motion.span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${bgColor} ${className}`}
      whileHover={{ scale: 1.1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {text}
    </motion.span>
  );
};