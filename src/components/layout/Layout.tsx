import { ReactNode, Suspense, lazy, useEffect, useState } from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import {
  ParticleBackground,
  BackToTop,
  CursorSpotlight,
  CustomCursor,
  BootIntro,
  CinematicBackground,
  PersonaPicker,
} from '../ui';
import { useAppStore } from '../../stores/appStore';
import { visitContext } from '../../lib/visitContext';

// Interaction-triggered UI. None of it is needed for first paint, and together with the
// assistant engine it pulls in (~55 KB minified) it was inflating the entry chunk, so each
// loads as its own chunk once the page is idle — or immediately if the visitor asks for it first.
const Chatbot = lazy(() => import('../sections/Chatbot').then((m) => ({ default: m.Chatbot })));
const CommandPalette = lazy(() => import('../ui/CommandPalette').then((m) => ({ default: m.CommandPalette })));
const Terminal = lazy(() => import('../ui/Terminal').then((m) => ({ default: m.Terminal })));

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { theme, commandPaletteOpen, toggleCommandPalette, setCommandPaletteOpen, chatbotOpen, terminalOpen } = useAppStore();

  // Ambient particles and the lazy overlays below are not needed for first paint: start them
  // once the page has settled so they never compete with first paint or input responsiveness
  const [idleReady, setIdleReady] = useState(false);
  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const start = () => setIdleReady(true);
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
    if (!visitContext.company) return;
    // Let the owner know the link was opened (company/role labels only), once per tab session
    try {
      if (sessionStorage.getItem('link-visit-sent')) return;
      sessionStorage.setItem('link-visit-sent', '1');
    } catch { /* storage blocked: send anyway */ }
    fetch('/.netlify/functions/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: visitContext.company, role: visitContext.persona ?? '' }),
      keepalive: true,
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }
      // Backtick opens the terminal (unless the visitor is typing in a field). This lives here, not
      // in the lazy Terminal, so the shortcut works even before the Terminal chunk has loaded.
      const el = e.target as HTMLElement;
      const typing = el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable;
      if (e.key === '`' && !typing && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const { terminalOpen: open, setTerminalOpen } = useAppStore.getState();
        setTerminalOpen(!open);
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
      {theme === 'dark' && idleReady && <ParticleBackground />}
      <CursorSpotlight />
      <CustomCursor />
      <div className="grain-overlay" />
      <div className="relative z-10">
        <Navigation />
        <main id="main-content">{children}</main>
        <Footer />
        <PersonaPicker />
        <BackToTop />
        <Suspense fallback={null}>
          {(idleReady || chatbotOpen) && <Chatbot />}
          {(idleReady || terminalOpen) && <Terminal />}
          {(idleReady || commandPaletteOpen) && (
            <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
          )}
        </Suspense>
      </div>
    </div>
  );
};
