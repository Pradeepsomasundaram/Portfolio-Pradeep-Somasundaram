import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppStore {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;

  activeFilter: string | null;
  setActiveFilter: (filter: string | null) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  chatbotOpen: boolean;
  toggleChatbot: () => void;
  setChatbotOpen: (open: boolean) => void;

  commandPaletteOpen: boolean;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;

  jobMatchRequested: boolean;
  requestJobMatch: () => void;
  clearJobMatchRequest: () => void;

  /** Set by the assistant (or anything else) to open a project's detail modal. */
  focusProjectId: string | null;
  openProject: (id: string) => void;
  clearFocusProject: () => void;

  terminalOpen: boolean;
  setTerminalOpen: (open: boolean) => void;

  /** Role the visitor is hiring for; tunes which projects/skills are highlighted. */
  persona: string | null;
  setPersona: (persona: string | null) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
      setTheme: (theme) => set({ theme }),

      activeFilter: null,
      setActiveFilter: (filter) => set({ activeFilter: filter }),

      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      chatbotOpen: false,
      toggleChatbot: () =>
        set((state) => ({ chatbotOpen: !state.chatbotOpen })),
      setChatbotOpen: (open) => set({ chatbotOpen: open }),

      commandPaletteOpen: false,
      toggleCommandPalette: () =>
        set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      jobMatchRequested: false,
      requestJobMatch: () => set({ chatbotOpen: true, jobMatchRequested: true }),
      clearJobMatchRequest: () => set({ jobMatchRequested: false }),

      focusProjectId: null,
      openProject: (id) => set({ focusProjectId: id }),
      clearFocusProject: () => set({ focusProjectId: null }),

      terminalOpen: false,
      setTerminalOpen: (open) => set({ terminalOpen: open }),

      persona: null,
      setPersona: (persona) => set({ persona }),
    }),
    {
      name: 'portfolio-storage',
      partialize: (state) => ({ theme: state.theme, persona: state.persona }),
    }
  )
);