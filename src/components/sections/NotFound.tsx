import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiHome, HiSearch } from 'react-icons/hi';

const suggestedPages = [
  { label: 'About', to: '/about' },
  { label: 'Experience', to: '/experience' },
  { label: 'Projects', to: '/projects' },
  { label: 'Skills', to: '/skills' },
  { label: 'Education', to: '/education' },
  { label: 'Contact', to: '/contact' },
];

export const NotFound = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filtered = search
    ? suggestedPages.filter((p) =>
        p.label.toLowerCase().includes(search.toLowerCase())
      )
    : suggestedPages;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (filtered.length === 1) {
      navigate(filtered[0].to);
    } else if (filtered.length > 0) {
      navigate(filtered[0].to);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        className="text-center max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1
          className="text-8xl md:text-9xl font-bold text-primary mb-4"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          404
        </motion.h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-sm mx-auto">
            <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search pages..."
              className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </form>

        {/* Suggested Pages */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 font-medium">
            {search ? 'Matching pages:' : 'Try one of these pages:'}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {filtered.map((page) => (
              <motion.button
                key={page.to}
                onClick={() => navigate(page.to)}
                className="px-4 py-2 rounded-full border border-primary/30 text-primary hover:bg-primary hover:text-white transition-colors text-sm font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {page.label}
              </motion.button>
            ))}
            {filtered.length === 0 && (
              <p className="text-gray-400 text-sm">No matching pages found.</p>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <HiHome className="w-5 h-5" />
          Back to Home
        </button>
      </motion.div>
    </section>
  );
};
