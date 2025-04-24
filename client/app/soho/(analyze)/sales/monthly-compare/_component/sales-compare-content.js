"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/authStore";
import useSaleCompareStore from "@/lib/store/saleCompareStore";
import { useEffect, useState, useRef } from "react";
import * as d3 from "d3";
import { Chart } from "react-google-charts";
import BusinessHeader from "@/components/BusinessHeader";
import Loading from "@/components/Loading";

export default function SalesCompareContent() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { fetchData, rankData } = useSaleCompareStore();
  const [monthChartData, setMonthChartData] = useState([[]]);
  const ref = useRef(null);

  const searchParams = useSearchParams();
  let month = searchParams.get("month");
  if (!month) {
    month =
      new Date().getFullYear() +
      String(new Date().getMonth() + 1).padStart(2, "0");
  }

  useEffect(() => {
    if (user?.business_number) {
      fetchData(user.business_number, month);
    }
  }, [user]);

  useEffect(() => {
    if (rankData?.monthInfo) {
      const width = 140;
      const marginWidth = 10;
      const marginHeight = 10;
      const height = 100;
      const percent = Number(rankData.monthInfo.percentileRank || 0) / 100;
      const fillX = Math.round((width / 2) * percent) + 5;
      const fillY = height * percent + marginHeight;

      const svg = d3.select(ref.current);
      svg.selectAll("*").remove();
      svg.attr("width", width + 60).attr("height", height + marginHeight);

      svg
        .append("polygon")
        .attr(
          "points",
          `${marginWidth},${height + marginHeight} ${
            width / 2
          },${marginHeight} ${width - marginWidth},${height + marginHeight}`
        )
        .attr("fill", "#E0E0E0");

      svg
        .append("polygon")
        .attr(
          "points",
          `${width / 2 - fillX + marginWidth},${fillY} ${
            width / 2
          },${marginHeight} ${width / 2 + fillX - marginWidth},${fillY}`
        )
        .attr("fill", "#64B5F6");

      svg
        .append("line")
        .attr("x1", 0)
        .attr("y1", fillY)
        .attr("x2", width)
        .attr("y2", fillY)
        .attr("stroke", "black")
        .attr("stroke-dasharray", "2,3");

      // 텍스트 내용과 스타일
      const labelText = "내 사업장";
      const fontSize = 10;
      const paddingX = 4;
      const paddingY = 2;

      // 텍스트 위치
      const textX = width + 10;
      const textY = fillY + 4;

      // 임시 텍스트 요소로 크기 측정
      const tempText = svg
        .append("text")
        .attr("x", -9999)
        .attr("y", -9999)
        .attr("font-size", `${fontSize}px`)
        .text(labelText);

      const bbox = tempText.node().getBBox();
      tempText.remove(); // 측정 후 제거

      // 배경 사각형
      svg
        .append("rect")
        .attr("x", textX - paddingX)
        .attr("y", textY - fontSize + 1 - paddingY)
        .attr("width", bbox.width + paddingX * 2)
        .attr("height", bbox.height + paddingY * 2)
        .attr("rx", 4) // 모서리 둥글게
        .attr("fill", "#E3F2FD"); // 밝은 파란 배경

      // 텍스트
      svg
        .append("text")
        .attr("x", textX)
        .attr("y", textY)
        .text(labelText)
        .attr("font-size", `${fontSize}px`)
        .attr("fill", "#1E88E5")
        .attr("font-weight", "bold");

      const columnChartData = [
        ["가게", "평균 매출", { role: "style" }, { role: "annotation" }],
        [
          "우리가게",
          Math.floor(Number(rankData.monthAmt) / 10000),
          "color: #5A48EE; opacity: 0.9",
          `${Math.floor(
            Number(rankData.monthAmt) / 10000
          ).toLocaleString()}\n만원`,
        ],
        [
          rankData.zone_nm,
          Math.floor(Number(rankData.monthInfo.totalAvg) / 10000),
          "color: #C2B7F4; opacity: 0.9",
          `${Math.floor(
            Number(rankData.monthInfo.totalAvg) / 10000
          ).toLocaleString()}\n만원`,
        ],
      ];

      setMonthChartData(columnChartData);
    }
  }, [rankData]);

  const columnChartOptions = {
    chartArea: { width: "80%", height: "75%" },
    legend: "none",
    vAxis: { format: "decimal", minValue: 0 },
    bar: { groupWidth: "45%" },
    annotations: {
      textStyle: {
        fontSize: 14,
        bold: true,
        color: "#000",
      },
    },
  };

  if (!rankData || !rankData.monthInfo || !rankData.monthInfo.rankList) {
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

      <div className="container mx-auto p-3 pt-0 pb-20">
        <div className="relative flex items-center justify-center mb-4">
          <button
            className="absolute left-0 p-2 bg-gray-200 hover:bg-gray-300 rounded-full shadow-md transition"
            onClick={() => router.back()}
          >
            <span className="text-lg font-bold text-gray-600">&lt;</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            월간 분석비교
          </h1>
        </div>

        <Card className="flex flex-col mb-6 mt-7 shadow-md border border-gray-300 rounded-lg p-5">
          <CardHeader className="flex p-0 justify-between items-cent">
            <CardTitle className="text-lg sm:text-xl text-gray-800 font-bold mb-1">
              {`${Number(rankData.base_month)}월 ${rankData.zone_nm} ${
                rankData.smb_sector
              } 사업장 매출 비교`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-1">
            <div className="flex justify-center gap-4 md:gap-16 items-center">
              <div className="flex max-w-[200px]">
                <svg ref={ref} className="block mx-auto" />
              </div>
              <div className="flex flex-col items-center pt-0">
                <div className=" w-[80px] px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold shadow-sm border border-blue-300 mb-5 text-center">
                  {`상위 ${rankData?.monthInfo?.percentileRank || ""}%`}
                </div>
                <p className="text-[13px] -mt-2 text-gray-700 font-medium leading-tight text-center">
                  {/* 우리가게는 */}
                  {/* <br /> */}
                  <span className="font-semibold text-[15px] text-black">
                    {rankData.zone_nm} {rankData.smb_sector}
                  </span>{" "}
                  사업장에서
                  <br />
                  <span className="font-semibold text-[15px] text-blue-500">
                    {Number(rankData.base_month)}월
                  </span>{" "}
                  상위{" "}
                  <span className="text-red-500 text-[15px] font-bold">
                    {rankData?.monthInfo?.percentileRank || ""}%
                  </span>
                  {/* {" "}
                  수준이에요. */}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 mt-7 shadow-md border border-gray-300 rounded-lg p-5 pt-7 relative">
          <CardHeader className="flex p-0 justify-between items-start">
            <CardTitle className="text-base sm:text-xl font-semibold text-purple-700">
              {`${rankData.zone_nm} ${rankData.smb_sector} 사업장의 ${Number(
                rankData.base_month
              )}월 평균 매출액${rankData.compareStr}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pb-1">
            <div className="relative top-4 flex flex-col items-center">
              <Chart
                chartType="ColumnChart"
                width="100%"
                height="250px"
                data={monthChartData}
                options={columnChartOptions}
              />
              <div className="absolute right-2 -top-1 text-gray-500 text-[9px]">
                단위 : 만원
              </div>
            </div>
          </CardContent>
          <CardContent className="p-0 pb-1">
            <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
              <table className="w-full text-left border-collapse bg-white text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b border-gray-200">
                      기준
                    </th>
                    <th className="py-3 px-4 text-right font-semibold text-gray-700 border-b border-gray-200">
                      평균 매출액 (원)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rankData &&
                    rankData.monthInfo &&
                    rankData.monthInfo.rankList &&
                    rankData.monthInfo.rankList
                      .sort((x, y) => Number(x.key) - Number(y.key))
                      .map((item, index) => (
                        <tr
                          key={index}
                          className={`
                            border-b border-gray-100 last:border-b-0
                            transition duration-150 ease-in-out
                            hover:bg-blue-50/30
                            ${
                              index === rankData.monthInfo.self_rankIdx
                                ? "bg-yellow-50/70 hover:bg-yellow-50"
                                : index % 2 === 0
                                ? "bg-gray-50/30"
                                : "bg-white"
                            }
                          `}
                        >
                          <td className="py-2.5 px-4 text-gray-700">
                            {item.keyNm}
                          </td>
                          <td className="py-2.5 px-4 text-right font-medium text-gray-900 min-w-[150px]">
                            {Number(item.value).toLocaleString()} 원
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
