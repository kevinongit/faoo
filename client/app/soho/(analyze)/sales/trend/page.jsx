"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ReactECharts from "echarts-for-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/authStore";
import BusinessHeader from "@/components/BusinessHeader";
import BackHeader from "@/components/BackHeader";
import { useRouter } from "next/navigation";
import Image from "next/image";

// 최근 6개월 매출 차트 컴포넌트
const RecentSixMonthsChart = ({ yearData }) => {
  // 현재 날짜 정보 가져오기
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear(); // 2025
  const currentMonth = currentDate.getMonth() + 1; // 4 (4월)

  // 최근 6개월 기간 계산 (2024년 11월 ~ 2025년 4월)
  const recentMonths = [];
  const recentOnlineData = [];
  const recentOfflineData = [];
  const recentTotalData = []; // 총 매출 데이터 추가

  // 월 순서를 11, 12, 1, 2, 3, 4월 순서로 정렬
  for (let i = 5; i >= 0; i--) {
    // 월 계산 (0부터 시작하므로 -1 필요)
    let month = currentMonth - i;
    let year = currentYear;

    // 이전 연도로 넘어가는 경우 처리
    if (month <= 0) {
      month += 12;
      year -= 1;
    }

    // 월 이름 포맷팅 (예: "11월")
    recentMonths.push(`${month}월`);

    // 해당 연도와 월의 데이터 찾기
    const yearObj = yearData.find((item) => item.year === year);
    if (yearObj) {
      const monthData = yearObj.data[month - 1]; // 배열은 0부터 시작하므로 -1
      if (monthData) {
        recentOnlineData.push(monthData.online);
        recentOfflineData.push(monthData.offline);
        recentTotalData.push(monthData.online + monthData.offline); // 총 매출 계산
      } else {
        // 데이터가 없는 경우 0으로 처리
        recentOnlineData.push(0);
        recentOfflineData.push(0);
        recentTotalData.push(0); // 총 매출 계산
      }
    } else {
      // 해당 연도 데이터가 없는 경우 0으로 처리
      recentOnlineData.push(0);
      recentOfflineData.push(0);
      recentTotalData.push(0); // 총 매출 계산
    }
  }

  // 차트 옵션 설정
  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: function (params) {
        let tooltip = `<div style="font-weight:bold">${params[0].name}</div>`;

        params.forEach((param) => {
          if (
            param.seriesName === "온라인 매출" ||
            param.seriesName === "오프라인 매출"
          ) {
            // null 값 처리 추가
            const value =
              param.value !== null && param.value !== undefined
                ? param.value
                : 0;
            tooltip += `<div style="color:${param.color}">${
              param.seriesName
            }: ${value.toLocaleString()}원</div>`;
          }
        });

        // 총 매출 계산
        const onlineParam = params.find((p) => p.seriesName === "온라인 매출");
        const offlineParam = params.find(
          (p) => p.seriesName === "오프라인 매출"
        );

        // 오프라인 매출이 없는 경우도 처리
        if (onlineParam) {
          const onlineValue = onlineParam.value || 0;
          const offlineValue =
            offlineParam && offlineParam.value !== null
              ? offlineParam.value
              : 0;
          const totalValue = onlineValue + offlineValue;
          tooltip += `<div style="font-weight:bold">총 매출: ${totalValue.toLocaleString()}원</div>`;
        }

        return tooltip;
      },
    },
    legend: {
      data: ["온라인 매출", "오프라인 매출"],
      right: 0,
      bottom: 0,
      itemGap: 12,
      itemWidth: 12,
      itemHeight: 12,
      pageButtonGap: 8,
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "15%",
      top: "15%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: recentMonths,
    },
    yAxis: {
      type: "value",
      axisLabel: {
        show: false, // Y축 눈금 레이블 숨기기
      },
      splitLine: {
        show: false, // Y축 구분선 숨기기
      },
      axisLine: {
        show: false, // Y축 선 숨기기
      },
      axisTick: {
        show: false, // Y축 틱 마크 숨기기
      },
    },
    series: [
      {
        name: "온라인 매출",
        type: "bar",
        stack: "매출",
        emphasis: { focus: "series" },
        itemStyle: { color: "#92B4F4" },
        barWidth: "30%",
        data: recentOnlineData,
      },
      {
        name: "오프라인 매출",
        type: "bar",
        stack: "매출",
        emphasis: { focus: "series" },
        itemStyle: {
          color: "#5E7CE2",
        },
        barWidth: "30%",
        showSymbol: false,
        connectNulls: true,
        // 막대 위에 총 매출 표시
        label: {
          show: true,
          position: "top",
          formatter: function (params) {
            // 해당 인덱스의 총 매출 계산
            const onlineValue = recentOnlineData[params.dataIndex] || 0;
            // null 값 처리 추가
            const offlineValue =
              params.value !== null && params.value !== undefined
                ? params.value
                : 0;
            const totalValue = onlineValue + offlineValue;

            // 1월에도 총 매출 표시
            return (totalValue / 10000).toFixed(0) + "만";
          },
          textStyle: {
            fontWeight: "bold",
            color: "#2563EB",
          },
        },
        // 1월에도 레이블이 표시되도록 null로 변환하지 않고 0 유지
        data: recentOfflineData,
      },
    ],
  };

  // 동적 라운드 처리: 각 stack의 최상단 바에만 borderRadius 적용
  const seriesArr = option.series;
  const stackInfo = {};

  // 오프라인 매출이 0인 월 확인 (1월)
  const zeroOfflineMonths = {};
  recentOfflineData.forEach((value, index) => {
    if (value === 0) {
      zeroOfflineMonths[index] = true;
    }
  });

  // 각 스택의 최상단 바 확인
  seriesArr.forEach((s, i) => {
    s.data.forEach((d, j) => {
      const raw = d && typeof d === "object" && "value" in d ? d.value : d;
      if (raw != null) {
        stackInfo[s.stack] = stackInfo[s.stack] || [];
        stackInfo[s.stack][j] = i;
      }
    });
  });

  // 라운드 처리 적용
  seriesArr.forEach((s, i) => {
    s.data = s.data.map((d, j) => {
      const raw = d && typeof d === "object" && "value" in d ? d.value : d;
      let borderRadius = [0, 0, 0, 0];

      // 오프라인 매출이 0인 월은 온라인 매출에 라운드 처리
      if (s.name === "온라인 매출" && zeroOfflineMonths[j]) {
        borderRadius = [8, 8, 0, 0];
      }
      // 그 외의 경우 최상단 바에만 라운드 처리
      else {
        const isEnd = stackInfo[s.stack] && stackInfo[s.stack][j] === i;
        if (isEnd) {
          borderRadius = [8, 8, 0, 0];
        }
      }

      return { value: raw, itemStyle: { borderRadius } };
    });
  });

  return (
    <div className="h-[180px]">
      <ReactECharts
        option={option}
        style={{ height: "180px", width: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
};

export default function Trend() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [yearData, setYearData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [showPrevYearAvg, setShowPrevYearAvg] = useState(true);
  const chartRef = useRef(null);

  // 사용자 정보 가져오기
  const { user } = useAuthStore();
  const business_name = user?.business_name || "내 비즈니스";
  const business_number = user?.business_number || "";
  const smb_sector_en = user?.smb_sector_en || "";

  // 데이터 가져오기 (실제로는 API 호출)
  useEffect(() => {
    // 로딩 시작
    setLoading(true);

    // 실제 API를 호출하여 데이터 가져오기
    const fetchData = async () => {
      try {
        // 현재 연도와 이전 2년 데이터 범위 설정
        const currentYear = new Date().getFullYear();
        const years = [currentYear - 1, currentYear];
        setAvailableYears(years);

        // API 호출을 위한 날짜 범위 설정
        const fromDate = `${years[0]}01`; // 시작 연도의 1월
        const toDate = `${currentYear}+${String(
          new Date().getMonth() + 1
        ).padStart(2, "0")}`; // 현재 년월

        // API 호출
        const response = await fetch(
          "http://localhost:6100/saleapi/monthSales",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              business_number: business_number || "1001010001", // 사용자 정보가 없는 경우 기본값 사용
              from_date: fromDate,
              to_date: toDate,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`API 호출 실패: ${response.status}`);
        }

        // API 응답 데이터 파싱
        const apiData = await response.json();

        // 데이터 변환 및 상태 업데이트
        const transformedData = processApiData(apiData, years);
        setYearData(transformedData);
        setSelectedYear(currentYear);
        setLoading(false);
      } catch (error) {
        console.error("데이터 로딩 중 오류 발생:", error);
      }
    };

    // API 데이터를 차트에서 사용할 형식으로 변환하는 함수
    const processApiData = (apiData, years) => {
      // 연도별로 데이터 그룹화
      return years.map((year) => {
        // 해당 연도의 데이터만 필터링
        const yearPrefix = year.toString();
        const yearData = apiData.filter((item) =>
          item.sale_month.startsWith(yearPrefix)
        );

        // 월별 데이터 생성
        const monthlyData = Array.from({ length: 12 }, (_, i) => {
          const month = i + 1;
          const monthStr = month.toString().padStart(2, "0");
          const monthData = yearData.find(
            (item) => item.sale_month === `${year}${monthStr}`
          );

          if (monthData) {
            return {
              year,
              month,
              online: monthData.on_amt,
              offline: monthData.off_amt,
              total: monthData.sum_amt,
            };
          } else {
            // 데이터가 없는 경우 기본값 설정
            return {
              year,
              month,
              online: 0,
              offline: 0,
              total: 0,
            };
          }
        });

        return {
          year,
          data: monthlyData,
        };
      });
    };

    fetchData();
  }, []);

  // 최고 매출 월과 최고 매출액 구하기
  const getMaxSalesMonth = useCallback(() => {
    const yearDataObj = yearData.find((d) => d.year === selectedYear);
    if (!yearDataObj) return { month: "-", amount: "-" };

    const maxSalesMonth = yearDataObj.data.reduce(
      (max, month) => (month.total > max.total ? month : max),
      yearDataObj.data[0]
    );

    return {
      month: `${maxSalesMonth.month}월`,
      amount: `${(maxSalesMonth.total / 10000).toFixed(0)}만원`,
    };
  }, [yearData, selectedYear]);

  // 차트 옵션 생성
  const getChartOption = useCallback(() => {
    // 선택된 연도의 데이터 찾기
    const selectedYearData =
      yearData.find((item) => item.year === selectedYear)?.data || [];

    // 이전 연도들의 평균 데이터 계산
    const previousYearsData = yearData.filter(
      (item) => item.year < selectedYear
    );

    let avgTotalData = [];
    if (previousYearsData.length > 0) {
      avgTotalData = Array.from({ length: 12 }, (_, monthIndex) => {
        const monthTotal = previousYearsData.reduce((sum, yearItem) => {
          return sum + yearItem.data[monthIndex].total;
        }, 0);
        return Math.round(monthTotal / previousYearsData.length);
      });
    }

    // 현재 월 가져오기
    const currentMonth = new Date().getMonth() + 1; // 현재 월 (4월)
    // 차트 범례는 1월부터 12월까지 모두 표시
    const months = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);

    // 현재 연도인 경우 현재 월까지만 데이터 표시, 이전 연도는 12월까지 모두 표시
    const currentYear = new Date().getFullYear(); // 2025

    // 현재 연도인지 확인
    const isCurrentYear = selectedYear === currentYear;

    // 현재 연도는 현재 월까지만, 이전 연도는 12월까지 모두 표시
    const monthsToShow = isCurrentYear ? currentMonth : 12;

    const onlineData = selectedYearData
      .slice(0, monthsToShow)
      .map((item) => item.online);
    const offlineData = selectedYearData
      .slice(0, monthsToShow)
      .map((item) => item.offline);
    const totalData = selectedYearData
      .slice(0, monthsToShow)
      .map((item) => item.total);

    // 이전 연도 평균은 항상 12월까지 모두 표시
    // avgTotalData는 이미 12개월 데이터가 모두 있으므로 수정할 필요 없음

    const option = {
      animation: true,
      animationDuration: 700,
      animationDurationUpdate: 500,
      animationEasing: "cubicInOut",
      animationEasingUpdate: "cubicInOut",
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: function (params) {
          let tooltip = `<div style="font-weight:bold">${params[0].name}</div>`;

          // 라인 차트 데이터 (월별 매출)
          const param = params[0];
          if (param && param.value !== null && param.value !== undefined) {
            tooltip += `<div style="font-weight:bold;color:${
              param.color
            }">매출: ${param.value.toLocaleString()}원</div>`;
          }

          // 이전 연도 평균 (있는 경우)
          const avgParam = params.find((p) => p.seriesName === "이전 연도");
          if (
            avgParam &&
            avgParam.value !== null &&
            avgParam.value !== undefined
          ) {
            tooltip += `<div style="color:${avgParam.color}">${
              avgParam.seriesName
            }: ${avgParam.value.toLocaleString()}원</div>`;
          }

          return tooltip;
        },
      },
      legend: {
        type: "scroll",
        orient: "horizontal",

        bottom: 0,
        right: 0,
        itemGap: 12,
        itemWidth: 12,
        itemHeight: 12,
        pageButtonGap: 8,
        data: [
          "월별 매출",
          ...(previousYearsData.length > 0 ? ["이전 연도"] : []),
        ],
        selected: { "이전 연도": showPrevYearAvg },
      },
      grid: {
        left: "0%",
        right: "0%",
        bottom: "15%",
        top: "3%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          data: months,
        },
      ],
      yAxis: [
        {
          type: "value",
          name: "매출액",
          boundaryGap: ["0%", "10%"],
          min: function (value) {
            // 최소값 계산 - 평균값에서 일정 비율만큼 낮게 설정
            const avg = (value.max + value.min) / 2;
            const range = value.max - value.min;
            // 평균값에서 범위의 70%만큼 낮게 설정 (최소 0)
            return Math.max(0, avg - range * 0.9);
          },
          max: function (value) {
            // 최대값 계산 - 평균값에서 일정 비율만큼 높게 설정
            const avg = (value.max + value.min) / 2;
            const range = value.max - value.min;
            // 평균값에서 범위의 70%만큼 높게 설정
            return avg + range * 0.7;
          },
          axisLabel: {
            show: false,
            formatter: function (value) {
              if (value >= 10000000) {
                return (value / 10000000).toFixed(1) + "천만";
              } else if (value >= 1000000) {
                return (value / 1000000).toFixed(0) + "백만";
              } else if (value >= 10000) {
                return (value / 10000).toFixed(0) + "만";
              }
              return value;
            },
          },
        },
      ],
      series: [
        {
          name: "월별 매출",
          type: "line",
          emphasis: {
            focus: "series",
          },
          symbolSize: 8,
          smooth: false,
          lineStyle: {
            width: 3,
            color: "#5E7CE2",
          },
          itemStyle: {
            color: "#5E7CE2",
          },
          label: {
            show: true,
            position: "top",
            formatter: (params) =>
              params.value != null
                ? (params.value / 10000).toFixed(0) + "만"
                : "",
            textStyle: {
              fontWeight: "bold",
              color: "#2563EB",
            },
          },
          data: totalData,
        },
        ...(previousYearsData.length > 0
          ? [
              {
                name: "이전 연도",
                type: "line",
                emphasis: {
                  focus: "series",
                },
                symbolSize: 4,
                smooth: false,
                lineStyle: {
                  width: 1,
                  type: "dashed",
                  color: "#9CA3AF",
                },
                itemStyle: {
                  color: "#9CA3AF",
                },
                data: avgTotalData,
              },
            ]
          : []),
      ],
    };

    // 동적 라운드 처리: 각 stack의 최상단 바에만 borderRadius 적용
    const seriesArr = option.series;
    const stackInfo = {};
    seriesArr.forEach((s, i) => {
      s.data.forEach((d, j) => {
        const raw = d && typeof d === "object" && "value" in d ? d.value : d;
        if (raw != null) {
          stackInfo[s.stack] = stackInfo[s.stack] || [];
          stackInfo[s.stack][j] = i;
        }
      });
    });
    seriesArr.forEach((s, i) => {
      s.data = s.data.map((d, j) => {
        const raw = d && typeof d === "object" && "value" in d ? d.value : d;
        const isEnd = stackInfo[s.stack] && stackInfo[s.stack][j] === i;
        const top = isEnd ? 8 : 0;
        return { value: raw, itemStyle: { borderRadius: [top, top, 0, 0] } };
      });
    });

    return option;
  }, [yearData, selectedYear, showPrevYearAvg]);

  // 차트 업데이트를 위한 useEffect
  useEffect(() => {
    if (!loading && chartRef.current && chartRef.current.getEchartsInstance) {
      chartRef.current
        .getEchartsInstance()
        .setOption(getChartOption(), { replaceMerge: ["series", "legend"] });
    }
  }, [getChartOption, loading]);

  return (
    <div className="min-h-screen bg-[#F3F5FC]">
      <BackHeader title="매출 추이 분석" />
      <BusinessHeader
        business_name={business_name}
        business_number={business_number}
        sector={smb_sector_en}
      />

      <main className="flex flex-col gap-4 px-4 pb-16 mt-16">
        {/* 연도 선택 및 이전 연도 평균 토글 */}
        <div className="flex flex-col items-center gap-2 mb-2">
          {/* 최근 6개월 매출 차트 */}
          <Card className="w-full mb-2">
            <CardContent className="px-0 pb-2">
              <p className="text-sm mx-3 my-2">최근 6개월 매출</p>
              {loading ? (
                <div className="flex justify-center items-center h-[180px]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <RecentSixMonthsChart yearData={yearData} />
              )}
            </CardContent>

            <CardContent className="px-4 py-3 border-t flex justify-around items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-b-md">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Image
                    src="/images/online.png"
                    alt="온라인"
                    width={20}
                    height={20}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-gray-500">온라인 비중:</p>
                    <p className="font-bold text-blue-600 w-12">
                      {(() => {
                        const yearDataObj = yearData.find(
                          (d) => d.year === selectedYear
                        );
                        if (!yearDataObj) return "0%";
                        const totalOnline = yearDataObj.data.reduce(
                          (sum, month) => sum + month.online,
                          0
                        );
                        const totalSales = yearDataObj.data.reduce(
                          (sum, month) => sum + month.total,
                          0
                        );
                        return totalSales > 0
                          ? `${((totalOnline / totalSales) * 100).toFixed(1)}%`
                          : "0.0%";
                      })()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <Image
                    src="/images/offline.png"
                    alt="오프라인"
                    width={20}
                    height={20}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-xs text-gray-500">오프라인 비중:</p>
                    <p className="font-bold text-indigo-600 w-12">
                      {(() => {
                        const yearDataObj = yearData.find(
                          (d) => d.year === selectedYear
                        );
                        if (!yearDataObj) return "0%";
                        const totalOffline = yearDataObj.data.reduce(
                          (sum, month) => sum + month.offline,
                          0
                        );
                        const totalSales = yearDataObj.data.reduce(
                          (sum, month) => sum + month.total,
                          0
                        );
                        return totalSales > 0
                          ? `${((totalOffline / totalSales) * 100).toFixed(1)}%`
                          : "0.0%";
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* 온라인 오프라인 비중 */}

          {/* 차트 카드 */}
          <Card className="w-full bg-white shadow-sm">
            <CardContent className="p-1">
              <p className="text-sm mx-3 my-2">월별 매출</p>
              {loading ? (
                <div className="flex justify-center items-center h-[200px]">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <ReactECharts
                  ref={chartRef}
                  option={getChartOption()}
                  style={{ height: "200px", width: "100%" }}
                  opts={{ renderer: "canvas" }}
                  notMerge={false}
                  lazyUpdate={true}
                  onEvents={{
                    legendselectchanged: (e) => {
                      // 모바일 더블탭 방지: '이전 연도'만 정확히 토글할 때만 상태 변경
                      if (
                        e.name === "이전 연도" &&
                        Object.keys(e.selected).length === 1
                      ) {
                        setShowPrevYearAvg(e.selected["이전 연도"]);
                      }
                    },
                  }}
                />
              )}
            </CardContent>

            <CardContent className="py-3 px-3 border-t flex justify-around items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-b-md">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <Image
                    src="/images/best.png"
                    alt="growth"
                    width={20}
                    height={20}
                  />
                </div>
                <div className="grid grid-cols-2">
                  <p className="text-xs text-gray-500 w-12">최고 매출</p>
                  <p className="text-xs text-left font-bold text-blue-600">
                    {(() => {
                      const { month, amount } = getMaxSalesMonth();
                      return `${month}`;
                    })()}
                  </p>
                  <p className="text-sm text-blue-600 col-span-2">
                    {(() => {
                      const { amount } = getMaxSalesMonth();
                      return `(${amount})`;
                    })()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-full">
                  <Image
                    src="/images/growth.png"
                    alt="best"
                    width={20}
                    height={20}
                  />
                </div>
                <div className="flex justify-between gap-6 mr-2">
                  <div>
                    <p className="text-xs text-center text-gray-500">
                      전년 대비
                    </p>
                    <p className="text-base text-center font-bold text-indigo-600">
                      {(() => {
                        // 현재 연도와 이전 연도 데이터 찾기
                        const currentYearData = yearData.find(
                          (d) => d.year === selectedYear
                        );
                        const prevYearData = yearData.find(
                          (d) => d.year === selectedYear - 1
                        );
                        if (!currentYearData || !prevYearData) return "-";

                        // 현재 월 가져오기 (예: 4월)
                        const currentMonth = new Date().getMonth() + 1; // 0부터 시작하므로 +1

                        // 현재 연도의 현재 월까지의 매출 합계
                        const currentTotal = currentYearData.data
                          .slice(0, currentMonth) // 현재 월까지만 계산 (1월~현재월)
                          .reduce((sum, month) => sum + month.total, 0);

                        // 작년 동일 기간(1월~현재월)의 매출 합계
                        const prevTotal = prevYearData.data
                          .slice(0, currentMonth) // 현재 월까지만 계산 (1월~현재월)
                          .reduce((sum, month) => sum + month.total, 0);

                        if (prevTotal === 0) return "-";
                        const growthRate =
                          ((currentTotal - prevTotal) / prevTotal) * 100;
                        return `${
                          growthRate > 0 ? "+" : ""
                        }${growthRate.toFixed(1)}%`;
                      })()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-center text-gray-500">
                      전년 대비({new Date().getMonth()} 월)
                    </p>
                    <p className="text-base text-center font-bold text-indigo-600">
                      {(() => {
                        // 현재 연도와 이전 연도 데이터 찾기
                        const currentYearData = yearData.find(
                          (d) => d.year === selectedYear
                        );
                        const prevYearData = yearData.find(
                          (d) => d.year === selectedYear - 1
                        );
                        if (!currentYearData || !prevYearData) return "-";

                        // 현재 월 가져오기 (예: 4월)
                        const currentMonth = new Date().getMonth() + 1; // 0부터 시작하므로 +1

                        // 이전 월까지의 데이터만 계산 (1월~이전월)
                        const prevMonth = currentMonth - 1;

                        if (prevMonth <= 0) {
                          // 1월인 경우 비교할 이전 데이터가 없음
                          return "-";
                        }

                        // 현재 연도의 이전 월까지의 매출 합계 (1월~이전월)
                        const currentYearPrevMonthTotal = currentYearData.data
                          .slice(0, prevMonth) // 이전 월까지만 계산 (1월~이전월)
                          .reduce((sum, month) => sum + month.total, 0);

                        // 작년 동일 기간(1월~이전월)의 매출 합계
                        const prevYearSameMonthTotal = prevYearData.data
                          .slice(0, prevMonth) // 이전 월까지만 계산 (1월~이전월)
                          .reduce((sum, month) => sum + month.total, 0);

                        if (prevYearSameMonthTotal === 0) return "-";

                        const growthRate =
                          ((currentYearPrevMonthTotal -
                            prevYearSameMonthTotal) /
                            prevYearSameMonthTotal) *
                          100;

                        return `${
                          growthRate > 0 ? "+" : ""
                        }${growthRate.toFixed(1)}%`;
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
