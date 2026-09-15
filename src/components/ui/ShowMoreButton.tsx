import { motion } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi';

interface ShowMoreButtonProps {
  expanded: boolean;
  onClick: () => void;
  hiddenCount: number;
  itemLabel?: string;
}

export const ShowMoreButton = ({ expanded, onClick, hiddenCount, itemLabel = 'more' }: ShowMoreButtonProps) => {
  return (
    <div className="flex justify-center mt-8">
      <motion.button
        onClick={onClick}
        className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-primary/30 text-primary dark:text-secondary text-sm font-medium hover:bg-primary/10 hover:shadow-glow transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {expanded ? 'Show less' : `Show ${hiddenCount} ${itemLabel}`}
        <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <HiChevronDown className="w-4 h-4" />
        </motion.span>
      </motion.button>
    </div>
  );
};
