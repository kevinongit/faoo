"use client";
import { useParams } from 'next/navigation';
import ChatRoom from '@/components/ChatRoom';

export default function ChatPage() {
  const { id } = useParams();
  return <ChatRoom chatId={id} />;
}
