"use client";
import React, {useEffect, useRef} from "react";
import * as echarts from "echarts";

export default function Home() {
  const chartRef = useRef(null);

  useEffect(() => {
    const myChart = echarts.init(chartRef.current);

    const option = {
      backgroundColor: "#ffffff",
      tooltip: {
        trigger: "item"
      },
      legend: {
        orient: "vertical",
        right: "5%",
        top: "center"
      },
      series: [
        {
          name: "배달 앱 점유율",
          type: "pie",
          radius: "70%",
          center: ["35%", "50%"],
          data: [
            {value: 54.7, name: "배달의 민족"},
            {value: 28.6, name: "쿠팡이츠"},
            {value: 16.1, name: "요기요"},
            {value: 0.6, name: "기타"}
          ],
          label: {
            show: true,
            position: "inside",
            formatter: function (params) {
              return params.percent < 10 ? "" : params.percent + "%";
            },
            color: "#000000"
          },
          labelLine: {
            show: false
          }
        }
      ]
    };

    myChart.setOption(option);

    const handleResize = () => {
      //myChart.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      myChart.dispose();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start p-4">
      {/* 차트 영역 */}
      <div
        ref={chartRef}
        className="w-full max-w-md sm:max-w-3xl h-72 sm:h-96"
      />

      {/* 하단 정보 사각형: 한 줄로 배치, 크기를 더 작게 적용 */}
      <div className="mt-4 flex flex-row flex-nowrap justify-center gap-2 overflow-x-auto">
        <div className="w-20 h-12 flex flex-col items-center justify-center p-1 bg-gray-100 rounded border border-gray-200 text-[10px] sm:w-24 sm:h-16 sm:p-2 sm:text-xs">
          <span className="font-bold">주 성별</span>
          <span>남성</span>
        </div>
        <div className="w-20 h-12 flex flex-col items-center justify-center p-1 bg-gray-100 rounded border border-gray-200 text-[10px] sm:w-24 sm:h-16 sm:p-2 sm:text-xs">
          <span className="font-bold">주 연령대</span>
          <span>30대</span>
        </div>
        <div className="w-20 h-12 flex flex-col items-center justify-center p-1 bg-gray-100 rounded border border-gray-200 text-[10px] sm:w-24 sm:h-16 sm:p-2 sm:text-xs">
          <span className="font-bold">배달 많은 요일</span>
          <span>금요일</span>
        </div>
        <div className="w-20 h-12 flex flex-col items-center justify-center p-1 bg-gray-100 rounded border border-gray-200 text-[10px] sm:w-24 sm:h-16 sm:p-2 sm:text-xs">
          <span className="font-bold">주 시간대</span>
          <span>12시~15시</span>
        </div>
      </div>
    </div>
  );
}
