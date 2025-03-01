"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Search, Settings, Users, MessageCircle, ShoppingBag, MoreHorizontal } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { getChatList } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';

export default function ChatList() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const { chatList, fetchChatList, selectChat, isLoading, error } = useChatStore();


  useEffect(() => {
    console.log(user, chatList)
    if (user) {
      fetchChatList(user.id);
    }
  }, [user, fetchChatList]);

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

  const selectChatHandler = (chatId) => {
    selectChat(chatId);
    router.push(`/chat/${chatId}`);
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* 1열: 채팅 타이틀 및 아이콘 */}
      <div className="flex justify-between items-center p-4 bg-white">
        <h1 className="text-2xl font-bold">채팅</h1>
        <div>
          <Search className="inline-block mr-4" />
          <Settings className="inline-block" />
        </div>
      </div>

      {/* 2열: 이미지 배너 */}
      <div className="h-40 bg-gray-200">
        {/* 배너 이미지 */}
      </div>

      {/* 중간: 채팅 목록 */}
      <div className="flex-1 overflow-y-auto">
        {chatList.map((chat) => (
          <Card key={chat.with} className="mb-2" onClick={() => selectChatHandler(chat.with)}>
            <div className="flex items-center p-4 h-20">
              {/* 1) 아바타 이미지 */}
              <Avatar className="h-16 w-16 rounded-lg mr-4 flex-shrink-0" />

              {/* 2) 친구 이름 및 마지막 메시지 */}
              <div className="flex-grow mr-4">
                <h3 className="font-semibold text-lg">{chat.with}</h3>
                <p className="text-sm text-gray-500 truncate">{chat.messages[chat.messages.length - 1].content}</p>
              </div>

              {/* 3) 날짜 및 읽지 않은 메시지 수 */}
              <div className="text-right flex-shrink-0 w-16">
                <p className="text-xs text-gray-500">{formatDate(chat.messages[chat.messages.length - 1].timestamp)}</p>
                {chat.messages.filter(m => !m.read && m.from !== user.id).length > 0 && (
                  <span className="inline-block bg-red-500 text-white rounded-full px-2 py-1 text-xs mt-2">
                    {chat.messages.filter(m => !m.read && m.from !== user.id).length}
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
