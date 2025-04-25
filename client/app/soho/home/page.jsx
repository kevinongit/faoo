"use client";

import {
  FaBell,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaStore,
  FaPiggyBank,
  FaCalculator,
  FaLink,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import useCalendarStore from "@/lib/store/useCalendarStore";
import { useRouter } from "next/navigation";
import CountUp from "react-countup";
import BusinessHeader from "@/components/BusinessHeader";
import HomeHeader from "@/components/HomeHeader";

// 매출/목표/달성률 UI 컴포넌트 (SSR/CSR hydration safe)
function SalesProgressBar({ goalValue, weekSales }) {
  const [isClient, setIsClient] = useState(false);
  const [percent, setPercent] = useState(0);
  const [over, setOver] = useState(0);

  /*목표 매출 연동 */
  useEffect(() => {
    setIsClient(true);
    // 실제 매출 데이터 연동시 아래 값을 수정
    const sales = weekSales;
    const goal = Number(goalValue);

    const percentage = Math.round((sales / goal) * 100);
    const over = percentage > 100 ? percentage - 100 : 0;

    setPercent(goal > 0 ? Math.min(100, percentage) : 0);
    setOver(over);
  }, [goalValue, weekSales]); // weekSales가 변경될 때도 다시 계산

  if (!isClient) return null;
  return (
    <>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-lg font-bold">₩{weekSales.toLocaleString()}</span>

        <span className="text-xs text-right text-green-500 flex justify-end w-full align-text-bottom">
          {goalValue && Number(goalValue) > 0 && over > 0 ? `▲+${over}% ` : ""}
        </span>
      </div>
      <div className="bg-gray-100 h-2 rounded-full">
        <div
          className={
            percent < 20
              ? "bg-indigo-200 h-full rounded-full"
              : percent < 40
              ? "bg-indigo-300 h-full rounded-full"
              : percent < 60
              ? "bg-indigo-400 h-full rounded-full"
              : percent < 80
              ? "bg-indigo-500 h-full rounded-full"
              : "bg-indigo-600 h-full rounded-full"
          }
          style={{ width: `${percent}%` }}
        ></div>
        <div className="text-xs text-blue-700 text-right mt-2">
          {goalValue && Number(goalValue) > 0
            ? `목표: ₩${Number(goalValue).toLocaleString()} (${percent}%)`
            : "목표 미설정 (0%)"}
        </div>
      </div>
    </>
  );
}

export default function SohoHome() {
  const router = useRouter();
  const [weekSales, setWeekSales] = useState(0);
  const [weekOffset, setWeekOffset] = useState(0);
  const isFirstDailySalesLoad = useRef(true);
  const { currentYear, currentMonth, setCurrentYear, setCurrentMonth } =
    useCalendarStore();
  const { dailySales, fetchDailySales } = useCalendarStore();

  /* 사용자정보 */
  const { user, isAuthenticated } = useAuthStore();
  const business_number = user?.business_number; //"1111100001"; // 사업자 번호
  const business_name = user?.business_name;

  const smb_sector_en = user?.smb_sector_en;

  const date = new Date();

  //오늘 년, 월 설정
  useEffect(() => {
    const currentYear = date.getFullYear();
    const currentMonth = "0" + (date.getMonth() + 1);
    setCurrentYear(currentYear);
    setCurrentMonth(currentMonth);

    //isFirstDailySalesLoad.current = true;
  }, []);

  // 주간 달력 전주, 다음주 관련 설정
  useEffect(() => {
    // 항상 최신 today를 사용해야 함 (date는 렌더 타이밍에 고정됨)
    const today = new Date();
    const monday = getMonday(today);
    const baseMonday = new Date(monday);
    baseMonday.setDate(monday.getDate() + weekOffset * 7);
    baseMonday.setHours(0, 0, 0, 0);
    console.log("[달력] 오늘:", today, "계산된 월요일:", baseMonday);
    setWeekDates(getWeekDates(baseMonday));
  }, [weekOffset, currentMonth, currentYear]);

  //년월이 바뀌면 데이터 조회
  useEffect(() => {
    if (business_number && currentYear && currentMonth)
      fetchDailySales(business_number, currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  useEffect(() => {
    const monday = getMondayWithOffset();
    setCurrentYear(monday.getFullYear());
    setCurrentMonth(String(monday.getMonth() + 1).padStart(2, "0"));
  }, [weekOffset]);

  // 월간 매출 비교 데이터 가져오기
  const fetchMonthlyComparison = async () => {
    try {
      const response = await fetch(
        `http://localhost:6100/api/dashboard/sales/monthly_comparison?business_number=${business_number}`
      );
      if (!response.ok) {
        throw new Error("월간 매출 비교 데이터를 불러오는 데 실패했습니다.");
      }
      const data = await response.json();
      console.log("월간 매출 비교:", data);
      return data;
    } catch (error) {
      console.error("월간 매출 비교 조회 오류:", error);
    }
  };

  const [monthlyData, setMonthlyData] = useState(null);
  const [salesMoM, setSalesMoM] = useState(0);

  useEffect(() => {
    if (business_number) {
      fetchMonthlyComparison().then((res) => {
        setMonthlyData(res);

        //res?.current_month?.total 하고 res?.previous_month?.total 로 전월대비 %계산
        const currentMonthTotal = res?.current_month?.total || 0;
        const previousMonthTotal = res?.previous_month?.total || 0;
        const percentage =
          previousMonthTotal === 0
            ? 0
            : Number((currentMonthTotal / previousMonthTotal) * 100).toFixed(0);

        setSalesMoM(percentage);
        //setSalesMoM(percentage);
      });
    }
  }, [business_number]);

  useEffect(() => {
    // 첫 데이터 로드가 아니면 처리하지 않음
    if (!isFirstDailySalesLoad.current) {
      return;
    }

    // dailySales가 없거나 daily_sales가 없을 경우 early return
    if (!dailySales || !dailySales.daily_sales) {
      return;
    }

    // 첫 데이터 로드 플래그를 false로 설정
    isFirstDailySalesLoad.current = false;

    // 현재 선택된 주의 월요일과 일요일 날짜 구하기
    const monday = getMondayWithOffset();
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // 해당 주의 매출 합계 계산
    let weekTotal = 0;
    Object.entries(dailySales.daily_sales).forEach(([date, amount]) => {
      const saleDate = new Date(date);
      saleDate.setHours(0, 0, 0, 0);

      if (saleDate >= monday && saleDate <= sunday) {
        weekTotal += Number(amount) || 0;
      }
    });

    setWeekSales(weekTotal);
  }, [dailySales]);

  /* 주간 달력 전주, 다음주 관련 설정*/
  // 이번주 일요일 구하기
  // 이번주 월요일 구하기
  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay() === 0 ? 7 : d.getDay(); // 일요일이면 7
    d.setDate(d.getDate() - (day - 1));
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // SSR/CSR hydration 에러 방지: weekDates는 클라이언트에서만 생성
  const [weekDates, setWeekDates] = useState([]);

  // weekDates에 dailySales 매출액 10만 단위 표시용 필드 추가
  const weekDatesWithSales = weekDates.map(({ date, ...rest }) => {
    // 날짜를 YYYY-MM-DD 포맷으로 변환
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const dateKey = `${yyyy}-${mm}-${dd}`;
    // 매출 데이터가 있으면 10만 단위, 없으면 0
    let salesTenThousand = 0;
    if (
      dailySales &&
      dailySales.daily_sales &&
      dailySales.daily_sales[dateKey]
    ) {
      // salesTenThousand =
      //   Math.round((dailySales.daily_sales[dateKey] / 100000) * 10) / 10; // 소수점 1자리

      salesTenThousand = Math.floor(dailySales.daily_sales[dateKey] / 10000);
    }
    return { date, ...rest, salesTenThousand, dateKey };
  });

  // weekOffset 반영해서 달력 상단 라벨/헤더에서 사용
  const getMondayWithOffset = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek - 1) + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);

    return monday;
  };
  const mondayWithOffset = getMondayWithOffset();

  function formatDate(d) {
    return `${d.getMonth() + 1}월 ${d.getDate()}일`;
  }
  // weekRangeLabel은 오늘 기준 이번주로 고정 (버튼 클릭과 무관)
  const today = date;
  const todayDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();
  const fixedMonday = new Date(today);
  fixedMonday.setDate(today.getDate() - (todayDayOfWeek - 1));
  const fixedSunday = new Date(fixedMonday);
  fixedSunday.setDate(fixedMonday.getDate() + 6);
  const weekRangeLabel = `${formatDate(fixedMonday)} ~ ${formatDate(
    fixedSunday
  )}`;

  const [showBankingBanner, setShowBankingBanner] = useState(true);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalInput, setGoalInput] = useState("");
  const [goalValue, setGoalValue] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("weekly_goal") || "";
    }
    return "";
  });

  // 매출 목표값을 API에서 가져오는 상태 (페이지 접속마다 새로 가져옴)
  const [apiGoalValue, setApiGoalValue] = useState("");

  // 목표값을 API에서 가져오는 함수
  const fetchGoalValue = async () => {
    try {
      // API 호출 예시 (실제 API 엔드포인트로 수정 필요)
      const response = await fetch(
        `http://localhost:6100/api/dashboard/sales/weekly_goal?business_number=${business_number}`
      );
      if (!response.ok) {
        throw new Error("주간 목표 데이터를 불러오는 데 실패했습니다.");
      }
      const data = await response.json();
      console.log("주간 목표 데이터:", data);

      // API에서 받아온 목표값 설정 (daa.goal_value 등 실제 응답 구조에 맞게 수정 필요)
      setApiGoalValue(
        data.goal_value ||
          Math.floor(Math.random() * 5000000 + 5000000).toString()
      );
    } catch (error) {
      console.error("주간 목표 조회 오류:", error);
      // API 오류 시 랜덤 값으로 설정 (테스트용)
      setApiGoalValue(Math.floor(Math.random() * 5000000 + 5000000).toString());
    }
  };

  const openGoalModal = () => {
    setGoalInput(goalValue || "");
    setGoalModalOpen(true);
  };
  const closeGoalModal = () => setGoalModalOpen(false);
  const handleGoalInput = (e) =>
    setGoalInput(e.target.value.replace(/[^0-9]/g, ""));
  const saveGoal = () => {
    setGoalValue(goalInput);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("weekly_goal", goalInput);
    }
    setGoalModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleaned = goalInput.replace(/,/g, "");
    const numericGoal = Number(cleaned);
    if (!numericGoal || isNaN(numericGoal) || numericGoal <= 0) {
      alert("유효한 목표 매출 금액을 입력해주세요.");
      return;
    }
    setGoalValue(cleaned);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("weekly_goal", cleaned);
    }
    setGoalModalOpen(false);
  };

  // 이번주(월~일) 날짜 배열 생성
  function getWeekDates(base) {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      // 월~일
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      d.setHours(0, 0, 0, 0);
      arr.push({
        date: d,
        day: d.getDate(),
        isToday: d.toDateString() === new Date().toDateString(),
      });
    }
    return arr;
  }

  return (
    <>
      <HomeHeader title="SOHO 홈" />
      <div className="min-h-screen bg-[#F3F5FC]">
        <div className="w-full pt-[50px]">
          <div>
            <BusinessHeader
              business_name={business_name}
              business_number={business_number}
              sector={smb_sector_en}
            />
          </div>
          <main className="w-full space-y-4 md:px-0 pb-16">
            {showBankingBanner && (
              <div className="bg-[#E4F2FF] p-4 relative mb-4">
                <button
                  className="absolute top-2 right-2 text-blue-600 hover:text-blue-800"
                  onClick={() => setShowBankingBanner(false)}
                  aria-label="배너 닫기"
                >
                  <FaTimes />
                </button>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-blue-600 font-medium mb-2">
                      기업스마트뱅킹 이용하기
                    </h3>
                    <p className="text-blue-500 text-sm">
                      다양한 매출리포트와 신용관리를 더 스마트하게
                    </p>
                  </div>
                  <div className="flex-shrink-0 mr-5">
                    <img
                      src="/images/ibk-comp.png"
                      className="w-12 h-12 rounded-lg"
                      alt="App icon"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 목표매출설정 모달 */}
            {goalModalOpen && (
              <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                    onClick={closeGoalModal}
                    aria-label="닫기"
                  >
                    <FaTimes />
                  </button>
                  <h2 className="text-lg font-semibold mb-4 text-center">
                    목표 매출 입력
                  </h2>
                  <form onSubmit={handleSubmit}>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9,]*"
                      className="w-full border rounded px-3 py-2 mb-4 text-right"
                      placeholder="예: 5,000,000"
                      value={
                        goalInput ? Number(goalInput).toLocaleString() : ""
                      }
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^0-9]/g, "");
                        setGoalInput(raw);
                      }}
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="w-full bg-blue-500 text-white rounded py-2 font-medium hover:bg-blue-600 transition"
                    >
                      저장
                    </button>
                  </form>
                </div>
              </div>
            )}

            <div className="space-y-4 px-4 mt-4">
              <div className="bg-white rounded-[20px] p-4 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">이번주 매출 현황</h3>
                    <button
                      className="ml-2 px-3 py-1 border border-blue-500 text-blue-500 rounded-full text-xs font-medium hover:bg-blue-50 transition"
                      type="button"
                      onClick={openGoalModal}
                    >
                      목표설정
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">{weekRangeLabel}</p>
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1 mb-4">
                    <SalesProgressBar
                      goalValue={apiGoalValue || goalValue} // API에서 가져온 값 우선 사용, 없으면 기존 값 사용
                      weekSales={weekSales}
                      setWeekSales={setWeekSales}
                    />
                  </div>
                </div>
              </div>

              {/* 주간 달력 */}
              <div
                className="bg-white rounded-[20px] p-4 shadow-sm"
                id="new-calendar"
              >
                <div className="flex items-center justify-between mb-4 relative">
                  <button
                    className="w-8 h-8 flex items-center justify-center text-gray-400 bg-white border border-gray-300 rounded-full shadow-sm hover:text-gray-600 hover:bg-gray-50 transition-colors"
                    onClick={() => setWeekOffset((w) => w - 1)}
                  >
                    <FaChevronLeft className="text-sm" />
                  </button>
                  <h3
                    className="font-medium cursor-pointer hover:text-blue-600"
                    onClick={() => router.push("/soho/sales/dashboard")}
                  >
                    {mondayWithOffset.getFullYear()}년{" "}
                    {mondayWithOffset.getMonth() + 1}월
                  </h3>
                  <button
                    className="w-8 h-8 flex items-center justify-center text-gray-400 bg-white border border-gray-300 rounded-full shadow-sm hover:text-gray-600 hover:bg-gray-50 transition-colors"
                    onClick={() => setWeekOffset((w) => w + 1)}
                  >
                    <FaChevronRight className="text-sm" />
                  </button>
                </div>
                <div
                  className="grid grid-cols-7 gap-1 relative"
                  style={{ borderRadius: "20px", padding: "12px" }}
                >
                  <div className="text-center text-xs text-gray-500 font-medium">
                    월
                  </div>
                  <div className="text-center text-xs text-gray-500 font-medium">
                    화
                  </div>
                  <div className="text-center text-xs text-gray-500 font-medium">
                    수
                  </div>
                  <div className="text-center text-xs text-gray-500 font-medium">
                    목
                  </div>
                  <div className="text-center text-xs text-gray-500 font-medium">
                    금
                  </div>
                  <div className="text-center text-blue-500 font-medium">
                    토
                  </div>
                  <div className="text-center text-red-500 font-medium">일</div>
                  {weekDatesWithSales.map((date, index) => (
                    <div
                      key={index}
                      className={`text-center p-1 ${
                        date.isToday ? "bg-indigo-50 rounded" : ""
                      } ${date.salesTenThousand > 0 ? "cursor-pointer" : ""}`}
                      onClick={() => {
                        if (date.salesTenThousand > 0) {
                          router.push(
                            `/soho/sales/daily-detail?date=${date.dateKey.replaceAll(
                              "-",
                              ""
                            )}`
                          );
                        }
                      }}
                    >
                      {date.day}
                      <div
                        className={`text-xs ${
                          date.isToday ? "text-indigo-600" : "text-blue-500"
                        }`}
                      >
                        {date.salesTenThousand > 0
                          ? date.salesTenThousand
                          : "-"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 이번달 매출 */}
              <div className="bg-white rounded-[20px] p-4 shadow-sm">
                <div className="grid grid-cols-2 gap-4 divide-x divide-gray-200">
                  <div className="pl-4 pr-4 flex flex-col items-center text-center">
                    <p className="text-sm text-gray-500 mb-1">이번달 매출</p>
                    <p className="text-lg font-bold">
                      ₩
                      <CountUp
                        end={monthlyData?.current_month?.total || 0}
                        duration={0.2}
                        separator=","
                      />
                    </p>
                    <div
                      className={`text-xs mt-1 flex items-center justify-center ${
                        salesMoM > 99
                          ? "text-green-500"
                          : salesMoM < 100
                          ? "text-blue-500"
                          : "text-gray-500"
                      }`}
                    >
                      <span className="ml-1">
                        {!isNaN(salesMoM) && salesMoM !== 0
                          ? `전월 매출의 ${salesMoM}%`
                          : salesMoM === 0
                          ? "전월 매출 없음"
                          : "-"}
                      </span>
                    </div>
                  </div>
                  <div className="pl-4 pr-4 flex flex-col items-center text-center">
                    <p className="text-sm text-gray-500 mb-1">
                      사업용 계좌 잔액
                    </p>
                    <p className="text-base font-bold text-blue-500">
                      사업용 계좌 연결
                    </p>
                    <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-2">
                      <span className="text-xs text-gray-500">
                        사용계좌
                        <br />
                        설정
                      </span>
                      <span className="text-xs text-gray-500">|</span>
                      <span className="text-xs text-gray-500">
                        입금계좌
                        <br />
                        변경
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 매장홍보, 금융, 쇼핑, 이벤트 */}
              <div>
                <div className="bg-white p-4 rounded-[20px] shadow-sm">
                  <div className="grid grid-cols-4 gap-3 divide-x divide-gray-200">
                    {[
                      {
                        Icon: FaStore,
                        color: "text-indigo-500",
                        text: "매장홍보",
                      },
                      {
                        Icon: FaPiggyBank,
                        color: "text-blue-500",
                        text: "금융",
                      },
                      {
                        Icon: FaCalculator,
                        color: "text-purple-500",
                        text: "매출관리",
                      },
                      { Icon: FaLink, color: "text-red-500", text: "연결관리" },
                    ].map((item, index) => (
                      <a
                        key={index}
                        href="#"
                        className="text-center flex flex-col items-center"
                      >
                        <item.Icon className={`${item.color} text-xl mb-2`} />
                        <p className="text-xs">{item.text}</p>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* 리뷰 모니터링 */}
              <div>
                <div className="bg-white rounded-[20px] p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">리뷰 모니터링</h3>
                    <a href="#" className="text-indigo-500 text-sm">
                      더보기
                    </a>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1">평균 평점</p>
                      <p className="text-lg font-bold text-blue-500">4.8</p>
                    </div>
                    <div className="text-center border-l border-r border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">긍정 리뷰</p>
                      <p className="text-lg font-bold text-green-500">92%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-1">전체 리뷰</p>
                      <p className="text-lg font-bold">128</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 진행중인 홍보 */}
              <div className="bg-white rounded-[20px] p-4 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">진행중인 홍보</h3>
                  <a href="#" className="text-indigo-500 text-sm">
                    더보기
                  </a>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Image
                        className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden"
                        src="/images/americano.png"
                        width={48}
                        height={48}
                        alt="커피 이미지"
                      />

                      <div>
                        <p className="text-sm font-medium">
                          아메리카노 1+1 쿠폰
                        </p>
                        <p className="text-xs text-gray-500">
                          사용 245/500장 · D-5
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-indigo-500">
                        49% 소진
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">금융 현황</h3>
                  <a href="#" className="text-indigo-500 text-sm">
                    더보기
                  </a>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">사업용 계좌 잔액</p>
                      <p className="font-medium">₩00,000,000</p>
                    </div>
                    <FaChevronRight className="text-gray-400" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">대출금 현황</p>
                      <p className="font-medium">₩50,000,000</p>
                    </div>
                    <FaChevronRight className="text-gray-400" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">금융자산 관리</p>
                      <p className="font-medium text-gray-400">
                        데이터 연결 필요
                      </p>
                      <p className="text-xs text-blue-500">연결하기 &gt;</p>
                    </div>
                    <FaChevronRight className="text-gray-400" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">노란우산공제</p>
                      <p className="font-medium">₩12,800,000</p>
                    </div>
                    <FaChevronRight className="text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
