'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Menu, Plus, Send } from 'lucide-react';
import { sendMessage } from '@/lib/api';
import { useSocket } from '@/lib/socket';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';

export default function ChatRoom({ chatId }) {
  const [newMessage, setNewMessage] = useState('');
  const router = useRouter();
  const socket = useSocket();
  const messagesEndRef = useRef(null);

  const { getSelectedChat, addMessage, updateUnreadCount } = useChatStore();
  const user = useAuthStore(state => state.user);

  const selectedChat = getSelectedChat();

  useEffect(() => {
    if (socket) {
      socket.on('new-message', (message) => {
        if (message.from === chatId || message.to === chatId) {
          addMessage(chatId, message);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('new-message');
      }
    };
  }, [socket, chatId, addMessage]);

  useEffect(() => {
    updateUnreadCount(chatId);
  }, [chatId, updateUnreadCount]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

  const handleSend = async () => {
    if (newMessage.trim()) {
      const message = {
        from: user.id,
        to: chatId,
        content: newMessage,
        timestamp: new Date().toISOString(),
        type: 'text',
      };
      await sendMessage(user.id, chatId, newMessage, 'text');
      addMessage(chatId, message);
      setNewMessage('');
    }
  };

  if (!selectedChat) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <ArrowLeft onClick={() => router.back()} className="cursor-pointer" />
        <h2 className="text-lg font-semibold">{selectedChat.with}</h2>
        <div>
          <Search className="inline-block mr-4 cursor-pointer" />
          <Menu className="inline-block cursor-pointer" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {selectedChat.messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.from === user.id ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg ${message.from === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex items-center p-4 bg-white border-t">
        <Plus className="mr-2 cursor-pointer" />
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="flex-1 mr-2"
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend}>
          <Send />
        </Button>
      </div>
    </div>
  );
}
