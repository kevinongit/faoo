import { create } from 'zustand';

export const usePageStore = create((set) => ({
  showFlow: true,
  businessNumber: "",
  setShowFlow: (showFlow) => set({ showFlow }),
  setBusinessNumber: (businessNumber) => set({ businessNumber }),
}));