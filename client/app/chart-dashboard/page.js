"use client";

import { Chart } from "react-google-charts";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSaleDataStore from "../../lib/store/saleDataStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";
import GNB from "@/components/GNB";

export default function SalesDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { last7daySales, weekSalesData, error, fetchData, fetchWeekData } = useSaleDataStore();
  const [chartlast7Data, setChartlast7Data] = useState([[]]);
  const [chartTableData, setChartTableData] = useState([[]]);
  const [weekOffset, setWeekOffset] = useState(0);

  // 어제 날짜 계산
  const day_nm = ["일", "월", "화", "수", "목", "금", "토"];
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const yesterday = now.getFullYear() + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0");

  const getLast7day = () => {
    const base = new Date();
    base.setDate(base.getDate() - 1);

    const result = [{
      date: base.getFullYear() + String(base.getMonth() + 1).padStart(2, "0") + String(base.getDate()).padStart(2, "0"),
      dayNm: day_nm[base.getDay()]
    }];

    for (let i=6; i>0; i--) {
      base.setDate(base.getDate() - 1);

      result.push({
        date: base.getFullYear() + String(base.getMonth() + 1).padStart(2, "0") + String(base.getDate()).padStart(2, "0"),
        dayNm: day_nm[base.getDay()]
      })
    }

    return result;
  }

  const last7days = getLast7day();

  // 주별 시작 날짜와 종료 날짜 계산
  const getWeekRange = (offset = 0) => {
    const today = new Date();
    today.setDate(today.getDate() + offset * 7);

    // 🔹 월요일 시작으로 변경
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);

    // 🔹 일요일로 끝나도록 변경
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // 🔹 시작부터 끝까지 모든 날짜 생성
    const allDates = [];
    for (let d = new Date(startOfWeek); d <= endOfWeek; d.setDate(d.getDate() + 1)) {
      allDates.push({
        dt: d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0"),
        nm: day_nm[d.getDay()]
      });
    }

    return {
      start: allDates[0].dt, // 주 시작일 (월요일)
      end: allDates[allDates.length - 1].dt, // 주 종료일 (일요일)
      allDates, // 주 전체 날짜 배열 (yyyyMMdd 형식)
    };
  };

  const { start, end, allDates } = getWeekRange(weekOffset);

  useEffect(() => {
    if (user?.business_number) {
      fetchData(user.business_number);
      fetchWeekData(user.business_number, start.replaceAll(".", ""));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (user?.business_number) {
      fetchWeekData(user.business_number, start.replaceAll(".", ""));
    }
  }, [weekOffset, user]);

  useEffect(() => {
    if (last7daySales) {
      const formattedData = [
        ["요일", "매출", { role: "style" }, { role: "tooltip", type: "string" }],
        ...last7days.sort((x,y) => Number(x.date) - Number(y.date)).map((item, idx) => [
          item.dayNm, // 요일 표시
          Number(last7daySales.find(x => x.sale_date == item.date)?.sum_amt || 0) / 10000,
          item.date === yesterday ? "#1E88E5" : "#FFE082", // 현재 요일이면 파란색, 아니면 회색
          `${item.date.replace(/^(\d{4})(\d{2})(\d{2})$/, "$2.$3")}일: ${Number(last7daySales.find(x => x.sale_date == item.date)?.sum_amt || 0).toLocaleString()} 원`, // 툴팁 (원 단위 금액)
        ]),
      ];

      setChartlast7Data(formattedData);
    }
  }, [last7daySales]);

  useEffect(() => {
    if (weekSalesData) {
      const formattedData = [
        ["날짜", "기준", { role: "tooltip", type: "string" },
          "지난주", { role: "tooltip", type: "string" },
          "이전년도", { role: "tooltip", type: "string" }],
        ...allDates.map((item, idx) => {
          const dateLabel = item.dt.replace(/^(\d{4})(\d{2})(\d{2})$/, "$2.$3") + `(${item.nm})`;

          const baseWeekValue = weekSalesData.base_week.find(x => x.sale_date == item.dt)?.sum_amt || null;
          const prevWeekValue = weekSalesData.result_7day[idx]?.sum_amt || null;
          const prevYearValue = weekSalesData.result_prevYear[idx]?.sum_amt || null;

          return [
            dateLabel,
            baseWeekValue !== null ? baseWeekValue / 10000 : idx == 0 ? 0 : null, // 금주 데이터
            baseWeekValue !== null ? `${dateLabel} : ${Number(baseWeekValue).toLocaleString()} 원` : null, // 금주 Tooltip

            prevWeekValue !== null ? prevWeekValue / 10000 : null, // 지난주 데이터
            prevWeekValue !== null ? `지난주(${weekSalesData.result_7day[idx]?.sale_date.replace(/^(\d{4})(\d{2})(\d{2})$/, "$2.$3")}) : ${Number(prevWeekValue).toLocaleString()} 원` : null, // 지난주 Tooltip

            prevYearValue !== null ? prevYearValue / 10000 : null, // 전년 동일주 데이터
            prevYearValue !== null ? `이전년도(${weekSalesData.result_prevYear[idx]?.sale_date.replace(/^(\d{4})(\d{2})(\d{2})$/, "$2.$3")}) : ${Number(prevYearValue).toLocaleString()} 원` : null, // 전년 동일주 Tooltip
          ];
        })
      ];

      setChartTableData(formattedData);
    }
  }, [weekSalesData]);

  // 📌 Google Chart 옵션
  const last7_options = {
    legend: "none",
    vAxis: { format: "short", minValue: 0 },
    chartArea: { width: "87%", height: "75%" },
    bar: { groupWidth: "40%" }, // 막대 너비 조정
    colors: ["#1E88E5"]
  };

  // Google Chart 옵션
  const week_options = {
    legend: { position: "top", alignment: "center" },
    vAxis: { format: "short" },
    chartArea: { width: "87%", height: "75%" },
    colors: ["#4285F4", "#FBBC05", "#34A853"], // 금주(파랑), 지난주(노랑), 이전년도(초록)
    lineWidth: 3,
    curveType: "function",
    pointSize: 5
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-3 pt-0 pb-20">
        <div className="relative flex items-center justify-center mb-4">
          {/* 🔹 둥근 이전 버튼 (왼쪽 정렬) */}
          <button
            className="absolute left-0 p-2 bg-gray-200 hover:bg-gray-300 rounded-full shadow-md transition"
            onClick={() => router.back()} // 🔹 이전 페이지로 이동
          >
            <span className="text-lg font-bold text-gray-600">&lt;</span>
          </button>

          {/* 🔹 중앙 타이틀 */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            일일 브리핑
          </h1>
        </div>
        {/* ✅ 매출 개요 카드 */}
        <Card className="mb-6 shadow-md border border-gray-300 rounded-lg p-5">
          <CardHeader className="flex p-0 justify-between items-start">
            {/* 제목 */}
            <CardTitle className="text-2xl sm:text-3xl font-semibold text-gray-800">
              <span className="text-[15px] font-extrabold">어제 매출 금액은</span>{" "}
              <span className="text-red-500 font-extrabold">
                {last7daySales && Number(last7daySales.find(x => x.sale_date == yesterday)?.sum_amt || 0).toLocaleString()}원
              </span>{" "}
              <span className="text-[15px] font-extrabold">이에요</span>
              <div className="text-left -mt-6">
                <span className="text-[10px] font-extrabold">(날짜: {yesterday.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1.$2.$3")})</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-1">
            <div className="relative top-4 flex flex-col items-center">
              <Chart chartType="ColumnChart" width="100%" height="250px" data={chartlast7Data} options={last7_options} />
              <div className="absolute right-2 -top-1 text-gray-500 text-[9px]">
                단위 : 만원
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ✅ 일별 매출 비교 꺾은선 차트 */}
        <Card className="mb-6 shadow-md border border-gray-300 rounded-lg p-5 pb-3">
          <CardHeader className="flex p-0 flex-row justify-between items-center">
            <button
              className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={() => setWeekOffset((prev) => prev - 1)}
            >
              이전주
            </button>
            <CardTitle className="flex-grow text-center text-lg sm:text-xl font-semibold text-gray-800">
              주간 매출 비교
            </CardTitle>
            <button
              className={`px-4 py-1 rounded-lg text-white ${
                weekOffset >= 0
                  ? "bg-gray-300 cursor-not-allowed" // 비활성화 스타일
                  : "bg-blue-500 hover:bg-blue-600" // 활성화 스타일
              }`}
              onClick={() => setWeekOffset((prev) => prev + 1)}
              disabled={weekOffset >= 0} // 비활성화 조건
            >
              다음주
            </button>
          </CardHeader>
          <CardContent className="p-0 pb-1">
            <div className="relative top-4 flex flex-col items-center">
              <Chart
                chartType="LineChart"
                width="100%"
                height="250px"
                data={chartTableData}
                options={week_options}
              />

              <div className="absolute right-2 -top-1 text-gray-500 text-[9px]">
                단위 : 만원
              </div>
            </div>
          </CardContent>

          <CardContent className="p-0">
            <div className="mt-3 flex w-full">
              <div className="ml-0 mt-3">
                <button
                  className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-blue-500 text-sm font-medium transition border border-gray-300"
                  onClick={() => router.push("/sales-compare")}
                >
                  매출 분석 보러가기 <span className="ml-1">→</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ✅ 최근 7일 매출 리스트 */}
        <Card className="shadow-md border border-gray-300 rounded-lg">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-gray-800 font-bold">
              📅 주간 매출 내역
              <span className="text-[14px] font-extrabold">
                <br/>
                (기간 : {start.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1.$2.$3")} ~ {end.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1.$2.$3")})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-blue-50 text-gray-700">
                    <th className="p-3 text-center font-semibold">날짜</th>
                    <th className="p-3 text-center font-semibold">매출액 (원)</th>
                  </tr>
                </thead>
                <tbody>
                  {weekSalesData && weekSalesData.base_week &&
                    weekSalesData.base_week.sort((x,y) => Number(y.sale_date) - Number(x.sale_date)).map((item, index) => (
                      <tr key={index} className={`border-b hover:bg-gray-100 transition ${index % 2 === 0 ? '' : 'bg-gray-50'}`}>
                        <td className="p-3 text-left pl-8">
                          {item.sale_date.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1.$2.$3")}
                          ({day_nm[new Date(parseInt(item.sale_date.substring(0, 4)), parseInt(item.sale_date.substring(4, 6)) - 1, parseInt(item.sale_date.substring(6, 8))).getDay()]})
                        </td>
                        <td className="p-3 text-right font-semibold">
                          {Number(item.sum_amt).toLocaleString()} 원
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <GNB />
    </ProtectedRoute>
  );
}