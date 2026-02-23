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
    }),
    {
      name: 'portfolio-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);