import {useEffect} from "react";
//import useCalendarStore from "@/store/useCalendarStore";
import useCalendarStore from "../../lib/store/useCalendarStore";
import {useState} from "react";

const Calendar = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const {salesData, fetchSalesData} = useCalendarStore();

  // 현재 월의 첫째 날과 마지막 날 계산
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const calendarDays = [...Array(firstDayOfMonth).fill(null), ...Array.from({length: daysInMonth}, (_, i) => i + 1)];

  // 이전 달 & 다음 달 변경 함수
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    setCurrentYear((prev) => (currentMonth === 0 ? prev - 1 : prev));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    setCurrentYear((prev) => (currentMonth === 11 ? prev + 1 : prev));
  };

  // 서버에서 매출 데이터 가져오기
  useEffect(() => {
    fetchSalesData(currentYear, currentMonth + 1);
  }, [currentYear, currentMonth, fetchSalesData]);

  // 천 단위 절삭 및 단위 변환 함수
  const formatSales = (amount) => {
    if (amount >= 1_000_000_000) return `${Math.floor(amount / 1_000_000_000)}십억`;
    if (amount >= 100_000_000) return `${Math.floor(amount / 100_000_000)}억`;
    if (amount >= 10_000_000) return `${Math.floor(amount / 10_000_000)}천만`;
    if (amount >= 1_000_000) return `${Math.floor(amount / 1_000_000)}백만`;
    if (amount >= 100_000) return `${Math.floor(amount / 100_000)}십만`;
    if (amount >= 10_000) return `${Math.floor(amount / 10_000)}만`;
    return "";
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-md min-h-[350px]">
      {/* 상단 월 변경 버튼 */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={handlePrevMonth}
          className="px-2 py-1 text-gray-600 hover:text-gray-900">
          ◀
        </button>
        <h2 className="text-lg font-bold text-center">
          {currentYear}년 {currentMonth + 1}월
        </h2>
        <button
          onClick={handleNextMonth}
          className="px-2 py-1 text-gray-600 hover:text-gray-900">
          ▶
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 text-gray-700 text-sm font-bold mb-1">
        {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
          <div
            key={day}
            className={`text-center p-1 ${index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : ""}`}>
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const salesAmount = salesData[day] || 0; // 해당 날짜의 매출 데이터 (기본값 0)
          const formattedSales = formatSales(salesAmount);

          return (
            <div
              key={index}
              className={`text-center min-w-[40px] aspect-square p-2 rounded-md flex flex-col items-center justify-center ${
                index % 7 === 0 ? "text-red-500" : index % 7 === 6 ? "text-blue-500" : "text-gray-900" // 일요일 빨간색, 토요일 파란색
              } ${
                day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
                  ? "bg-blue-50 text-gray-900 font-bold" // ✅ 가장 연한 색으로 변경
                  : ""
              }`}>
              <span>{day ? day : ""}</span>
              {formattedSales && <span className="text-green-600 text-xs">{formattedSales}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
