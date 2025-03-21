"use client";

import { Chart } from "react-google-charts";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSaleDataStore from "../../lib/store/saleDataStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/authStore";
import GNB from "@/components/GNB";
// import { useLocation } from 'react-router-dom';

export default function SalesDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { last7daySales, weekSalesData, error, fetchData, fetchWeekData } = useSaleDataStore();
  const [chartlast7Data, setChartlast7Data] = useState([[]]);
  const [chartTableData, setChartTableData] = useState([[]]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [saleListTarget, setSaleListTarget] = useState([]);
  const [saleListType, setSaleListType] = useState(0);
  // const [bweekOffset, setBWeekOffset] = useState(false);
  // const baseDt = useLocation().state?.date || new Date();

  const searchParams = useSearchParams();
  let param_date = searchParams.get("date");
  let base_date = new Date();

  if (param_date && /^\d{4}-\d{2}-\d{2}$/.test(param_date)) {
    base_date = new Date(param_date);
  }else{
    base_date = new Date();
    base_date.setDate(base_date.getDate() - 1);
  }

  // 어제 날짜 계산
  const day_nm = ["일", "월", "화", "수", "목", "금", "토"];
  const base_date_str = base_date.getFullYear() + String(base_date.getMonth() + 1).padStart(2, "0") + String(base_date.getDate()).padStart(2, "0");

  useEffect(() => {
    if (user?.business_number) {
      fetchData(user.business_number, base_date_str);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (user?.business_number) {
      fetchWeekData(user.business_number, base_date_str, weekOffset);
    }
  }, [weekOffset, user]);

  useEffect(() => {
    if (last7daySales) {
      const formattedData = [
        ["요일", "매출", { role: "style" }, { role: "tooltip", type: "string" }],
        ...last7daySales.sort((x,y) => Number(x.sale_date) - Number(y.sale_date)).map((item, idx) => [
          day_nm[new Date(item.sale_date.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3")).getDay()], // 요일 표시
          item.sum_amt ? Number(item.sum_amt) / 10000 : null,
          item.sale_date === base_date_str ? "#1E88E5" : "#FFE082", // 현재 요일이면 파란색, 아니면 회색
          item.sum_amt ? `${item.sale_date.replace(/^(\d{4})(\d{2})(\d{2})$/, "$2.$3")}일: ${Number(item.sum_amt).toLocaleString()} 원` : null, // 툴팁 (원 단위 금액)
        ])
      ];

      setChartlast7Data(formattedData);
    }
  }, [last7daySales]);

  useEffect(() => {
    console.log("weekSalesData 업데이트됨:", weekSalesData);
    if (weekSalesData) {
      const formattedData = [
        ["날짜", "기준", { role: "tooltip", type: "string" },
          "지난주", { role: "tooltip", type: "string" },
          "이전년도", { role: "tooltip", type: "string" }],
        ...weekSalesData.map((item, idx) => {
          const base_date = item.base.sale_date.replace(/^(\d{4})(\d{2})(\d{2})$/, "$2.$3");
          const day = day_nm[new Date(item.base.sale_date.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3")).getDay()]; // 요일 표시
          const dateLabel = base_date + `(${day})`;

          const prev7day_date = item.prev7day.sale_date.replace(/^(\d{4})(\d{2})(\d{2})$/, "$2.$3");
          const prevYear_date = item.prevYear.sale_date.replace(/^(\d{4})(\d{2})(\d{2})$/, "$2.$3");

          return [
            dateLabel,
            item.base.sum_amt !== null ? item.base.sum_amt / 10000 : 0,
            `${dateLabel} : ${Number(item.base.sum_amt || 0).toLocaleString()} 원`,

            item.prev7day.sum_amt !== null ? item.prev7day.sum_amt / 10000 : 0,
            `지난주(${prev7day_date}) : ${Number(item.prev7day.sum_amt || 0).toLocaleString()} 원`,

            item.prevYear.sum_amt !== null ? item.prevYear.sum_amt / 10000 : 0,
            `이전년도(${prevYear_date}) : ${Number(item.prevYear.sum_amt || 0).toLocaleString()} 원`,
          ]
        })
      ];

      setChartTableData(formattedData);

      const targetList = weekSalesData.map(x => {
        if (saleListType === 1) {
          return x.prev7day;
        }else if (saleListType === 2) {
          return x.prevYear;
        }else{
          return x.base;
        }
      });

      setSaleListTarget(targetList);
    }
  }, [weekSalesData]);

  useEffect(() => {
    if (weekSalesData) {
      const targetList = weekSalesData.map(x => {
        if (saleListType === 1) {
          return x.prev7day;
        }else if (saleListType === 2) {
          return x.prevYear;
        }else{
          return x.base;
        }
      });

      setSaleListTarget(targetList);
    }
  }, [saleListType]);

  // 📌 Google Chart 옵션
  const last7_options = {
    legend: "none",
    vAxis: { format: "#,###", minValue: 0 },
    chartArea: { width: "87%", height: "75%" },
    bar: { groupWidth: "40%" }, // 막대 너비 조정
    colors: ["#1E88E5"]
  };

  // Google Chart 옵션
  const week_options = {
    legend: { position: "top", alignment: "center" },
    vAxis: { format: "#,###", minValue: 0, viewWindow: { min: 0 }},
    chartArea: { width: "87%", height: "75%" },
    colors: ["#4285F4", "#FBBC05", "#34A853"], // 금주(파랑), 지난주(노랑), 이전년도(초록)
    lineWidth: 3,
    curveType: "function",
    pointSize: 5
  };

  return (
    <>
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
              <span className="text-[15px] font-extrabold">{base_date_str.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1.$2.$3")}일 매출 금액은</span>{" "}
              <div className="text-left -mt-1">
                <span className="text-red-500 font-extrabold">
                  {last7daySales && Number(last7daySales.find(x => x.sale_date == base_date_str)?.sum_amt || 0).toLocaleString()}원
                </span>{" "}
                <span className="text-[15px] font-extrabold">이에요</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 -mt-5 pb-1">
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

            {/*className={`px-4 py-1 rounded-lg text-white`} ${
            bweekOffset
             ? "bg-blue-500 hover:bg-blue-600" // 활성화 스타일
             : "bg-gray-300 cursor-not-allowed" // 비활성화 스타일
            } */}
            <button
              className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={() => setWeekOffset((prev) => prev + 1)}
              // disabled={!bweekOffset} // 비활성화 조건
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
                  onClick={() => router.push(`/sales-compare?month=${base_date_str.substring(0, 6)}`)}
                >
                  매출 분석 보러가기 <span className="ml-1">→</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ✅ 최근 7일 매출 리스트 */}
        <Card className="shadow-md border border-gray-300 rounded-lg">
          <CardHeader className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg sm:text-xl text-gray-800 font-bold flex items-center">
                📅 주간 매출 내역
                <span className="text-[14px] font-extrabold ml-2">
                  (기간 :
                  {saleListTarget &&
                    saleListTarget.length > 0 &&
                    saleListTarget[0].sale_date.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1.$2.$3") +
                      " ~ " +
                      saleListTarget[saleListTarget.length - 1].sale_date.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1.$2.$3")}
                  )
                </span>
              </CardTitle>
            </div>

            <div className="flex gap-2">
              <button
                className={`px-3 py-1 text-xs rounded-md transition border ${
                  saleListType === 0 ? "bg-blue-500 text-white border-blue-600" : "bg-blue-50 text-blue-600 border-blue-300"
                }`}
                onClick={() => setSaleListType(0)}
              >
                기준
              </button>
              <button
                className={`px-3 py-1 text-xs rounded-md transition border ${
                  saleListType === 1 ? "bg-yellow-500 text-white border-yellow-600" : "bg-yellow-50 text-yellow-600 border-yellow-300"
                }`}
                onClick={() => setSaleListType(1)}
              >
                지난주
              </button>
              <button
                className={`px-3 py-1 text-xs rounded-md transition border ${
                  saleListType === 2 ? "bg-green-500 text-white border-green-600" : "bg-green-50 text-green-600 border-green-300"
                }`}
                onClick={() => setSaleListType(2)}
              >
                이전년도
              </button>
            </div>
          </CardHeader>
          <CardContent className="-mt-5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-blue-50 text-gray-700">
                    <th className="p-3 text-center font-semibold">날짜</th>
                    <th className="p-3 text-center font-semibold">매출액 (원)</th>
                  </tr>
                </thead>
                <tbody>
                  {saleListTarget && saleListTarget.length > 0 &&
                    saleListTarget.map((item, index) => (
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
    </>
  );
}