// lib/store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      // initializeAuth: () => {
      //   const storedAuth = JSON.parse(localStorage.getItem('auth-storage') || '{}');
      //   if (storedAuth.state?.isAuthenticated) {
      //     set({ isAuthenticated: true, user: storedAuth.state.user });
      //   }
      // },
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage", // 로컬 스토리지 키 이름
      getStorage: () => localStorage,
    }
  )
);
