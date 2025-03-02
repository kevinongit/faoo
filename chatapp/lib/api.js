import axios from 'axios';
import { getAuthStore } from '@/store/authStore';

const API_BASE_URL = 'http://localhost:3001/api'; // Express 서버 주소로 변경해주세요
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  const token = getAuthStore().getState().token;

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const login = async (id, password) => {
  try {
    const response = await api.post('/login', { id, password });
    console.log('Login successful:', response.data);
    return response.data.token;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

export const getChatList = async (userId) => {
  try {
    const response = await api.get(`/chat-list/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch chat list:', error);
    throw error;
  }
};


export const getChatMessages = async (chatId) => {
  try {
    const response = await api.get(`/chat/${chatId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch chat messages:', error);
    throw error;
  }
};

export const sendMessage = async (from, to, content, type = "text") => {
  const payload = { from, to, content, type };

  try {
    const response = await api.post('/send-message', payload);
    return response.data;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
};

// In your api.js module
export const markAllRead = async ({ userId, chatId }) => {
  const response = await api.post('/chat/allread', { userId, chatId });
  return response.data;
};



export default api;
