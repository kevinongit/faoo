import useCalendarStore from "@/lib/store/useCalendarStore";
import { useRouter } from "next/navigation";

const Calendar = ({ dailySales }) => {
  const { currentYear, currentMonth, setCurrentYear, setCurrentMonth } =
    useCalendarStore();
  const router = useRouter();

  const today = new Date();

  //이전 달 & 다음 달 변경 시 Zustand 상태 업데이트
  const handlePrevMonth = () => {
    const currentMonthNum = parseInt(currentMonth, 10);
    if (currentMonthNum === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonthNum - 1);
    }
  };

  const handleNextMonth = () => {
    const currentMonthNum = parseInt(currentMonth, 10);
    if (currentMonthNum === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonthNum + 1);
    }
  };

  //해당 월의 첫째 날과 마지막 날짜 계산
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const calendarDays = [
    ...Array(firstDayOfMonth).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    // <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-md min-h-[350px]">
    <div className="w-full p-4 bg-white rounded-[20px] shadow-md min-h-[350px]">
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={handlePrevMonth}
          className="px-2 py-1 text-gray-600 hover:text-gray-900"
        >
          ◀
        </button>
        <h2 className="text-lg font-bold text-center">
          {currentYear}년 {parseInt(currentMonth, 10)}월
        </h2>
        <button
          onClick={handleNextMonth}
          className="px-2 py-1 text-gray-600 hover:text-gray-900"
        >
          ▶
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 text-gray-700 text-sm font-bold mb-1">
        {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
          <div
            key={day}
            className={`text-center p-1 ${
              index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : ""
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 + 매출 표시 */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          const dateKey = `${currentYear}-${String(currentMonth).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;
          const salesAmount = dailySales?.[dateKey] || 0;
          const formattedSales = salesAmount
            ? `${Math.floor(salesAmount / 10000)}`
            : "";

          // 오늘 날짜인지 확인
          const isToday =
            day &&
            currentYear === today.getFullYear() &&
            parseInt(currentMonth, 10) === today.getMonth() + 1 &&
            day === today.getDate();

          return (
            <div
              key={index}
              className={`text-center p-2 rounded-md flex flex-col items-center justify-center cursor-pointer ${
                isToday ? "bg-indigo-50" : ""
              }`}
              onClick={() =>
                router.push(
                  `/soho/sales/daily-detail?date=${dateKey.replaceAll("-", "")}`
                )
              }
            >
              <span>{day ? day : ""}</span>
              <span
                className={`${
                  isToday ? "text-indigo-600" : "text-blue-500"
                } text-xs h-4 flex items-center whitespace-nowrap`}
              >
                {formattedSales}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
