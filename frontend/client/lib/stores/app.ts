import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LANGUAGES } from "../constants";

interface AppState {
  theme: "light" | "dark" | "system";
  language: string;
  isOnline: boolean;
  sidebarOpen: boolean;

  setTheme: (theme: "light" | "dark" | "system") => void;
  setLanguage: (language: string) => void;
  setIsOnline: (isOnline: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: "system",
      language: LANGUAGES.EN,
      isOnline: true,
      sidebarOpen: false,

      setTheme: (theme) => set(() => ({ theme })),
      setLanguage: (language) => set(() => ({ language })),
      setIsOnline: (isOnline) => set(() => ({ isOnline })),
      setSidebarOpen: (sidebarOpen) => set(() => ({ sidebarOpen })),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: "sbcms-app",
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
      }),
    },
  ),
);
