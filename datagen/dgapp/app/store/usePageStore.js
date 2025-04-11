import { create } from "zustand";

export const usePageStore = create((set) => ({
  showFlow: false,
  businessNumber: "",
  setShowFlow: (showFlow) => set({ showFlow }),
  setBusinessNumber: (businessNumber) => set({ businessNumber }),
}));
