import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api'; // Express 서버 주소로 변경해주세요

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = async (id, password) => {
  try {
    const response = await api.post('/login', { id, password });
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

export const sendMessage = async (chatId, message) => {
  try {
    const response = await api.post('/send-message', { chatId, message });
    return response.data;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
};

export default api;
