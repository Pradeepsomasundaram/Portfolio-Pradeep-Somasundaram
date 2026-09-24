import { ReactNode, useEffect, useState } from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { Chatbot } from '../sections/Chatbot';
import {
  ParticleBackground,
  BackToTop,
  CursorSpotlight,
  CommandPalette,
  CustomCursor,
  BootIntro,
  CinematicBackground,
  PersonaPicker,
  Terminal,
} from '../ui';
import { useAppStore } from '../../stores/appStore';
import { visitContext } from '../../lib/visitContext';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { theme, commandPaletteOpen, toggleCommandPalette, setCommandPaletteOpen } = useAppStore();

  // Ambient particles are decoration: start them once the page has settled so they
  // never compete with first paint or input responsiveness
  const [particlesReady, setParticlesReady] = useState(false);
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const start = () => setParticlesReady(true);
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(start, { timeout: 3000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = setTimeout(start, 2000);
    return () => clearTimeout(t);
  }, []);

  // A personalised link (?for=acme&role=ml) pre-tunes the site for that visitor
  useEffect(() => {
    if (visitContext.persona) useAppStore.getState().setPersona(visitContext.persona);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommandPalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCommandPalette]);

  return (
    <div className={`relative min-h-screen ${theme === 'dark' ? 'bg-void' : 'bg-gray-50'}`}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>
      <BootIntro />
      {theme === 'dark' && <CinematicBackground />}
      {theme === 'dark' && particlesReady && <ParticleBackground />}
      <CursorSpotlight />
      <CustomCursor />
      <div className="grain-overlay" />
      <div className="relative z-10">
        <Navigation />
        <main id="main-content">{children}</main>
        <Footer />
        <Chatbot />
        <PersonaPicker />
        <Terminal />
        <BackToTop />
        <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
      </div>
    </div>
  );
};
