"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/ProtectedRoute";
import GNB from "@/components/GNB";

export default function SohoHome() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    console.log("SohoHome: isAuthenticated =", isAuthenticated);
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // 더미 데이터 (실제 데이터는 API에서 가져와야 함)
  const yesterdaySales = 1500000; // 어제 매출
  const monthlySales = 45000000; // 이번달 매출

  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen bg-gray-100">
        {/* 상단 헤더 */}
        <div className="flex justify-between items-center p-4 bg-white shadow-sm">
          <div className="text-lg md:text-xl">
            <div className="font-bold">
              {user?.business_name || "행복한 가게"}님
            </div>
            <div className="font-normal mt-1 text-gray-600">
              오늘도 번창하세요!
            </div>
          </div>
          <Bell
            className="cursor-pointer text-gray-600"
            onClick={() => router.push("/notifications")}
          />
        </div>

        {/* 매출 정보 카드 */}
        <Card className="mx-4 mt-4 bg-white rounded-lg shadow-md">
          <CardContent className="p-6">
            {/* 어제 매출 */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600">어제 매출</p>
                <div className="flex items-center space-x-2">
                  <p className="text-xl font-bold">
                    {yesterdaySales.toLocaleString()} 원
                  </p>
                  <div className="flex items-center text-green-500">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-xs">5% 상승</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  이번달 일평균 매출보다 5% 상승했어요~
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-blue-500 text-xs"
                onClick={() => router.push("/sales/yesterday")}
              >
                자세히 보기 <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* 구분선 */}
            <div className="border-t border-gray-200 my-2"></div>

            {/* 이번달 매출 */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-sm text-gray-600">이번달 매출</p>
                <div className="flex items-center space-x-2">
                  <p className="text-xl font-bold">
                    {monthlySales.toLocaleString()} 원
                  </p>
                  <div className="flex items-center text-red-500">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    <span className="text-xs">3% 하락</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  지난달 오늘 대비 3% 하락했어요~
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-blue-500 text-xs"
                onClick={() => router.push("/sales/monthly")}
              >
                자세히 보기 <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* 매출 캘린더 확인하기 */}
            <Button
              variant="outline"
              className="w-full mt-2 border-gray-300 text-blue-600"
              onClick={() => router.push("/sales/dashboard")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              매출 캘린더 확인하기
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        {/* GNB */}
        {/* <GNB
          items={[
            { icon: <Home />, label: "나의자산", path: "/soho-home" },
            { icon: <Send />, label: "이체", path: "/transfer" },
            { icon: <PieChart />, label: "금융상품", path: "/products" },
            { icon: <Menu />, label: "전체메뉴", path: "/menu" },
          ]}
        /> */}
      </div>
    </ProtectedRoute>
  );
}
