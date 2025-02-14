"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  CreditCard,
  PiggyBank,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const notificationCategories = [
  { id: "all", label: "전체" },
  { id: "account", label: "계좌" },
  { id: "card", label: "카드" },
  { id: "loan", label: "대출" },
  { id: "investment", label: "투자" },
];

const notifications = [
  {
    id: 1,
    title: "급여 입금 완료",
    message: "2023년 12월 급여 3,000,000원이 입금되었습니다.",
    date: "2023-12-25 09:00",
    category: "account",
    icon: <PiggyBank className="w-6 h-6 text-green-500" />,
    isNew: true,
  },
  {
    id: 2,
    title: "카드 결제 알림",
    message: "신한카드로 50,000원 결제되었습니다. (스타벅스)",
    date: "2023-12-24 15:30",
    category: "card",
    icon: <CreditCard className="w-6 h-6 text-blue-500" />,
    isNew: true,
  },
  {
    id: 3,
    title: "대출 이자 납부 예정",
    message: "내일(12/26) 대출 이자 150,000원 납부 예정입니다.",
    date: "2023-12-24 10:00",
    category: "loan",
    icon: <AlertCircle className="w-6 h-6 text-yellow-500" />,
    isNew: false,
  },
  {
    id: 4,
    title: "투자 수익률 알림",
    message: "보유 중인 삼성전자 주식의 수익률이 5% 상승했습니다.",
    date: "2023-12-23 16:45",
    category: "investment",
    icon: <TrendingUp className="w-6 h-6 text-red-500" />,
    isNew: false,
  },
];

export default function NotificationsPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredNotifications =
    activeCategory === "all"
      ? notifications
      : notifications.filter(
          (notification) => notification.category === activeCategory
        );

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">알림</h1>

        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            {notificationCategories.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.isNew ? "bg-blue-50" : ""}
            >
              <CardContent className="flex items-start p-4">
                <div className="mr-4 mt-1">{notification.icon}</div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h2 className="text-lg font-semibold">
                      {notification.title}
                    </h2>
                    {notification.isNew && <Badge>New</Badge>}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400">{notification.date}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button className="w-full mt-6">모든 알림 읽음 표시</Button>
      </div>
    </ProtectedRoute>
  );
}
