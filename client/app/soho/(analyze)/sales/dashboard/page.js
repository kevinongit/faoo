"use client";
import { useEffect } from "react";
import useCalendarStore from "@/lib/store/useCalendarStore"; // ✅ Zustand 추가
import { Card, CardContent } from "@/components/ui/card";
import { LucideTrendingUp, LucideTrendingDown } from "lucide-react";
import Calendar from "@/components/ui/Calendar";
import { useAuthStore } from "@/lib/store/authStore";
import { useRouter } from "next/navigation";
import useSaleCompareStore from "@/lib/store/saleCompareStore";
import BusinessHeader from "@/components/BusinessHeader";
import { getSectorImage } from "@/lib/utils";
import CountUp from "react-countup";
import BackHeader from "@/components/BackHeader";

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

  //페이지가 로드될 때 년.월을 초기화
  useEffect(() => {
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth() + 1;
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
      <BackHeader title="월 매출" />
      <BusinessHeader
        business_name={business_name}
        business_number={business_number}
        sector={smb_sector_en}
      />

      <div className="flex flex-col gap-4 px-4 bg-[#F3F5FC] min-h-screen items-center flex-grow pb-16 mt-[45px]">
        {/* 매출 정보 */}
        <div className="flex justify-between w-full gap-4 mt-4">
          {/* 현재 월 매출 */}
          <Card className="border-0 w-full h-24 md:h-32 bg-white flex flex-col justify-between rounded-[20px]">
            <CardContent className="p-1 flex flex-col justify-between h-full">
              <h2 className="text-sm md:text-lg font-bold text-center p-[2px] rounded-lg">
                {currentMonth}월 매출
              </h2>
              <div className="flex flex-col items-center justify-start h-full mt-1">
                <p className="text-center text-[10px] md:text-sm h-[16px] md:h-[20px]">
                  {currentMonth === date.getMonth() + 1
                    ? `${currentMonth}/${date.getDate()} 까지의 매출`
                    : ""}
                </p>
                <p className="text-center text-base md:text-lg font-bold text-blue-500">
                  <CountUp
                    end={totalSales}
                    duration={0.2}
                    separator=","
                    suffix="원"
                  />
                </p>
                {!isLoading && rankData?.monthInfo?.percentileRank > 0 && (
                  <p className="text-center text-[10px] md:text-xs text-gray-600 mt-0.5">
                    {rankData.zone_nm} {rankData.smb_sector} 상위{" "}
                    <span className="text-red-500 font-bold">
                      {rankData.monthInfo.percentileRank}%
                    </span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 어제 날짜 매출 */}
          <Card className="border-0 w-full h-24 md:h-32 bg-white flex flex-col justify-between rounded-[20px]">
            <CardContent className="p-1 flex flex-col justify-between h-full">
              <h2 className="text-sm md:text-lg font-bold text-center p-[2px] rounded-lg">
                {yesterdayDate} 매출은
              </h2>
              <div className="flex flex-col items-center justify-start h-full">
                {/* 2일 전 대비 변화량 */}
                <div className="flex justify-between items-center text-[12px] md:text-xs text-gray-600 mt-2 w-full px-3">
                  <span>전일 대비</span>
                  <span
                    className={`${twoDaysAgoDiffColor} font-bold text-right`}
                  >
                    {twoDaysAgoDiffText}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[12px] md:text-xs text-gray-600 mt-2 w-full px-3">
                  <span>전년 대비</span>
                  <span
                    className={`${
                      comparisonData.yesterday_sales >
                      comparisonData.yesterday_lastyear
                        ? "text-red-500"
                        : "text-blue-500"
                    } font-bold text-right`}
                  >
                    {comparisonData.yesterday_sales >
                    comparisonData.yesterday_lastyear
                      ? "▲ "
                      : "▼ "}
                    {Math.abs(
                      comparisonData.yesterday_sales -
                        comparisonData.yesterday_lastyear
                    ).toLocaleString()}
                    원
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full bg-blue-300 shadow-sm p-4 rounded-[20px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-[76px] text-gray-500">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              매출 데이터 로딩 중...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-16 text-red-500">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              오류 발생: {error}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {/* 온라인 매출 */}
              <div className="bg-white rounded-lg p-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-100 text-blue-600 text-xs font-bold px-2 py-1 rounded-bl-lg">
                  {onlineSalesPercentage}%
                </div>
                <h4 className="text-xs mb-1">온라인 매출</h4>
                <p className="text-sm font-bold text-blue-600">
                  ₩ {onlineSales.toLocaleString()}
                </p>
                <div className="w-full bg-blue-100 h-1 mt-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-600 h-full rounded-full"
                    style={{ width: `${onlineSalesPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* 오프라인 매출 */}
              <div className="bg-white rounded-lg p-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-1 rounded-bl-lg">
                  {offlineSalesPercentage}%
                </div>
                <h4 className="text-xs mb-1">오프라인 매출</h4>
                <p className="text-sm font-bold text-indigo-600">
                  ₩ {offlineSales.toLocaleString()}
                </p>
                <div className="w-full bg-indigo-100 h-1 mt-2 rounded-full overflow-hidden relative">
                  <div
                    className="bg-indigo-600 h-full rounded-full absolute right-0"
                    style={{ width: `${offlineSalesPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 매출 추이 배너 */}
        <div
          onClick={() => router.push("/soho/sales/trend")}
          className="w-full bg-gradient-to-r from-blue-400 to-indigo-300 rounded-[20px] p-3 flex justify-between items-center cursor-pointer hover:shadow-sm transition-all duration-200"
        >
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 rounded-full p-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">매출 추이 현황</p>
              <p className="text-xs text-white">
                더 자세한 매출 추이를 확인해보세요
              </p>
            </div>
          </div>
          <div className="text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>

        {/* 캘린더 표시 */}
        <div className="w-full max-w-5xl flex">
          <div className="w-full flex-1">
            <Calendar dailySales={dailySales.daily_sales} />
          </div>
        </div>
      </div>
    </>
  );
}
