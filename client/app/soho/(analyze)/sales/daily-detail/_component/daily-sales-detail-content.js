"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/authStore";
import Loading from "@/components/Loading";
import useDailySalesDetailStore from "@/lib/store/dailySalesDetailStore";
import BusinessHeader from "@/components/BusinessHeader";
// ECharts 사용을 위해 recharts 관련 임포트 제거
import ReactECharts from "echarts-for-react";
import Image from "next/image";

export default function DailySalesDetail() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const searchParams = useSearchParams();
  const { fetchData, ratioData } = useDailySalesDetailStore();
  const [platformData, setPlatformData] = useState([]);
  const [summary, setSummary] = useState({});
  const [selectedType, setSelectedType] = useState("금액별");
  const [hourlySalesData, setHourlySalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  const param_date = searchParams.get("date");
  let base_date = new Date();

  if (param_date && /^\d{8}$/.test(param_date)) {
    const year = parseInt(param_date.slice(0, 4));
    const month = parseInt(param_date.slice(4, 6)) - 1; // JS month is 0-indexed
    const day = parseInt(param_date.slice(6, 8));
    base_date = new Date(year, month, day);
  } else {
    base_date = new Date();
    base_date.setDate(base_date.getDate() - 1);
  }

  const base_date_str =
    base_date.getFullYear() +
    String(base_date.getMonth() + 1).padStart(2, "0") +
    String(base_date.getDate()).padStart(2, "0");

  useEffect(() => {
    if (user?.business_number) {
      fetchData(user.business_number, base_date_str);
    }
  }, [user]);

  useEffect(() => {
    if (ratioData && Object.keys(ratioData).length > 0) {
      const platformData = ratioData.platform.map((item) => {
        if (selectedType === "건수별") {
          return {
            name: item.platform_nm,
            value: item.cnt,
            key: item.platform_nm,
          };
        } else {
          return {
            name: item.platform_nm,
            value: item.sum_amt,
            key: item.platform_nm,
          };
        }
      });
      setPlatformData(platformData || []);

      const hourlySales = Object.entries(ratioData)
        .filter(([key]) => key.startsWith("time_")) // 'time_' 으로 시작하는 것만 필터
        .map((curr) => {
          return {
            hour: curr[0].split("_")[1] + "시",
            value: selectedType === "건수별" ? curr[1].cnt : curr[1].amt,
          };
        });
      setHourlySalesData(hourlySales);

      const maxTimeEntry = Object.entries(ratioData)
        .filter(([key]) => key.startsWith("time_")) // 'time_' 으로 시작하는 것만 필터
        .reduce((max, curr) =>
          (selectedType === "건수별" ? curr[1].cnt : curr[1].amt) >
          (selectedType === "건수별" ? max[1].cnt : max[1].amt)
            ? curr
            : max
        ); // 최대값 추출

      const maxAgeEntry = Object.entries(ratioData)
        .filter(([key]) => key.startsWith("age_")) // 'age_' 으로 시작하는 것만 필터
        .reduce((max, curr) =>
          (selectedType === "건수별" ? curr[1].cnt : curr[1].amt) >
          (selectedType === "건수별" ? max[1].cnt : max[1].amt)
            ? curr
            : max
        ); // 최대값 출

      const summary = {
        mainAge: maxAgeEntry[0].split("_")[1],
        mainHour: maxTimeEntry[0].split("_")[1],
        mainGender: ratioData.male >= ratioData.female ? "남성" : "여성",
      };
      setSummary(summary || {});
    }
  }, [ratioData, selectedType]);

  const getColor = (entry, index) => {
    const colors = [
      "#4285F4", // Google Blue
      "#EA4335", // Google Red
      "#FBBC05", // Google Yellow
      "#34A853", // Google Green
      "#5851DB", // Instagram Purple
      "#E1306C", // Instagram Pink
      "#FD1D1D", // Instagram Red
      "#F77737", // Instagram Orange
    ];

    // 특정 플랫폼에 대한 고정 색상 지정
    if (entry.key === "네이버" || entry.name === "네이버") return "#03C75A";
    if (entry.key === "카카오" || entry.name === "카카오") return "#FEE500";
    if (entry.key === "쿠팡이츠" || entry.name === "쿠팡이츠") return "#E1B327";
    if (entry.key === "배달의민족" || entry.name === "배달의민족")
      return "#44CCC6";
    if (entry.key === "요기요" || entry.name === "요기요") return "#FB0A58";
    if (entry.key === "오프라인" || entry.name === "오프라인") return "#333333";

    // 그 외의 경우 기본 색상 배열에서 선택
    return colors[index % colors.length];
  };

  if (ratioData && Object.keys(ratioData).length === 0) {
    return <Loading />;
  }

  return (
    <>
      <BusinessHeader
        business_name={user?.business_name}
        business_number={user?.business_number}
        sector={user?.sector}
      />
      <div className="container mx-auto p-3 pt-16 pb-20">
        {/* 온라인/오프라인 매출 요약 */}
        {ratioData && (
          <div className="flex justify-between mb-4 gap-2">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-sm border border-blue-200 w-full">
              <p className="text-xs text-gray-600 mb-1">온라인 매출</p>
              <p className="text-lg font-bold text-blue-600 text-right">
                {ratioData.online_sum?.toLocaleString() || 0}원
              </p>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-sm border border-gray-200 w-full">
              <p className="text-xs text-gray-600 mb-1">오프라인 매출</p>
              <p className="text-lg font-bold text-gray-700">
                {ratioData.offline_sum?.toLocaleString() || 0}원
              </p>
            </div>
          </div>
        )}
        {/* 금액별 / 건수별 선택 버튼 - Card 밖으로 이동 */}
        {/* 금액별 / 건수별 탭 */}
        <div className="w-full mb-2">
          <div className="flex">
            {["금액별", "건수별"].map((type) => (
              <button
                key={type}
                className={`flex-1 py-3 text-center font-semibold transition
                  ${
                    selectedType === type
                      ? "border-b-2 border-blue-500 bg-blue-200 text-blue-700"
                      : "border-b-2 border-transparent bg-blue-50 text-gray-600 hover:bg-gray-50"
                  }`}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 1. 플랫폼별 매출 비중 */}

        <Card className="mb-6 shadow-md border border-gray-300 rounded-lg">
          <CardContent className="m-0 p-0">
            <p className="text-sm mx-3 my-2">플랫폼별 매출 비중</p>
            <ReactECharts
              style={{ height: "220px", width: "100%", marginBottom: "20px" }}
              option={{
                tooltip: {
                  trigger: "item",
                  formatter: "{b}: {c} ({d}%)",
                },
                legend: {
                  orient: "horizontal",
                  bottom: 0,
                  data: platformData.map((item) => item.name),
                  type: "scroll", // 항목이 많을 경우 스크롤 활성화
                  formatter: function (name) {
                    return name; // 전체 텍스트 표시
                  },
                  textStyle: {
                    width: 120, // 텍스트 너비 더 확보
                    overflow: "breakAll",
                    ellipsis: false,
                  },
                  itemWidth: 15, // 범례 아이콘 너비 줄이기
                  itemGap: 15, // 범례 항목 간격 조정
                  pageButtonPosition: "end", // 페이지 버튼 위치
                  pageIconSize: 12, // 페이지 버튼 크기
                },
                series: [
                  {
                    name: selectedType === "금액별" ? "매출액" : "주문건수",
                    type: "pie",
                    radius: ["20%", "65%"],
                    center: ["50%", "45%"],
                    roseType: "area",
                    itemStyle: {
                      borderRadius: 5,
                    },
                    label: {
                      formatter: function (params) {
                        // 플랫폼 이름과 퍼센트를 두 줄로 표시
                        return (
                          params.name + "\n" + params.percent.toFixed(1) + "%"
                        );
                      },
                      overflow: "none",
                      width: 130,
                      lineHeight: 15, // 줄 간격 설정
                      rich: {
                        // 텍스트 스타일 설정
                        a: { fontSize: 12, lineHeight: 20 },
                        b: { fontSize: 11, lineHeight: 20 },
                      },
                    },
                    data: platformData.map((item, index) => ({
                      value: item.value,
                      name: item.name,
                      itemStyle: {
                        color: getColor(item, index),
                      },
                    })),
                  },
                ],
              }}
              opts={{ renderer: "canvas" }}
              notMerge={false}
              lazyUpdate={true}
              onEvents={{
                dblclick: () => {}, // 모바일에서 더블클릭 방지
              }}
            />
          </CardContent>

          {/* 요약 박스 - 새로운 디자인 */}
          <CardContent className="px-4 py-3 gap-2 border-t flex justify-around items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-b-[10px]">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-2 rounded-full mr-2">
                <Image
                  src="/images/gender.png"
                  alt="성별"
                  width={20}
                  height={20}
                />
              </div>
              <div>
                <div className="flex flex-col justify-center w-full">
                  <p className="text-xs text-center">주 성별</p>
                  <p className="font-bold text-indigo-600 w-12 text-center">
                    {summary.mainGender}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-indigo-100 p-2 rounded-full mr-2">
                <Image
                  src="/images/age.png"
                  alt="연령대"
                  width={20}
                  height={20}
                />
              </div>
              <div>
                <div className="flex flex-col justify-center w-full">
                  <p className="text-xs text-center">주 연령대</p>
                  <p className="font-bold text-indigo-600 w-12 text-center">
                    {summary.mainAge}대
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-indigo-100 p-2 rounded-full mr-2">
                <Image
                  src="/images/time.png"
                  alt="시간대"
                  width={20}
                  height={20}
                />
              </div>
              <div>
                <div className="flex flex-col justify-center w-full">
                  <p className="text-xs text-center">주 시간대</p>
                  <p className="font-bold text-green-600 w-12 text-center">
                    {summary.mainHour}시
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-md border border-gray-300 rounded-lg">
          <CardContent className="m-0 p-0">
            <p className="text-sm mx-3 my-2">시간대별 매출 추이</p>
            <div
              style={{
                height: "150px",
                width: "100%",
                margin: "0",
                padding: "0",
              }}
            >
              <ReactECharts
                option={{
                  grid: {
                    top: 0,
                    right: 10,
                    bottom: 30,
                    left: -30,
                    containLabel: true,
                  },
                  xAxis: {
                    type: "category",
                    data: hourlySalesData.map((item) => item.hour),
                    axisLine: {
                      show: true,
                      lineStyle: {
                        color: "#ccc",
                      },
                    },
                    axisTick: { show: false },
                    axisLabel: {
                      fontSize: 12,
                      interval: 2,
                    },
                    splitLine: {
                      show: true,
                      lineStyle: {
                        color: "#E0E6F1",
                        type: "dashed",
                        width: 1,
                      },
                    },
                  },
                  yAxis: {
                    type: "value",
                    show: false,
                    splitLine: {
                      show: true,
                      lineStyle: {
                        color: "#E0E6F1",
                        type: "dashed",
                        width: 1,
                      },
                    },
                  },
                  tooltip: {
                    trigger: "axis",
                    formatter: function (params) {
                      const data = params[0];
                      return `${data.name}: ${data.value.toLocaleString()}원`;
                    },
                  },
                  series: [
                    {
                      data: hourlySalesData.map((item) => item.value),
                      type: "line",
                      smooth: true,
                      symbol: "none",
                      lineStyle: {
                        width: 2,
                        color: "#FB8C00",
                      },
                      areaStyle: {
                        color: {
                          type: "linear",
                          x: 0,
                          y: 0,
                          x2: 0,
                          y2: 1,
                          colorStops: [
                            {
                              offset: 0,
                              color: "#FFE0B2",
                            },
                            {
                              offset: 1,
                              color: "rgba(255, 224, 178, 0.2)",
                            },
                          ],
                        },
                      },
                    },
                  ],
                  onEvents: {
                    dblclick: () => {},
                  },
                }}
                style={{ height: "100%", width: "100%" }}
              />
            </div>
          </CardContent>
        </Card>

        {/* 하단 분석 버튼 배너 영역 */}
        <div className="w-full mb-4">
          <div className="flex w-full">
            <button
              className="w-1/2 py-4 bg-blue-400 text-white text-center font-semibold rounded-l-[20px]"
              onClick={() =>
                router.push(`/soho/sales/chart-dashboard?date=${base_date_str}`)
              }
            >
              주간 분석비교 보기
            </button>
            <button
              className="w-1/2 py-4 bg-green-500 text-white text-center font-semibold rounded-r-[20px]"
              onClick={() => router.push(`/soho/sales/monthly-compare`)}
            >
              월간 분석비교 보기
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
