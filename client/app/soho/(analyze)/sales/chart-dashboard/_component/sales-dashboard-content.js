"use client";

import { Chart } from "react-google-charts";
import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSaleDataStore from "@/lib/store/saleDataStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/authStore";
import Loading from "@/components/Loading";
import BusinessHeader from "@/components/BusinessHeader";

export default function SalesDashboardContent() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { last7daySales, weekSalesData, error, fetchData, fetchWeekData } =
    useSaleDataStore();
  const [chartlast7Data, setChartlast7Data] = useState([[]]);
  const [chartTableData, setChartTableData] = useState([[]]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [saleListTarget, setSaleListTarget] = useState([]);
  const [saleListType, setSaleListType] = useState(0);

  const searchParams = useSearchParams();
  let param_date = searchParams.get("date");
  let base_date = new Date();
  let week_start_date = new Date();
  let week_end_date = new Date();

  if (param_date && /^\d{8}$/.test(param_date)) {
    const year = parseInt(param_date.slice(0, 4));
    const month = parseInt(param_date.slice(4, 6)) - 1; // JS month is 0-indexed
    const day = parseInt(param_date.slice(6, 8));
    base_date = new Date(year, month, day);

    // 해당 날짜가 속한 주의 월요일 구하기
    // 0: 일요일, 1: 월요일, ..., 6: 토요일
    const dayOfWeek = base_date.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 일요일은 6, 나머지는 월요일부터 차이

    // 해당 주의 월요일 구하기
    week_start_date = new Date(base_date);
    week_start_date.setDate(base_date.getDate() - daysFromMonday);

    // 해당 주의 일요일 구하기
    week_end_date = new Date(week_start_date);
    week_end_date.setDate(week_start_date.getDate() + 6);

    console.log(`선택된 날짜: ${base_date.toISOString().slice(0, 10)}`);
    console.log(
      `해당 주 월요일: ${week_start_date.toISOString().slice(0, 10)}`
    );
    console.log(`해당 주 일요일: ${week_end_date.toISOString().slice(0, 10)}`);
  } else {
    base_date = new Date();
    base_date.setDate(base_date.getDate() - 1);

    // 오늘이 속한 주의 월요일 구하기
    const dayOfWeek = base_date.getDay();
    const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    week_start_date = new Date(base_date);
    week_start_date.setDate(base_date.getDate() - daysFromMonday);

    week_end_date = new Date(week_start_date);
    week_end_date.setDate(week_start_date.getDate() + 6);
  }

  // 날짜 포맷팅 함수
  const formatDate = (date) => {
    return (
      date.getFullYear() +
      String(date.getMonth() + 1).padStart(2, "0") +
      String(date.getDate()).padStart(2, "0")
    );
  };

  // 날짜 계산
  const day_nm = useMemo(() => ["일", "월", "화", "수", "목", "금", "토"], []);
  const base_date_str = formatDate(base_date);
  const week_start_str = formatDate(week_start_date);
  const week_end_str = formatDate(week_end_date);

  useEffect(() => {
    if (user?.business_number) {
      // 주 단위 데이터를 가져오도록 수정
      // 월요일부터 일요일까지의 데이터를 가져옴
      fetchData(user.business_number, week_start_str, week_end_str);
    }
  }, [isAuthenticated, user, week_start_str, week_end_str, fetchData]);

  useEffect(() => {
    if (user?.business_number) {
      fetchWeekData(user.business_number, base_date_str, weekOffset);
    }
  }, [weekOffset, user]);

  useEffect(() => {
    if (last7daySales) {
      const formattedData = [
        [
          "요일",
          "매출",
          { role: "style" },
          { role: "tooltip", type: "string" },
        ],
        ...last7daySales
          .sort((x, y) => Number(x.sale_date) - Number(y.sale_date))
          .map((item, idx) => {
            // 날짜 파싱
            const itemDate = new Date(
              item.sale_date.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3")
            );
            const dayOfWeek = day_nm[itemDate.getDay()];

            // 선택된 날짜와 동일한지 확인
            const isSelectedDate = item.sale_date === base_date_str;

            // 주의 시작과 끝 날짜 사이인지 확인
            const isInSelectedWeek =
              item.sale_date >= week_start_str &&
              item.sale_date <= week_end_str;

            return [
              dayOfWeek,
              item.sum_amt ? Number(item.sum_amt) / 10000 : null,
              isSelectedDate
                ? "#1E88E5"
                : isInSelectedWeek
                ? "#4CAF50"
                : "#FFE082",
              item.sum_amt
                ? `${item.sale_date.replace(
                    /^(\d{4})(\d{2})(\d{2})$/,
                    "$1.$2.$3"
                  )} (${dayOfWeek}): ${Number(
                    item.sum_amt
                  ).toLocaleString()} 원`
                : null,
            ];
          }),
      ];

      setChartlast7Data(formattedData);
    }
  }, [last7daySales, base_date_str, week_start_str, week_end_str]);

  useEffect(() => {
    if (weekSalesData) {
      const formattedData = [
        [
          "날짜",
          "기준",
          { role: "tooltip", type: "string" },
          { role: "style" }, // 기준 데이터 스타일
          "지난주",
          { role: "tooltip", type: "string" },
          "이전년도",
          { role: "tooltip", type: "string" },
        ],
        ...weekSalesData.map((item, idx) => {
          // 날짜 파싱 및 포맷팅
          const itemDate = new Date(
            item.base.sale_date.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3")
          );
          const dayOfWeek = day_nm[itemDate.getDay()];
          const base_date = item.base.sale_date.replace(
            /^(\d{4})(\d{2})(\d{2})$/,
            "$2.$3"
          );
          const dateLabel = base_date + `(${dayOfWeek})`;

          // 지난주 및 이전년도 날짜 포맷팅
          const prev7day_date = item.prev7day.sale_date.replace(
            /^(\d{4})(\d{2})(\d{2})$/,
            "$2.$3"
          );
          const prevYear_date = item.prevYear.sale_date.replace(
            /^(\d{4})(\d{2})(\d{2})$/,
            "$2.$3"
          );

          // 선택된 날짜와 동일한지 확인
          const isSelectedDate = item.base.sale_date === base_date_str;

          // 주의 시작과 끝 날짜 사이인지 확인
          const isInSelectedWeek =
            item.base.sale_date >= week_start_str &&
            item.base.sale_date <= week_end_str;

          // 데이터 포인트 스타일 설정
          let pointStyle = "#1E88E5"; // 기본 파란색
          if (isSelectedDate) {
            pointStyle =
              "point { size: 10; shape-type: circle; fill-color: #1E88E5; }"; // 선택된 날짜는 큰 원으로 강조
          } else if (isInSelectedWeek) {
            pointStyle =
              "point { size: 7; shape-type: circle; fill-color: #4CAF50; }"; // 선택된 주는 녹색으로 표시
          }

          return [
            dateLabel,
            item.base.sum_amt !== null ? item.base.sum_amt / 10000 : 0,
            `${item.base.sale_date.replace(
              /^(\d{4})(\d{2})(\d{2})$/,
              "$1.$2.$3"
            )} (${dayOfWeek}) : ${Number(
              item.base.sum_amt || 0
            ).toLocaleString()} 원`,
            pointStyle, // 스타일 적용
            item.prev7day.sum_amt !== null ? item.prev7day.sum_amt / 10000 : 0,
            `지난주(${prev7day_date}) : ${Number(
              item.prev7day.sum_amt || 0
            ).toLocaleString()} 원`,
            item.prevYear.sum_amt !== null ? item.prevYear.sum_amt / 10000 : 0,
            `이전년도(${prevYear_date}) : ${Number(
              item.prevYear.sum_amt || 0
            ).toLocaleString()} 원`,
          ];
        }),
      ];

      setChartTableData(formattedData);

      const targetList = weekSalesData.map((x) => {
        if (saleListType === 1) {
          return x.prev7day;
        } else if (saleListType === 2) {
          return x.prevYear;
        } else {
          return x.base;
        }
      });

      setSaleListTarget(targetList);
    }
  }, [
    weekSalesData,
    base_date_str,
    week_start_str,
    week_end_str,
    day_nm,
    saleListType,
  ]);

  useEffect(() => {
    if (weekSalesData) {
      const targetList = weekSalesData.map((x) => {
        if (saleListType === 1) {
          return x.prev7day;
        } else if (saleListType === 2) {
          return x.prevYear;
        } else {
          return x.base;
        }
      });

      setSaleListTarget(targetList);
    }
  }, [saleListType]);

  const last7_options = {
    legend: "none",
    vAxis: { format: "#,###", minValue: 0 },
    chartArea: { width: "87%", height: "75%" },
    bar: { groupWidth: "40%" },
    colors: ["#1E88E5"],
  };

  const week_options = {
    legend: { position: "top", alignment: "center" },
    vAxis: { format: "#,###", minValue: 0, viewWindow: { min: 0 } },
    chartArea: { width: "87%", height: "75%" },
    colors: ["#4285F4", "#b5b5b5", "#D3D3D3"], // 이번주(파란색), 지난주(회색), 이전년도(연한 회색)
    lineWidth: 3,
    curveType: "function",
    pointSize: 5,
    series: {
      0: {}, // 이번주 - 기본 설정 유지
      1: { lineWidth: 2 }, // 지난주 - 약간 얇게
      2: { lineWidth: 2, lineDashStyle: [4, 4] }, // 이전년도 - 점선 스타일 추가
    },
  };

  if (!last7daySales || !weekSalesData) {
    return (
      <div className="container mx-auto p-3 pt-0 pb-20">
        <div className="relative flex items-center justify-center mb-4">
          <Loading
            loading={true}
            size={150}
            color="blue"
            text="데이터를 불러오는 중..."
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <BusinessHeader
        business_name={user?.business_name}
        business_number={user?.business_number}
        sector={user?.smb_sector_en}
      />
      <div className="container mx-auto p-3 pt-16 pb-20">
        <Card className="mb-6 shadow-md border border-gray-300 rounded-lg p-5">
          <CardHeader className="flex p-0 justify-between items-start">
            <CardTitle className="text-2xl sm:text-3xl font-semibold text-gray-800">
              <span className="text-[15px] font-extrabold">
                {base_date_str.replace(/^(\d{4})(\d{2})(\d{2})$/, "$1.$2.$3")}일
                매출 금액은
              </span>{" "}
              <div className="text-left -mt-1">
                <span className="text-red-500 font-extrabold">
                  {last7daySales &&
                    Number(
                      last7daySales.find((x) => x.sale_date == base_date_str)
                        ?.sum_amt || 0
                    ).toLocaleString()}
                  원
                </span>{" "}
                <span className="text-[15px] font-extrabold">이에요</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 -mt-5 pb-1">
            <div className="relative top-4 flex flex-col items-center">
              <Chart
                chartType="ColumnChart"
                width="100%"
                height="250px"
                data={chartlast7Data}
                options={last7_options}
              />
              <div className="absolute right-2 -top-1 text-gray-500 text-[9px]">
                단위 : 만원
              </div>
            </div>
          </CardContent>
        </Card>

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
              className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              onClick={() => setWeekOffset((prev) => prev + 1)}
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
                  onClick={() =>
                    router.push(
                      `/soho/sales/monthly-compare?month=${base_date_str.substring(
                        0,
                        6
                      )}`
                    )
                  }
                >
                  월간 분석비교 보기 <span className="ml-1">→</span>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* <Card className="shadow-md border border-gray-300 rounded-lg">
          <CardHeader className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg sm:text-xl text-gray-800 font-bold flex items-center">
                📅 주간 매출 내역
                <span className="text-[14px] font-extrabold ml-2">
                  (기간 :
                  {saleListTarget &&
                    saleListTarget.length > 0 &&
                    saleListTarget[0].sale_date.replace(
                      /^(\d{4})(\d{2})(\d{2})$/,
                      "$1.$2.$3"
                    ) +
                      " ~ " +
                      saleListTarget[
                        saleListTarget.length - 1
                      ].sale_date.replace(
                        /^(\d{4})(\d{2})(\d{2})$/,
                        "$1.$2.$3"
                      )}
                  )
                </span>
              </CardTitle>
            </div>

            <div className="flex gap-2">
              <button
                className={`px-3 py-1 text-xs rounded-md transition border ${
                  saleListType === 0
                    ? "bg-blue-500 text-white border-blue-600"
                    : "bg-blue-50 text-blue-600 border-blue-300"
                }`}
                onClick={() => setSaleListType(0)}
              >
                기준
              </button>
              <button
                className={`px-3 py-1 text-xs rounded-md transition border ${
                  saleListType === 1
                    ? "bg-yellow-500 text-white border-yellow-600"
                    : "bg-yellow-50 text-yellow-600 border-yellow-300"
                }`}
                onClick={() => setSaleListType(1)}
              >
                지난주
              </button>
              <button
                className={`px-3 py-1 text-xs rounded-md transition border ${
                  saleListType === 2
                    ? "bg-green-500 text-white border-green-600"
                    : "bg-green-50 text-green-600 border-green-300"
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
                    <th className="p-3 text-center font-semibold">
                      매출액 (원)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {saleListTarget &&
                    saleListTarget.length > 0 &&
                    saleListTarget.map((item, index) => (
                      <tr
                        key={index}
                        className={`border-b hover:bg-gray-100 transition ${
                          index % 2 === 0 ? "" : "bg-gray-50"
                        }`}
                      >
                        <td className="p-3 text-left pl-8">
                          {item.sale_date.replace(
                            /^(\d{4})(\d{2})(\d{2})$/,
                            "$1.$2.$3"
                          )}
                          (
                          {
                            day_nm[
                              new Date(
                                parseInt(item.sale_date.substring(0, 4)),
                                parseInt(item.sale_date.substring(4, 6)) - 1,
                                parseInt(item.sale_date.substring(6, 8))
                              ).getDay()
                            ]
                          }
                          )
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
        </Card> */}
      </div>
    </>
  );
}
