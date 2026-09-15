import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiMoon, HiSun, HiChevronDown, HiSparkles } from 'react-icons/hi';
import { useAppStore } from '../../stores/appStore';

const primaryNav = [
  { label: 'Home', id: 'hero' },
  { label: 'About', id: 'about' },
  { label: 'Experience', id: 'experience' },
  { label: 'Projects', id: 'projects' },
  { label: 'Skills', id: 'skills' },
  { label: 'Contact', id: 'contact' },
];

const moreNav = [
  { label: 'Education', id: 'education' },
  { label: 'The Toolkit', id: 'universe' },
  { label: 'Certifications', id: 'certifications' },
  { label: 'Publications', id: 'publications' },
  { label: 'Awards', id: 'awards' },
  { label: 'Volunteering', id: 'volunteering' },
  { label: 'Organizations', id: 'organizations' },
  { label: 'Testimonials', id: 'testimonials' },
];

const allSectionIds = [...primaryNav, ...moreNav].map((item) => item.id);

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const { theme, toggleTheme, toggleCommandPalette } = useAppStore();

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scrollspy: highlight whichever section is crossing the middle band of the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    allSectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
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

  const isActive = (id: string) => activeSection === id;
  const isMoreActive = moreNav.some((item) => isActive(item.id));

  const closeMenus = () => {
    setIsOpen(false);
    setMoreOpen(false);
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Scroll Progress Bar */}
      <div
        className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-primary via-secondary to-accent no-theme-transition z-10"
        style={{ width: `${scrollProgress}%` }}
      />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-3">
        <div className="glass-panel rounded-2xl sm:rounded-full shadow-glow px-4 sm:px-5 h-14 flex items-center justify-between">
          <motion.a href="#hero" whileHover={{ scale: 1.05 }}>
            <span className="text-lg sm:text-xl font-display font-bold heading-shimmer whitespace-nowrap">
              Pradeep Somasundaram
            </span>
          </motion.a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-0.5">
            {primaryNav.map((item) => (
              <a
                key={item.label}
                href={`#${item.id}`}
                className="relative px-3.5 py-2 rounded-full transition-colors duration-300"
              >
                {isActive(item.id) && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/25 via-secondary/20 to-accent/25 border border-primary/40"
                    layoutId="navIndicator"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 text-sm ${
                  isActive(item.id)
                    ? 'text-white dark:text-white font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-secondary'
                }`}>
                  {item.label}
                </span>
              </a>
            ))}

            {/* More Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button
                className="relative flex items-center gap-1 px-3.5 py-2 rounded-full transition-colors duration-300"
              >
                {isMoreActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/25 via-secondary/20 to-accent/25 border border-primary/40"
                    layoutId="navIndicator"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 flex items-center gap-1 text-sm ${
                  isMoreActive
                    ? 'text-white font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-secondary'
                }`}>
                  More
                  <HiChevronDown
                    className={`w-4 h-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`}
                  />
                </span>
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-52 glass-panel rounded-xl shadow-glow py-2 overflow-hidden"
                  >
                    {moreNav.map((item) => (
                      <a
                        key={item.label}
                        href={`#${item.id}`}
                        className={`block px-4 py-2 text-sm transition-colors ${
                          isActive(item.id)
                            ? 'text-secondary bg-primary/10 font-semibold'
                            : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-secondary hover:bg-primary/5'
                        }`}
                      >
                        {item.label}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* AI Command Palette trigger */}
            <motion.button
              onClick={toggleCommandPalette}
              className="ml-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/20 via-secondary/10 to-accent/20 border border-primary/40 text-primary dark:text-secondary text-sm hover:shadow-glow transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Open AI search"
            >
              <HiSparkles className="w-4 h-4" />
              Ask AI
              <kbd className="text-[10px] opacity-70 border border-current/30 rounded px-1">⌘K</kbd>
            </motion.button>

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors ml-2"
              aria-label="Toggle theme"
              whileTap={{ scale: 0.9, rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'light' ? (
                <HiMoon className="w-5 h-5" />
              ) : (
                <HiSun className="w-5 h-5" />
              )}
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <motion.button
              onClick={toggleCommandPalette}
              className="p-2 rounded-full bg-white/10 text-primary dark:text-secondary"
              aria-label="Open AI search"
              whileTap={{ scale: 0.9 }}
            >
              <HiSparkles className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/10"
              aria-label="Toggle theme"
              whileTap={{ scale: 0.9, rotate: 180 }}
            >
              {theme === 'light' ? (
                <HiMoon className="w-5 h-5" />
              ) : (
                <HiSun className="w-5 h-5" />
              )}
            </motion.button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 dark:text-gray-200 p-1"
              aria-label="Toggle menu"
            >
              {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden glass-panel rounded-2xl shadow-glow mt-2 overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="px-4 pt-3 pb-4 space-y-1 max-h-[70vh] overflow-y-auto">
                {primaryNav.map((item) => (
                  <a
                    key={item.label}
                    href={`#${item.id}`}
                    onClick={closeMenus}
                    className={`block px-3 py-2 rounded-lg transition-colors ${
                      isActive(item.id)
                        ? 'text-white bg-gradient-to-r from-primary/40 to-accent/40 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:text-primary'
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
                <div className="border-t border-white/10 mt-2 pt-2">
                  <p className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    More
                  </p>
                  {moreNav.map((item) => (
                    <a
                      key={item.label}
                      href={`#${item.id}`}
                      onClick={closeMenus}
                      className={`block px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.id)
                          ? 'text-white bg-gradient-to-r from-primary/40 to-accent/40 font-semibold'
                          : 'text-gray-700 dark:text-gray-300 hover:text-primary'
                      }`}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};
