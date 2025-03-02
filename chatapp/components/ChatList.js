"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Settings } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import Image from 'next/image';
import useSocketStore from '@/store/socketStore';
// Import the new API function to mark all messages read
import { markAllRead } from '@/lib/api';

export default function ChatList() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const { chatList, fetchChatList, selectChat, isLoading, error, addMessage, updateUnreadCount } = useChatStore();
  const socket = useSocketStore(state => state.socket);

  // Log initial user
  console.debug('[ChatList] Rendered with user:', user);

  // On mount: join socket and fetch chat list
  useEffect(() => {
    if (socket && user) {
      console.debug('[ChatList] Emitting join event for user:', user.id);
      socket.emit('join', user.id);
      console.debug('[ChatList] Fetching chat list for user:', user.id);
      fetchChatList(user.id);
    }
  }, [socket, user, fetchChatList]);

  // Log chat list when updated
  useEffect(() => {
    console.debug('[ChatList] Fetched chat list:', chatList);
  }, [chatList]);

  // Handle incoming new messages
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message) => {
        console.debug('[ChatList] new-message event received:', message);
        // Add the new message to the state
        addMessage(message.from, message);
        // Only increment unread count if message is from another user
        if (message.from !== user.id) {
          console.debug('[ChatList] Incrementing unread count for chat:', message.from);
          updateUnreadCount(message.from, (prev) => {
            const newCount = prev + 1;
            console.debug('[ChatList] Updated unread count for', message.from, ':', newCount);
            return newCount;
          });
        }
      };

      socket.on('new-message', handleNewMessage);
      console.debug('[ChatList] Registered new-message handler.');
      return () => {
        socket.off('new-message', handleNewMessage);
        console.debug('[ChatList] Unregistered new-message handler.');
      };
    }
  }, [socket, addMessage, updateUnreadCount, user.id]);

  const formatDate = (timestamp) => {
    const date = parseISO(timestamp);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return format(date, 'a h:mm');
    } else if (date.getDate() === now.getDate() - 1) {
      return '어제';
    } else {
      return format(date, 'M월 d일');
    }
  };

  // Modified selectChatHandler to call the /allread endpoint API
  const selectChatHandler = async (chatId) => {
    console.debug('[ChatList] Chat selected:', chatId);
    try {
      // Call the API endpoint to mark all messages read for this chat
      await markAllRead({ userId: user.id, chatId });
      console.debug('[ChatList] All messages marked as read for chat:', chatId);
      // Update the unread count locally to 0
      updateUnreadCount(chatId, 0);
    } catch (err) {
      console.error('[ChatList] Failed to mark messages as read:', err);
    }
    // Set the selected chat and navigate to the ChatRoom
    selectChat(chatId);
    router.push(`/chat/${chatId}`);
  };

  if (isLoading) {
    console.debug('[ChatList] Loading chat list...');
    return <div>Loading...</div>;
  }
  if (error) {
    console.error('[ChatList] Error fetching chat list:', error);
    return <div>Error: {error}</div>;
  }
  console.log('chatList:', chatList);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center p-4 bg-white">
        <div className="flex-1">
          {/* Left side: Optional title or left content */}
          <h1 className="text-2xl font-bold">채팅</h1>
        </div>
        <div className="flex-1 text-center">
          {/* Center: Display user id */}
          <span className="text-xl">@{user.id}</span>
        </div>
        <div className="flex-1 text-right">
          {/* Right side: Action icons */}
          <Search className="inline-block mr-4" />
          <Settings className="inline-block" />
        </div>
      </div>

      {/* Banner */}
      <div className="w-full max-w-[500px] mb-5 mx-auto">
        <Image
          src="/images/banners/sky2-500x150.jpg"
          alt="Banner"
          width={500}
          height={140}
          className="object-cover w-full h-auto"
          placeholder="blur" // 로딩 중 흐릿한 효과
          blurDataURL="data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAbEAACAgMBAAAAAAAAAAAAAAAcEAYQMEISI//EABUBAQEAAAAAAAAAAAAAAAAAAAUG/8QAGREAAgMBAAAAAAAAAAAAAAAAABEBEiEx/9oADAMBAAIRAxEAPwCNtA1u3zIJG5k6sM9oHWOeR2A2H3qPEeM5YcE8dQv/Z" // 샘플 blur 이미지
        />
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {chatList.map((chat) => (
          <Card key={chat.with} className="mb-2" onClick={() => selectChatHandler(chat.with)}>
            <div className="flex items-center h-20 p-4">
              <Avatar className="flex-shrink-0 w-16 h-16 mr-4 rounded-lg">
                <AvatarImage asChild src={`/images/users/${chat.with}.jpg`}>
                  <Image alt="Avatar" width={40} height={40} />
                </AvatarImage>
                <AvatarFallback>{chat.with}</AvatarFallback>
              </Avatar>
              <div className="flex-grow mr-4 overflow-hidden">
                <h3 className="text-lg font-semibold">{chat.with}</h3>
                <p className="text-sm text-gray-500 truncate max-w-[200px]">
                  {chat.messages[chat.messages.length - 1].content}
                </p>
              </div>
              <div className="flex-shrink-0 w-16 text-right">
                <p className="text-xs text-gray-500">
                  {formatDate(chat.messages[chat.messages.length - 1].timestamp)}
                </p>
                {chat.unreadCount > 0 && (
                  <span className="inline-block px-2 py-1 mt-2 text-xs text-white bg-red-500 rounded-full">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
