"use client";
import {useEffect, useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {LucideUser, LucideSun} from "lucide-react";

const currentMonth = new Date().getMonth() + 1 + "월";
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayDate = `${yesterday.getMonth() + 1}월 ${yesterday.getDate()}일`;

export default function SalesSummary({todaySales = 1000000, yesterdaySales = 900000}) {
  const [sales, setSales] = useState(0); // ✅ useState 선언 추가

  useEffect(() => {
    let start = 0;
    const end = todaySales; // 오늘 매출
    const duration = 1500; // 1.5초 동안 카운트 업
    const increment = Math.ceil(end / (duration / 16)); // 16ms마다 증가

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

  return (
    <div className="flex flex-col gap-6 p-4 bg-gray-100 min-h-screen items-center">
      {/* 상단 변화량 표시 */}
      {/* 오늘 매출 및 어제 매출과 비교한 금액 표시 */}
      <div className="w-full flex flex-col md:flex-row justify-center items-center bg-blue-200 text-gray-900 py-2 px-4 rounded-md shadow-md text-center md:text-left">
        <p className="text-sm md:text-base font-semibold flex flex-wrap justify-center md:justify-start">
          오늘{" "}
          <span className="font-bold ml-1">
            {new Date().getMonth() + 1}월 {new Date().getDate()}일
          </span>{" "}
          매출 금액은
          <span className="text-yellow-600 font-bold mx-1"> {todaySales.toLocaleString()}원 </span> / 어제 매출까지{" "}
          <span className={`ml-1 ${salesDiff < 0 ? "text-red-500 font-bold" : "text-blue-500 font-bold"}`}>
            {salesDiff.toLocaleString()}원 {salesDiff < 0 ? "남았어요" : "초과했어요"}
          </span>
        </p>
      </div>
      {/* 매출 정보 */}
      <div className="flex justify-between w-full max-w-5xl gap-4">
        {/* 현재 월 매출 */}
        <Card className="w-1/2 h-30 p-1 bg-white shadow-lg border border-gray-300 flex flex-col justify-between">
          <CardContent className="p-2 flex flex-col justify-between h-full">
            <h2 className="text-xs md:text-lg font-bold text-center bg-black text-white p-[2px] rounded">
              {currentMonth} 매출
            </h2>
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-center mt-[2px] text-[10px] md:text-base">이번 달 현재까지 매출</p>
              <p className="text-center text-base md:text-lg font-bold text-red-500">{sales.toLocaleString()}원</p>
              <p className="text-center text-[9px] md:text-sm text-gray-600 mt-[2px]">
                강남구 커피 전문점 상위 <span className="text-red-500 font-bold">40%</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 어제 날짜 매출 */}
        <Card className="w-1/2 h-30 p-1 bg-white shadow-lg border border-gray-300 flex flex-col justify-between">
          <CardContent className="p-2 flex flex-col justify-between h-full">
            <h2 className="text-xs md:text-lg font-bold text-center bg-black text-white p-[2px] rounded">
              {yesterdayDate} 매출은
            </h2>
            <div className="flex flex-col items-center justify-center h-full">
              <p className="mt-[2px] text-[10px] md:text-sm text-gray-600 text-center break-words">
                전일 대비 <span className="text-red-500 font-bold">▲ 100,000원</span>
              </p>
              <p className="text-[10px] md:text-sm text-gray-600 text-center mt-[2px]">
                전월(2월) 대비 <span className="text-blue-500 font-bold">▼ 50,000원</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 매출 분석 */}
      <Card className="w-full p-3 bg-white shadow-lg border border-gray-300">
        <CardContent>
          <h2 className="text-sm md:text-lg font-bold text-center bg-black text-white p-1 rounded">
            {currentMonth} 매출 분석
          </h2>
          <div className="flex flex-nowrap justify-center md:justify-around mt-3 gap-2">
            {[
              {icon: <LucideUser className="w-5 md:w-8 h-5 md:h-8 text-gray-600" />, label: "주 성별", value: "남성"},
              {icon: <LucideUser className="w-5 md:w-8 h-5 md:h-8 text-gray-600" />, label: "주 연령대", value: "30대"},
              {
                icon: <LucideSun className="w-5 md:w-8 h-5 md:h-8 text-gray-600" />,
                label: "주 시간대",
                value: "12시~15시"
              }
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center w-20 md:w-32 h-20 md:h-32 border border-gray-300 rounded-lg p-2">
                {item.icon}
                <p className="text-[10px] md:text-sm text-gray-600 mt-1">{item.label}</p>
                <p className="font-bold text-xs md:text-base">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
