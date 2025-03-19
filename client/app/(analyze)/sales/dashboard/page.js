"use client";
import {useEffect, useRef, useState} from "react";
import useCalendarStore from "@/lib/store/useCalendarStore"; // ✅ Zustand 추가
import {Card, CardContent} from "@/components/ui/card";
import {LucideUser, LucideSun, LucideTrendingUp, LucideTrendingDown, LucideCalendar} from "lucide-react";
import Calendar from "@/components/ui/Calendar";
import GNB from "@/components/GNB";
import {useAuthStore} from "@/lib/store/authStore";
import {useRouter} from "next/navigation";

const date = new Date();
const currentYear = date.getFullYear();
const currentMonth = date.getMonth() + 1;
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayDate = `${yesterday.getMonth() + 1}월 ${yesterday.getDate()}일`;

export default function SalesSummary() {
  const {
    selectedDate,
    salesData,
    comparisonData,
    dailySales,
    fetchMonthlySales,
    fetchComparison,
    fetchDailySales,
    currentYear,
    currentMonth,
    isLoading,
    error
  } = useCalendarStore();

  const {user, isAuthenticated} = useAuthStore();

  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, []);

  console.log("🔑 User:", user);
  const business_number = user?.business_number; //"1111100001"; // 사업자 번호
  // ✅ 페이지가 로드될 때 두 개의 API 호출
  useEffect(() => {
    fetchMonthlySales(business_number);
    fetchComparison(business_number);
    fetchDailySales(business_number, currentYear, currentMonth);
  }, []);

  useEffect(() => {
    fetchDailySales(business_number, currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  console.log("📊 Daily Sales Data:", dailySales);

  //console.log("📅 Monthly Sales Data:", salesData);
  //console.log("📊 Daily Sales Data:", dailySales);

  // ✅ 오늘 날짜의 매출 데이터 가져오기
  const formattedDate = selectedDate.toISOString().split("T")[0]; // YYYY-MM-DD 형식
  const todaySales = comparisonData.today_sales || 0;
  const yesterdaySales = comparisonData.yesterday_sales || 0;
  const twoDaysAgoSales = comparisonData.two_days_ago_sales || 0;
  const totalSales = salesData.total_sales || 0;

  console.log(todaySales, yesterdaySales, totalSales);
  // ✅ 숫자 카운트 애니메이션 (오늘 매출) using useRef and requestAnimationFrame
  const salesRef = useRef(0);
  const salesDisplayRef = useRef(null);

  /*
  
  useEffect(() => {
    let start = 0;
    const end = totalSales;
    const duration = 1500;
    const increment = Math.ceil(end / (duration / 16));

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setSales(start);
    }, 16);

    return () => clearInterval(timer);
  }, [totalSales]);
*/

  useEffect(() => {
    if (!salesDisplayRef.current) return;

    let startTime = null;
    const end = totalSales;
    const duration = 1500;

    function animateCountUp(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      salesRef.current = Math.floor(progress * end);
      salesDisplayRef.current.innerText = salesRef.current.toLocaleString() + "원";
      if (progress < 1) {
        requestAnimationFrame(animateCountUp);
      }
    }

    requestAnimationFrame(animateCountUp);
  }, [totalSales]);

  // ✅ 매출 변화량 계산
  const salesDiff = todaySales - yesterdaySales;
  const isIncrease = salesDiff > 0;
  const diffText = isIncrease ? `+${salesDiff.toLocaleString()}` : `${salesDiff.toLocaleString()}`;
  const diffColor = isIncrease ? "text-red-500" : "text-blue-500";
  const trendIcon = isIncrease ? (
    <LucideTrendingUp className="w-5 h-5 text-red-500" />
  ) : (
    <LucideTrendingDown className="w-5 h-5 text-blue-500" />
  );

  // ✅ 2일 전 대비 변화량 계산
  const twoDaysAgoDiff = yesterdaySales - twoDaysAgoSales;
  const isTwoDaysAgoIncrease = twoDaysAgoDiff > 0;
  const twoDaysAgoDiffText = isTwoDaysAgoIncrease
    ? `▲ ${twoDaysAgoDiff.toLocaleString()}원`
    : `▼ ${Math.abs(twoDaysAgoDiff).toLocaleString()}원`;
  const twoDaysAgoDiffColor = isTwoDaysAgoIncrease ? "text-red-500" : "text-blue-500";
  const twoDaysAgoTrendIcon = isTwoDaysAgoIncrease ? (
    <LucideTrendingUp className="w-5 h-5 text-red-500" />
  ) : (
    <LucideTrendingDown className="w-5 h-5 text-blue-500" />
  );

  return (
    <div className="flex flex-col gap-6 p-4 bg-gray-50 min-h-screen items-center flex-grow pb-16">
      {/* 상단 변화량 표시 */}
      <div className="w-full flex flex-col md:flex-row justify-center items-center bg-blue-100 text-gray-900 py-3 px-5 rounded-lg shadow-md text-center md:text-left h-[60px]">
        {isLoading ? (
          <p className="text-gray-500 flex items-center justify-center h-full">⏳ 매출 데이터 로딩 중...</p>
        ) : error ? (
          <p className="text-red-500 flex items-center justify-center h-full">❌ 오류 발생: {error}</p>
        ) : (
          <p className="text-sm md:text-base font-semibold flex flex-wrap justify-center md:justify-start items-center h-full">
            <span className="font-bold ml-1">📅 {formattedDate}</span> 매출 금액은
            <span className="text-yellow-600 font-bold mx-1">{todaySales.toLocaleString()}원</span> / 어제 매출까지{" "}
            <span className={`ml-1 ${diffColor} font-bold flex items-center`}>
              {trendIcon} {diffText}원 {salesDiff < 0 ? "남았어요" : "초과했어요"}
            </span>
          </p>
        )}
      </div>

      {/* 매출 정보 */}
      <div className="flex justify-between w-full max-w-5xl gap-4">
        {/* 현재 월 매출 */}
        <Card className="w-1/2 h-32 p-2 bg-white shadow-lg border border-gray-300 flex flex-col justify-between rounded-lg">
          <CardContent className="p-2 flex flex-col justify-between h-full">
            <h2 className="text-xs md:text-lg font-bold text-center bg-gray-800 text-white p-[4px] rounded-lg">
              {currentMonth}월 매출
            </h2>
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-center mt-1 text-[10px] md:text-base">이번 달 현재까지 매출</p>
              <p
                ref={salesDisplayRef}
                className="text-center text-lg md:text-xl font-bold text-red-500"></p>
              <p className="text-center text-[9px] md:text-sm text-gray-600 mt-1">
                강남구 커피 전문점 상위 <span className="text-red-500 font-bold">40%</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 어제 날짜 매출 */}
        <Card className="w-1/2 h-32 p-2 bg-white shadow-lg border border-gray-300 flex flex-col justify-between rounded-lg">
          <CardContent className="p-2 flex flex-col justify-between h-full">
            <h2 className="text-xs md:text-lg font-bold text-center bg-gray-800 text-white p-[4px] rounded-lg">
              {yesterdayDate} 매출은
            </h2>
            <div className="flex flex-col items-center justify-center h-full">
              {/* 2일 전 대비 변화량 */}
              <p className="text-[10px] md:text-sm text-gray-600 text-center mt-1 flex justify-center items-center whitespace-nowrap">
                전일 대비
                <span className={`${twoDaysAgoDiffColor} font-bold flex items-center ml-1`}>{twoDaysAgoDiffText}</span>
              </p>
              <p className="text-[10px] md:text-sm text-gray-600 text-center mt-1 flex justify-center items-center whitespace-nowrap">
                전년도 같은 날 대비
                <span
                  className={`${
                    comparisonData.yesterday_sales > comparisonData.yesterday_lastyear
                      ? "text-red-500"
                      : "text-blue-500"
                  } font-bold flex items-center ml-1`}>
                  {comparisonData.yesterday_sales > comparisonData.yesterday_lastyear ? "▲" : "▼"}{" "}
                  {Math.abs(comparisonData.yesterday_sales - comparisonData.yesterday_lastyear).toLocaleString()}원
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 캘린더 표시 */}
      <div className="w-full flex justify-center overflow-visible">
        <Calendar dailySales={dailySales.daily_sales} />
      </div>

      {/* GNB */}
      <GNB />
    </div>
  );
}
