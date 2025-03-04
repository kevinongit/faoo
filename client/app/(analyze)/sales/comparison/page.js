"use client";
import {useEffect, useRef, useState} from "react";
import * as echarts from "echarts";

export default function Home() {
  const chartRef = useRef(null);
  // weekOffset: 현재 주(0: 오늘이 속한 주, -1: 이전 주, +1: 다음 주 등)
  const [weekOffset, setWeekOffset] = useState(0);
  // 시뮬레이션용 오늘 날짜 (실제에서는 new Date() 사용)
  const todaySimulated = new Date("2025-02-28");

  // 주의 시작일(일요일) 계산 함수 (weekOffset 적용)
  const getWeekStart = () => {
    const base = new Date(todaySimulated);
    base.setDate(base.getDate() - base.getDay()); // 오늘의 주의 일요일
    base.setDate(base.getDate() + weekOffset * 7); // offset 적용
    return base;
  };

  useEffect(() => {
    async function fetchDataAndRender() {
      // 현재 주의 날짜 배열 (7일)
      const weekDays = ["일", "월", "화", "수", "목", "금", "토"];
      const weekStart = getWeekStart();
      const dateArray = [];
      const currentDate = new Date(weekStart);
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().slice(0, 10);
        const dayOfWeek = weekDays[currentDate.getDay()];
        // 날짜와 요일을 "\n"으로 결합하여 표시
        dateArray.push(`${dateStr}\n${dayOfWeek}`);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      const todayFormatted = todaySimulated.toISOString().slice(0, 10);

      // 외부 API로부터 데이터를 받아오는 것을 모의 (실제 상황에서는 fetch 등으로 대체)
      const externalData = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            전주: [150, 230, 224, 218, 135, 147, 260],
            전년: [120, 200, 250, 300, 200, 180, 150],
            금주: [120, 220, 200, 310, null, null, null]
          });
        }, 500);
      });

      const myChart = echarts.init(chartRef.current);
      const option = {
        title: {
          text: "매출 비교 차트"
        },
        tooltip: {
          trigger: "axis",
          formatter: function (params) {
            // "금주" 시리즈를 기준으로 비교
            let current = params.find((item) => item.seriesName === "금주");
            if (!current) current = params[0];
            let output = `<div>${current.name}</div>`;
            params.forEach((item) => {
              if (item.seriesName === "금주") {
                const value = item.data != null ? item.data : "-";
                output += `${item.marker} ${item.seriesName}: ${value}<br/>`;
              } else {
                let diffOutput;
                if (current.data == null || item.data == null) {
                  diffOutput = "-";
                } else {
                  let diff = ((current.data - item.data) / item.data) * 100;
                  diff = parseFloat(diff.toFixed(2));
                  if (diff > 0) {
                    diffOutput = `<span style="color: red;">+${diff}%</span>`;
                  } else if (diff < 0) {
                    diffOutput = `<span style="color: blue;">${diff}%</span>`;
                  } else {
                    diffOutput = `<span>${diff}%</span>`;
                  }
                }
                output += `${item.marker} ${item.seriesName}: ${item.data} (${diffOutput})<br/>`;
              }
            });
            return output;
          }
        },
        legend: {
          data: ["전주", "전년", "금주"]
        },
        xAxis: {
          type: "category",
          data: dateArray,
          axisLabel: {
            interval: 0,
            formatter: function (value) {
              // value: "YYYY-MM-DD\n요일" 형식
              const parts = value.split("\n");
              const datePart = parts[0];
              const dayPart = parts[1];
              if (datePart === todayFormatted) {
                // 오늘 날짜면 rich text로 볼드 및 빨간색 처리
                return "{red|" + datePart + "}" + "\n" + dayPart;
              }
              return value;
            },
            rich: {
              red: {
                fontWeight: "bold",
                color: "red"
              }
            }
          }
        },
        yAxis: {
          type: "value"
        },
        series: [
          {
            name: "전주",
            type: "line",
            smooth: true,
            data: externalData.전주
          },
          {
            name: "전년",
            type: "line",
            smooth: true,
            data: externalData.전년
          },
          {
            name: "금주",
            type: "line",
            smooth: true,
            data: externalData.금주
          }
        ]
      };

      myChart.setOption(option);
      const handleResize = () => myChart.resize();
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        myChart.dispose();
      };
    }
    const cleanup = fetchDataAndRender();
    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, [weekOffset]);

  // 헤더에 표시할 주의 날짜 범위 계산
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekRange = `${weekStart.toISOString().slice(0, 10)} ~ ${weekEnd.toISOString().slice(0, 10)}`;
  const todayFormatted = todaySimulated.toISOString().slice(0, 10);

  return (
    <div>
      {/* 헤더 영역: 오늘 날짜, 주 범위, 이전/다음 버튼 */}
      <div className="flex items-center justify-center mb-4">
        <button
          className="px-4 py-2 border mr-4"
          onClick={() => setWeekOffset(weekOffset - 1)}>
          이전 주
        </button>
        <div className="text-center">
          <div className="text-lg font-bold">오늘 날짜: {todayFormatted}</div>
          <div className="text-md">{weekRange}</div>
        </div>
        <button
          className="px-4 py-2 border ml-4"
          onClick={() => setWeekOffset(weekOffset + 1)}>
          다음 주
        </button>
      </div>
      <div
        ref={chartRef}
        className="w-full max-w-[600px] h-[400px] mx-auto"
      />
    </div>
  );
}
