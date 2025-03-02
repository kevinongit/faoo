'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search, Menu, Plus, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { differenceInMinutes, parseISO } from 'date-fns';
import { sendMessage } from '@/lib/api';
import useSocketStore from '@/store/socketStore';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';

export default function ChatRoom({ chatId }) {
  const [newMessage, setNewMessage] = useState('');
  const router = useRouter();
  const socket = useSocketStore(state => state.socket);
  const messagesEndRef = useRef(null);

  const { getSelectedChat, addMessage, updateUnreadCount } = useChatStore();
  const user = useAuthStore(state => state.user);

  const selectedChat = getSelectedChat();



  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message) => {
        console.log('new-message:', message);
        if (message.to === user.id) {
          addMessage(chatId, message);
          updateUnreadCount(chatId, 1);
        }
      };

      socket.on('new-message', handleNewMessage);

      return () => {
        socket.off('new-message', handleNewMessage);
      };
    }
  }, [socket, chatId, user.id, addMessage, updateUnreadCount]);

  useEffect(() => {
    updateUnreadCount(chatId, 0);
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
      //    sendMessage(from,    to,     msg,        type)
      await sendMessage(user.id, chatId, newMessage, 'text');
      addMessage(chatId, message);
      setNewMessage('');
    }
  };

  const shouldShowAvatar = (message, index, messages) => {
    if (message.from === user.id) return false;
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    if (prevMessage.from !== message.from) return true;
    const timeDiff = differenceInMinutes(parseISO(message.timestamp), parseISO(prevMessage.timestamp));
    return timeDiff >= 1;
  };

  if (!selectedChat) {
    return <div>Loading...</div>;
  }

  // return (
  //   <div className="flex flex-col h-screen">
  //     <div className="flex items-center justify-between p-4 bg-white border-b">
  //       <ArrowLeft onClick={() => router.back()} className="cursor-pointer" />
  //       <h2 className="text-lg font-semibold">{selectedChat.with}</h2>
  //       <div>
  //         <Search className="inline-block mr-4 cursor-pointer" />
  //         <Menu className="inline-block cursor-pointer" />
  //       </div>
  //     </div>


  //     <div className="flex-1 p-4 overflow-y-auto">
  //       {selectedChat.messages.map((message, index, messages) => (
  //         <div key={index} className={`mb-4 flex ${message.from === user.id ? 'justify-end' : 'justify-start'}`}>
  //           {message.from !== user.id && shouldShowAvatar(message, index, messages) && (
  //             <Avatar className="flex-shrink-0 mr-2">
  //               <AvatarImage src={`/images/users/${message.from}.jpg`} alt={message.from} />
  //               <AvatarFallback>{message.from[0].toUpperCase()}</AvatarFallback>
  //             </Avatar>
  //           )}
  //           <div className={`p-2 rounded-lg ${message.from === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
  //             {message.content}
  //           </div>
  //         </div>
  //       ))}
  //       <div ref={messagesEndRef} />
  //     </div>

  //     <div className="flex items-center p-4 bg-white border-t">
  //       <Plus className="mr-2 cursor-pointer" />
  //       <Input
  //         value={newMessage}
  //         onChange={(e) => setNewMessage(e.target.value)}
  //         placeholder="메시지를 입력하세요..."
  //         className="flex-1 mr-2"
  //         onKeyPress={(e) => e.key === 'Enter' && handleSend()}
  //       />
  //       <Button onClick={handleSend}>
  //         <Send />
  //       </Button>
  //     </div>
  //   </div>
  // );

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

      <div className="flex-1 p-4 overflow-y-auto">
        {selectedChat.messages.map((message, index, messages) => (
          <div key={index} className={`mb-4 flex ${message.from === user.id ? 'justify-end' : 'justify-start'}`}>
            {message.from !== user.id && shouldShowAvatar(message, index, messages) && (
              <Avatar className="flex-shrink-0 mr-2">
                <AvatarImage src={`/images/users/${message.from}.jpg`} alt={message.from} />
                <AvatarFallback>{message.from[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            )}
            <div className={`p-2 rounded-lg ${message.from === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
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
