import ChatList from '@/components/ChatList';
import BottomNav from '@/components/BottomNav';

export default function ChatListPage() {
  return (
    <div className="flex flex-col h-screen">
      <ChatList />
      <BottomNav />
    </div>
  );
}
