import Link from 'next/link';
import { Users, MessageCircle, ShoppingBag, MoreHorizontal } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="flex justify-around items-center bg-white border-t border-gray-200 p-2">
      <Link href="/friends" className="flex flex-col items-center">
        <Users size={24} />
        <span className="text-xs mt-1">친구</span>
      </Link>
      <Link href="/chat-list" className="flex flex-col items-center">
        <MessageCircle size={24} />
        <span className="text-xs mt-1">채팅</span>
      </Link>
      <Link href="/shopping" className="flex flex-col items-center">
        <ShoppingBag size={24} />
        <span className="text-xs mt-1">쇼핑</span>
      </Link>
      <Link href="/more" className="flex flex-col items-center">
        <MoreHorizontal size={24} />
        <span className="text-xs mt-1">더보기</span>
      </Link>
    </nav>
  );
}
