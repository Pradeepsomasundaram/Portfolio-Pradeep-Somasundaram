import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiMoon, HiSun, HiChevronDown } from 'react-icons/hi';
import { useAppStore } from '../../stores/appStore';

const primaryNav = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Experience', to: '/experience' },
  { label: 'Projects', to: '/projects' },
  { label: 'Skills', to: '/skills' },
  { label: 'Contact', to: '/contact' },
];

const moreNav = [
  { label: 'Education', to: '/education' },
  { label: 'Certifications', to: '/certifications' },
  { label: 'Publications', to: '/publications' },
  { label: 'Awards', to: '/awards' },
  { label: 'Volunteering', to: '/volunteering' },
  { label: 'Organizations', to: '/organizations' },
];

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useAppStore();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setMoreOpen(false);
  }, [location.pathname]);

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname === to;
  };

  const isMoreActive = moreNav.some((item) => location.pathname === item.to);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || location.pathname !== '/'
          ? 'bg-white dark:bg-gray-900 shadow-lg'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }}>
            <Link to="/" className="text-2xl font-bold text-primary">
              Pradeep S.
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {primaryNav.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`transition-colors duration-300 ${
                  isActive(item.to)
                    ? 'text-primary font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* More Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button
                className={`flex items-center gap-1 transition-colors duration-300 ${
                  isMoreActive
                    ? 'text-primary font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
                }`}
              >
                More
                <HiChevronDown
                  className={`w-4 h-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 overflow-hidden"
                  >
                    {moreNav.map((item) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          isActive(item.to)
                            ? 'text-primary bg-primary bg-opacity-10 font-semibold'
                            : 'text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <HiMoon className="w-5 h-5" />
              ) : (
                <HiSun className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <HiMoon className="w-5 h-5" />
              ) : (
                <HiSun className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 dark:text-gray-300"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <HiX className="w-6 h-6" />
              ) : (
                <HiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden bg-white dark:bg-gray-900 shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {primaryNav.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`block px-3 py-2 rounded-md transition-colors ${
                    isActive(item.to)
                      ? 'text-primary bg-primary bg-opacity-10 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {/* More section in mobile */}
              <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                <p className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  More
                </p>
                {moreNav.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={`block px-3 py-2 rounded-md transition-colors ${
                      isActive(item.to)
                        ? 'text-primary bg-primary bg-opacity-10 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
