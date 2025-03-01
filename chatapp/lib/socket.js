import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';

const SOCKET_SERVER_URL = 'http://localhost:3001'; // Socket.IO 서버 주소로 변경해주세요

let socket;

export const initSocket = () => {
  const token = useAuthStore.getState().token;
  socket = io(SOCKET_SERVER_URL, {
    auth: {
      token,
    },
  });

  socket.on('connect', () => {
    console.log('Connected to socket server');
  });

  socket.on('disconnect', () => {
    console.log('Disconnected from socket server');
  });

  return socket;
};

export const useSocket = () => {
  const [socketInstance, setSocketInstance] = useState(null);

  useEffect(() => {
    const socket = initSocket();
    setSocketInstance(socket);

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  return socketInstance;
};

export const emitMessage = (event, data) => {
  if (socket) {
    socket.emit(event, data);
  }
};
