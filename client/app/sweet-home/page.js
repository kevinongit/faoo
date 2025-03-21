"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Home, Send, PieChart, Menu } from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/ProtectedRoute";
import GNB from "@/components/GNB";
import AccountCard from "@/components/AccountCard";
import ActionButtonGroup from "@/components/ActionButtonGroup";
import SecondaryButtonGroup from "@/components/SecondaryButtonGroup";

export default function SweetHome() {
  const { user, token, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("기업은행");

  useEffect(() => {
    console.log("SweetHome: isAuthenticated =", isAuthenticated);
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gray-100">
        {/* 상단 헤더 */}
        <div className="flex justify-between items-center p-4 bg-white">
          <div className="text-lg md:text-xl">
            <div className="font-bold">{user?.username || "고객"}님</div>
            <div className="font-normal mt-1">활기찬 하루 되세요.</div>
          </div>
          <Bell
            className="cursor-pointer"
            onClick={() => router.push("/notifications")}
          />
        </div>

        {/* 탭 버튼 (상단 간격 유지, 하단 간격 조정) */}
        <div className="flex px-4 pt-3 pb-0">
          <Button
            variant={activeTab === "기업은행" ? "default" : "outline"}
            className={`flex-1 mr-2 ${
              activeTab === "기업은행"
                ? "bg-blue-500 text-white"
                : "bg-white text-black border-gray-300"
            } rounded-full border-none py-2 text-sm font-semibold`}
            onClick={() => setActiveTab("기업은행")}
          >
            기업은행
          </Button>
          <Button
            variant={activeTab === "다른은행" ? "default" : "outline"}
            className={`flex-1 ${
              activeTab === "다른은행"
                ? "bg-blue-500 text-white"
                : "bg-white text-black border-gray-300"
            } rounded-full border-none py-2 text-sm font-semibold`}
            onClick={() => setActiveTab("다른은행")}
          >
            다른은행
          </Button>
        </div>

        {/* 계좌 정보 (탭에 따라 변경, 상단 마진 줄이기) */}
        {activeTab === "기업은행" ? (
          <AccountCard
            accountType="자유예금(BK주거래생활금융통장)"
            accountNumber="420-093023-02-011"
            balance="5,380,200 원"
          />
        ) : (
          <Card className="mx-4 mt-0 mb-4 border-dashed border-2 border-gray-300 min-h-[220px]">
            <CardContent className="p-6 text-center flex flex-col justify-center h-full">
              <p className="text-sm font-semibold mb-2">
                다른 은행 계좌를 설정해 보세요
              </p>
              <p className="text-xs text-gray-600 mb-4">
                다른 은행계좌도 최근 거래내역과 잔액을 확인할 수 있어요.
              </p>
              <Button
                variant="outline"
                className="border-gray-300"
                onClick={() => router.push("/connect-other-bank")}
              >
                설정하기
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 기능 버튼 그룹 (탭과 관계없이 유지) */}
        <ActionButtonGroup />

        {/* 추가 버튼 그룹 (탭과 관계없이 유지) */}
        <SecondaryButtonGroup />

        {/* GNB (탭과 관계없이 유지) */}
        <GNB
          items={[
            { icon: <Home />, label: "나의자산", path: "/sweet-home" },
            { icon: <Send />, label: "이체", path: "/transfer" },
            { icon: <PieChart />, label: "금융상품", path: "/products" },
            { icon: <Menu />, label: "전체메뉴", path: "/menu" },
          ]}
        />
      </div>
    </ProtectedRoute>
  );
}
