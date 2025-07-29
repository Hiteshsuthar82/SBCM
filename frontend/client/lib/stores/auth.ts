import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Admin } from "../types";

interface AuthState {
  user: User | null;
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;

  setUser: (user: User) => void;
  setAdmin: (admin: Admin) => void;
  setToken: (token: string) => void;
  logout: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      admin: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,

      setUser: (user: User) =>
        set(() => ({
          user,
          admin: null,
          isAuthenticated: true,
          isAdmin: false,
        })),

      setAdmin: (admin: Admin) =>
        set(() => ({
          admin,
          user: null,
          isAuthenticated: true,
          isAdmin: true,
        })),

      setToken: (token: string) => set(() => ({ token })),

      logout: () =>
        set(() => ({
          user: null,
          admin: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
        })),

      clearAuth: () =>
        set(() => ({
          user: null,
          admin: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
        })),
    }),
    {
      name: "sbcms-auth",
      partialize: (state) => ({
        user: state.user,
        admin: state.admin,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    },
  ),
);
