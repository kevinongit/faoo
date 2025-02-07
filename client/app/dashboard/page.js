"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Plus, Home, CreditCard, PieChart, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/authStore";

import ProtectedRoute from "@/components/ProtectedRoute";
import FullWidthCarousel from "@/components/FullWidthCarousel";
import GNB from "@/components/GNB";

export default function Dashboard() {
  const router = useRouter();
  const [showAccountPopup, setShowAccountPopup] = useState(false);

  const eventBanners = [
    {
      id: 1,
      subtitle: "뜨거운 여름 시원하고 쿨하게",
      title: "여름 특별 적금",
      description: "최대 5% 금리",
      image: "/images/man-64.png",
    },
    {
      id: 2,
      subtitle: "지금까지 없었던, 앞으로도 없을 ",
      title: "신규 가입 이벤트",
      description: "10만원 즉시 지급",
      image: "/images/savings-100.png",
    },
    {
      id: 3,
      subtitle: "미워도 다시한번, 컴온~",
      title: "재가입 이벤트",
      description: "1 만원 늦게 지급",
      image: "/images/airplane-94.png",
    },
    // 추가 배너...
  ];
  const { user, isAuthenticated } = useAuthStore();
  const { isLoading, setIsLoading } = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      setIsLoading(false);
      console.log({ isAuthenticated, user });
    }
  }, [isAuthenticated, user]);
  console.log("Dashboard");
  console.log({ isAuthenticated, user });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen">
        {/* 1열: 상단 바 */}
        <div className="flex justify-between items-center p-4 bg-yellow-400">
          <div className="flex items-center">
            <span className="font-bold mr-2">{user.username}</span>
            <Button onClick={() => setShowAccountPopup(true)}>내 계좌</Button>
          </div>
          <Bell
            className="cursor-pointer"
            onClick={() => router.push("/notifications")}
          />
        </div>

        {/* 2열: 이벤트 배너 캐러셀 */}
        <FullWidthCarousel banners={eventBanners} />

        {/* 3열: 내 통장 정보 */}
        <Card className="mx-4 my-6">
          <CardContent className="p-6">
            {user.hasAccount ? (
              <div>
                <h2 className="font-bold text-lg mb-2">내 통장</h2>
                <p className="text-2xl font-bold">잔액: ₩1,234,567</p>
                {/* 추가 계좌 정보... */}
              </div>
            ) : (
              <div className="text-center">
                <p className="mb-4">아직 통장이 없습니다.</p>
                <Button onClick={() => router.push("/create-account")}>
                  <Plus className="mr-2 h-4 w-4" /> 통장 만들기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 추가 기능 영역 */}
        <div className="flex flex-wrap justify-around p-4">
          <Button variant="outline" className="m-2">
            송금
          </Button>
          <Button variant="outline" className="m-2">
            대출
          </Button>
          <Button variant="outline" className="m-2">
            저축
          </Button>
          <Button variant="outline" className="m-2">
            투자
          </Button>
        </div>

        {/* GNB */}
        <GNB />

        {/* 계좌 팝업 */}
        {showAccountPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <Card className="w-80">
              <CardContent className="p-6">
                <h2 className="font-bold text-lg mb-4">내 계좌 정보</h2>
                {/* 계좌 정보 내용 */}
                <Button onClick={() => setShowAccountPopup(false)}>닫기</Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
