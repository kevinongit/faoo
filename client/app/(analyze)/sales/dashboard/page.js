"use client";
import { useEffect, useRef, useState } from "react";
import useCalendarStore from "@/lib/store/useCalendarStore"; // ✅ Zustand 추가
import { Card, CardContent } from "@/components/ui/card";
import {
  LucideUser,
  LucideSun,
  LucideTrendingUp,
  LucideTrendingDown,
  LucideCalendar,
} from "lucide-react";
import Calendar from "@/components/ui/Calendar";
import GNB from "@/components/GNB";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";
import useSaleCompareStore from "@/lib/store/saleCompareStore";
import BusinessHeader from "@/components/BusinessHeader";
import { getSectorImage } from "@/lib/utils";
import CountUp from "react-countup";

const date = new Date();

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayDate = `${yesterday.getMonth() + 1}월 ${yesterday.getDate()}일`;

export default function SalesSummary() {
  const { currentYear, currentMonth, setCurrentYear, setCurrentMonth } =
    useCalendarStore();
  const {
    salesData,
    comparisonData,
    dailySales,
    fetchMonthlySales,
    fetchComparison,
    fetchDailySales,
    isLoading,
    error,
  } = useCalendarStore();
  const { fetchData, rankData } = useSaleCompareStore();
  const { user, isAuthenticated } = useAuthStore();

  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  //console.log("🔑 User:", user);
  /* 사용자정보 */
  const business_number = user?.business_number; //"1111100001"; // 사업자 번호
  const business_name = user?.business_name;
  const smb_sector_en = user?.smb_sector_en;
  const sectorImage = getSectorImage(smb_sector_en);

  //페이지가 로드될 때 년.월을 초기화
  useEffect(() => {
    const currentYear = date.getFullYear();
    const currentMonth = "0" + (date.getMonth() + 1);
    setCurrentYear(currentYear);
    setCurrentMonth(currentMonth);
  }, []);

  //년월이 바뀌면 데이터 조회
  useEffect(() => {
    fetchData(
      user?.business_number,
      `${currentYear}${String(currentMonth).padStart(2, "0")}`
    );
    fetchMonthlySales(business_number, currentYear, currentMonth);
    fetchComparison(business_number);
    fetchDailySales(business_number, currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  //console.log("📊 Daily Sales Data:", dailySales);

  //console.log("📅 Monthly Sales Data:", salesData);
  //console.log("📊 Daily Sales Data:", dailySales);

  // 오늘 날짜의 매출 데이터 가져오기

  const todaySales = comparisonData.today_sales || 0;
  const yesterdaySales = comparisonData.yesterday_sales || 0;
  const twoDaysAgoSales = comparisonData.two_days_ago_sales || 0;
  const totalSales = salesData.total_sales || 0;

  const onlineSales = salesData.online_sales || 0;
  const offlineSales = salesData.offline_sales || 0;
  const onlineSalesPercentage =
    totalSales > 0 ? ((onlineSales / totalSales) * 100).toFixed(1) : 0;
  const offlineSalesPercentage =
    totalSales > 0 ? ((offlineSales / totalSales) * 100).toFixed(1) : 0;

  //console.log(todaySales, yesterdaySales, totalSales);
  //  매출 변화량 계산
  const salesDiff = todaySales - yesterdaySales;
  const isIncrease = salesDiff > 0;
  const diffText = isIncrease
    ? `+${salesDiff.toLocaleString()}`
    : `${salesDiff.toLocaleString()}`;
  const diffColor = isIncrease ? "text-red-500" : "text-blue-500";
  const trendIcon = isIncrease ? (
    <LucideTrendingUp className="w-5 h-5 text-red-500" />
  ) : (
    <LucideTrendingDown className="w-5 h-5 text-blue-500" />
  );

  // 2일 전 대비 변화량 계산
  const twoDaysAgoDiff = yesterdaySales - twoDaysAgoSales;
  const isTwoDaysAgoIncrease = twoDaysAgoDiff > 0;
  const twoDaysAgoDiffText = isTwoDaysAgoIncrease
    ? `▲ ${twoDaysAgoDiff.toLocaleString()}원`
    : `▼ ${Math.abs(twoDaysAgoDiff).toLocaleString()}원`;
  const twoDaysAgoDiffColor = isTwoDaysAgoIncrease
    ? "text-red-500"
    : "text-blue-500";
  const twoDaysAgoTrendIcon = isTwoDaysAgoIncrease ? (
    <LucideTrendingUp className="w-5 h-5 text-red-500" />
  ) : (
    <LucideTrendingDown className="w-5 h-5 text-blue-500" />
  );

  return (
    <>
      <BusinessHeader
        business_name={business_name}
        business_number={business_number}
        sector={smb_sector_en}
      />

      <div className="flex flex-col gap-4 px-4 bg-[#F3F5FC] min-h-screen items-center flex-grow pb-16">
        <div className="w-full flex flex-col md:flex-row justify-center items-center bg-blue-200 text-white py-3 px-5 rounded-lg shadow-md text-center md:text-left h-[60px]">
          {/* <div
        className="w-full flex flex-col md:flex-row justify-center items-center text-white py-3 px-5 rounded-lg shadow-md text-center md:text-left h-[60px]"
        style={{backgroundColor: "#0B6DA2"}}> */}
          {isLoading ? (
            <p className="text-white flex items-center justify-center h-full">
              매출 데이터 로딩 중...
            </p>
          ) : error ? (
            <p className="text-red-200 flex items-center justify-center h-full">
              오류 발생: {error}
            </p>
          ) : (
            <div className="text-sm md:text-base font-semibold w-full flex flex-col space-y-1">
              <div className="flex justify-between text-blue-500 w-full">
                <span className="min-w-[100px]">온라인 매출:</span>
                <span className="text-right tabular-nums w-[100px]">
                  {onlineSales.toLocaleString()}원
                </span>
                <span className="text-right tabular-nums w-[60px]">
                  ({onlineSalesPercentage}%)
                </span>
              </div>
              <div className="flex justify-between text-blue-500 w-full">
                <span className="min-w-[100px]">오프라인 매출:</span>
                <span className="text-right tabular-nums w-[100px]">
                  {offlineSales.toLocaleString()}원
                </span>
                <span className="text-right tabular-nums w-[60px]">
                  ({offlineSalesPercentage}%)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 매출 정보 */}
        <div className="flex justify-between w-full max-w-5xl gap-4">
          {/* 현재 월 매출 */}
          <Card className="w-1/2 h-32 md:h-40 p-2 bg-white shadow-lg border border-gray-300 flex flex-col justify-between rounded-lg">
            <CardContent className="p-2 flex flex-col justify-between h-full">
              <h2 className="text-xs md:text-lg font-bold text-center bg-gray-800 text-white p-[4px] rounded-lg">
                {currentMonth}월 매출
              </h2>
              <div className="flex flex-col items-center justify-center h-full">
                <p className="text-center mt-1 text-[10px] md:text-base">
                  이번 달 현재까지 매출
                </p>
                <p className="text-center text-lg md:text-xl font-bold text-red-500">
                  <CountUp
                    end={totalSales}
                    duration={0.2}
                    separator=","
                    suffix="원"
                  />
                </p>
                <p className="text-center text-[9px] md:text-sm text-gray-600 mt-1">
                  {isLoading ? (
                    "..."
                  ) : (
                    <>
                      {rankData.zone_nm} {rankData.smb_sector} 상위{" "}
                      <span className="text-red-500 font-bold">
                        {rankData?.monthInfo?.percentileRank || ""}%
                      </span>
                    </>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 어제 날짜 매출 */}
          <Card className="w-1/2 h-32 md:h-40 p-2 bg-white shadow-lg border border-gray-300 flex flex-col justify-between rounded-lg">
            <CardContent className="p-2 flex flex-col justify-between h-full">
              <h2 className="text-xs md:text-lg font-bold text-center bg-gray-800 text-white p-[4px] rounded-lg">
                {yesterdayDate} 매출은
              </h2>
              <div className="flex flex-col items-center justify-center h-full">
                {/* 2일 전 대비 변화량 */}
                <p className="text-sm md:text-base text-gray-600 text-center mt-1 flex justify-center items-center whitespace-nowrap">
                  전일 대비
                  <span
                    className={`${twoDaysAgoDiffColor} font-bold flex items-center ml-1`}
                  >
                    {twoDaysAgoDiffText}
                  </span>
                </p>
                <p className="text-[11px] md:text-sm text-gray-600 text-center mt-2 leading-tight break-words">
                  전년 동기 대비
                  <br />
                  <span
                    className={`${
                      comparisonData.yesterday_sales >
                      comparisonData.yesterday_lastyear
                        ? "text-red-500"
                        : "text-blue-500"
                    } font-bold`}
                  >
                    {comparisonData.yesterday_sales >
                    comparisonData.yesterday_lastyear
                      ? "▲"
                      : "▼"}{" "}
                    {Math.abs(
                      comparisonData.yesterday_sales -
                        comparisonData.yesterday_lastyear
                    ).toLocaleString()}
                    원
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 캘린더 표시 */}
        <div className="w-full max-w-5xl flex gap-4">
          <div className="w-full flex-1">
            <Calendar dailySales={dailySales.daily_sales} />
          </div>
        </div>

        {/* GNB */}
        <GNB />
      </div>
    </>
  );
}
