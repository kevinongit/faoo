// lib/api.js
import axios from "axios";
import { useAuthStore } from "./store/authStore";

const SERVER_URL = "http://localhost:5100";
const api = axios.create({
  baseURL: `${SERVER_URL}/api`,
});

console.log(`API URL: ${SERVER_URL}/api`);

api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
