"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Home,
  Gift,
  Package,
  CreditCard,
  PiggyBank,
  Send,
  Settings,
  HelpCircle,
  Bell,
  User,
} from "lucide-react";

const menuItems = [
  { icon: Home, label: "홈", href: "/dashboard" },
  { icon: Gift, label: "혜택", href: "/benefits" },
  { icon: Package, label: "상품", href: "/products" },
  { icon: CreditCard, label: "카드", href: "/cards" },
  { icon: PiggyBank, label: "계좌", href: "/accounts" },
  { icon: Send, label: "이체", href: "/transfer" },
  { icon: Bell, label: "알림", href: "/notifications" },
  { icon: User, label: "프로필", href: "/profile" },
  { icon: Settings, label: "설정", href: "/settings" },
  { icon: HelpCircle, label: "고객센터", href: "/support" },
];

export default function MenuPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">전체 메뉴</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {menuItems.map((item, index) => (
          <Card key={index} className="hover:bg-gray-100 transition-colors">
            <CardContent className="p-4">
              <Button
                variant="ghost"
                className="w-full h-full flex flex-col items-center justify-center"
                onClick={() => router.push(item.href)}
              >
                <item.icon className="w-8 h-8 mb-2" />
                <span>{item.label}</span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
