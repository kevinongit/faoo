import Link from 'next/link';
import { Users, MessageCircle, ShoppingBag, MoreHorizontal } from 'lucide-react';

export default function BottomNav() {
  return (
    <nav className="flex items-center justify-around p-2 bg-white border-t border-gray-200">
      <Link href="#" className="flex flex-col items-center">
        <Users size={24} />
        <span className="mt-1 text-xs">친구</span>
      </Link>
      <Link href="#" className="flex flex-col items-center">
        <MessageCircle size={24} />
        <span className="mt-1 text-xs">채팅</span>
      </Link>
      <Link href="#" className="flex flex-col items-center">
        <ShoppingBag size={24} />
        <span className="mt-1 text-xs">쇼핑</span>
      </Link>
      <Link href="/" className="flex flex-col items-center">
        <MoreHorizontal size={24} />
        <span className="mt-1 text-xs">더보기</span>
      </Link>
    </nav>
  );
}
