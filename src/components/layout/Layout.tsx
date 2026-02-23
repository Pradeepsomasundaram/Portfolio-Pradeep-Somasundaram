import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { Chatbot } from '../sections/Chatbot';
import { ScrollToTop, PageTransition, ParticleBackground, BackToTop } from '../ui';
import { useAppStore } from '../../stores/appStore';

export const Layout = () => {
  const location = useLocation();
  const { theme } = useAppStore();

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>
      {theme === 'dark' && <ParticleBackground />}
      <div className="relative z-10">
        <Navigation />
        <ScrollToTop />
        <main id="main-content" className="pt-16">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
        <Footer />
        <Chatbot />
        <BackToTop />
      </div>
    </div>
  );
};
