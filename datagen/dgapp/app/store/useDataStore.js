import { create } from 'zustand';

export const useDataStore = create((set) => ({
  data: null,
  mongoData: null,
  setData: (data) => set({ data }),
  setMongoData: (mongoData) => set({ mongoData }),
}));
