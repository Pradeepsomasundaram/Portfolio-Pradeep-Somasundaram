import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { Chatbot } from '../sections/Chatbot';
import { ScrollToTop, PageTransition, ParticleBackground } from '../ui';

export const Layout = () => {
  const location = useLocation();

  return (
    <div className="relative min-h-screen bg-gray-900">
      <ParticleBackground />
      <div className="relative z-10">
        <Navigation />
        <ScrollToTop />
        <main className="pt-16">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
        <Footer />
        <Chatbot />
      </div>
    </div>
  );
};
