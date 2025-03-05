"use client";
import {useEffect, useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {LucideUser, LucideSun, LucideTrendingUp, LucideTrendingDown, LucideCalendar} from "lucide-react";
import Calendar from "@/components/ui/Calendar";
import GNB from "@/components/GNB";

const currentMonth = new Date().getMonth() + 1 + "월";
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayDate = `${yesterday.getMonth() + 1}월 ${yesterday.getDate()}일`;

export default function SalesSummary({todaySales = 1000000, yesterdaySales = 900000}) {
  const [sales, setSales] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = todaySales;
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
  }, [todaySales]);

  // 매출 변화량 계산
  const salesDiff = todaySales - yesterdaySales;
  const isIncrease = salesDiff > 0;
  const diffText = isIncrease ? `+${salesDiff.toLocaleString()}` : `${salesDiff.toLocaleString()}`;
  const diffColor = isIncrease ? "text-red-500" : "text-blue-500";
  const trendIcon = isIncrease ? (
    <LucideTrendingUp className="w-5 h-5 text-red-500" />
  ) : (
    <LucideTrendingDown className="w-5 h-5 text-blue-500" />
  );

  return (
    <div className="flex flex-col gap-6 p-4 bg-gray-50 min-h-screen items-center flex-grow pb-16">
      {/* 상단 변화량 표시 */}
      <div className="w-full flex flex-col md:flex-row justify-center items-center bg-blue-100 text-gray-900 py-3 px-5 rounded-lg shadow-md text-center md:text-left">
        <p className="text-sm md:text-base font-semibold flex flex-wrap justify-center md:justify-start">
          오늘{" "}
          <span className="font-bold ml-1">
            {new Date().getMonth() + 1}월 {new Date().getDate()}일
          </span>{" "}
          매출 금액은
          <span className="text-yellow-600 font-bold mx-1"> {todaySales.toLocaleString()}원 </span> / 어제 매출까지{" "}
          <span className={`ml-1 ${diffColor} font-bold flex items-center`}>
            {trendIcon} {diffText}원 {salesDiff < 0 ? "남았어요" : "초과했어요"}
          </span>
        </p>
      </div>

      {/* 매출 정보 */}
      <div className="flex justify-between w-full max-w-5xl gap-4">
        {/* 현재 월 매출 */}
        <Card className="w-1/2 h-32 p-2 bg-white shadow-lg border border-gray-300 flex flex-col justify-between rounded-lg">
          <CardContent className="p-2 flex flex-col justify-between h-full">
            <h2 className="text-xs md:text-lg font-bold text-center bg-gray-800 text-white p-[4px] rounded-lg">
              {currentMonth} 매출
            </h2>
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-center mt-1 text-[10px] md:text-base">이번 달 현재까지 매출</p>
              <p className="text-center text-lg md:text-xl font-bold text-red-500">{sales.toLocaleString()}원</p>
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
              <p className="mt-1 text-[10px] md:text-sm text-gray-600 text-center break-words">
                전일 대비 <span className="text-red-500 font-bold">▲ 100,000원</span>
              </p>
              <p className="text-[10px] md:text-sm text-gray-600 text-center mt-1">
                전월(2월) 대비 <span className="text-blue-500 font-bold">▼ 50,000원</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 매출 분석 */}
      <Card className="w-full p-4 bg-white shadow-lg border border-gray-300 rounded-lg">
        <CardContent>
          <h2 className="text-sm md:text-lg font-bold text-center bg-gray-800 text-white p-2 rounded-lg">
            {currentMonth} 매출 분석
          </h2>
          <div className="flex flex-nowrap justify-center md:justify-around mt-4 gap-3">
            {[
              {icon: <LucideUser className="w-6 md:w-9 h-6 md:h-9 text-gray-600" />, label: "주 성별", value: "남성"},
              {icon: <LucideUser className="w-6 md:w-9 h-6 md:h-9 text-gray-600" />, label: "주 연령대", value: "30대"},
              {
                icon: <LucideSun className="w-6 md:w-9 h-6 md:h-9 text-gray-600" />,
                label: "주 시간대",
                value: "12시~15시"
              }
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center w-24 md:w-36 h-24 md:h-36 border border-gray-300 rounded-lg p-3 shadow-md">
                {item.icon}
                <p className="text-[10px] md:text-sm text-gray-600 mt-2">{item.label}</p>
                <p className="font-bold text-xs md:text-base">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="w-full flex justify-center overflow-visible">
        <Calendar />
      </div>

      {/* GNB */}
      <GNB />
    </div>
  );
}
