// lib/api.js
import axios from "axios";
import { useAuthStore } from "./store/authStore";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}:5100/api`,
});

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
