import { create } from 'zustand';
import { io } from 'socket.io-client';

const useSocketStore = create((set) => ({
  socket: null,
  isConnected: false,
  initSocket: (token) => {
    const socket = io('http://localhost:3001', {
      query: { token }
    });
    socket.on('connect', () => set({ isConnected: true }));
    socket.on('disconnect', () => set({ isConnected: false }));
    set({ socket });
  },
  disconnectSocket: () => {
    set((state) => {
      if (state.socket) {
        state.socket.disconnect();
      }
      return { socket: null, isConnected: false };
    });
  }
}));

export default useSocketStore;
