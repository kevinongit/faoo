import { create } from "zustand";
import { getChatList } from "@/lib/api";

export const useChatStore = create((set, get) => ({
  chatList: [],
  selectedChatId: null,
  isLoading: false,
  error: null,

  fetchChatList: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const chatList = await getChatList(userId);
      set({ chatList, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  selectChat: (chatId) => {
    set({ selectedChatId: chatId });
  },

  addMessage: (chatId, message) => {
    set((state) => ({
      chatList: state.chatList.map((chat) => {
        if (chat.with === chatId) {
          return {
            ...chat,
            messages: [...chat.messages, message],
          };
        }
        return chat;
      }),
    }));
  },

  updateUnreadCount: (chatId, updater) =>
    set((state) => ({
      chatList: state.chatList.map((chat) =>
        chat.with === chatId
          ? {
              ...chat,
              unreadCount:
                typeof updater === "function"
                  ? updater(chat.unreadCount ?? 0)
                  : updater,
            }
          : chat
      ),
    })),

  // 새로운 대화 항목 추가 액션
  addChat: (newChat) =>
    set((state) => ({
      chatList: [...state.chatList, newChat],
    })),

  getSelectedChat: () => {
    const { chatList, selectedChatId } = get();
    return chatList.find((chat) => chat.with === selectedChatId);
  },
}));
