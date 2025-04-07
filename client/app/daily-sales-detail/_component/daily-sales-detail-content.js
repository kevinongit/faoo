"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/authStore";
import GNB from "@/components/GNB";
import Loading from "@/components/Loading";
import useDailySalesDetailStore from "@/lib/store/dailySalesDetailStore";
import {
  XAxis, YAxis, Tooltip, AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

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

  const base_date_str = base_date.getFullYear() +
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
          return {key: item.platform_nm, value: item.cnt};
        }else {
          return {key: item.platform_nm, value: item.sum_amt};
        }
      });
      setPlatformData(platformData || []);

      const hourlySales = Object.entries(ratioData)
            .filter(([key]) => key.startsWith('time_'))            // 'time_' 으로 시작하는 것만 필터
            .map(curr => {
              return {hour:curr[0].split("_")[1] + "시", value: selectedType === "건수별" ? curr[1].cnt : curr[1].amt};
            })
      setHourlySalesData(hourlySales);

      const maxTimeEntry = Object.entries(ratioData)
            .filter(([key]) => key.startsWith('time_'))            // 'time_' 으로 시작하는 것만 필터
            .reduce((max, curr) => ((selectedType === "건수별" ? curr[1].cnt : curr[1].amt) > (selectedType === "건수별" ? max[1].cnt : max[1].amt) ? curr : max)); // 최대값 추출

      const maxAgeEntry = Object.entries(ratioData)
            .filter(([key]) => key.startsWith('age_'))            // 'age_' 으로 시작하는 것만 필터
            .reduce((max, curr) => ((selectedType === "건수별" ? curr[1].cnt : curr[1].amt) > (selectedType === "건수별" ? max[1].cnt : max[1].amt) ? curr : max)); // 최대값 출

      const summary = {
        mainAge: maxAgeEntry[0].split("_")[1],
        mainHour: maxTimeEntry[0].split("_")[1],
        mainGender: ratioData.male >= ratioData.female ? "남성" : "여성",
      }
      setSummary(summary || {});
    }
  }, [ratioData, selectedType]);

  const getColor = function(entry, index) {
    const COLORS = ["#9134d3", "#fdf400", "#fb6b05", "#ff8c94"];

    switch(entry.key) {
      case "배달의민족":
        return "#19b9d2";
      case "쿠팡이츠":
        return "#0639c4";
      case "요기요":
        return "#db0404";
      default:
        return COLORS[index % COLORS.length]
    }
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const platform = platformData[index];
    const label = `${platform.key} ${(percent * 100).toFixed(0)}%`;

    return (
      <g>
        <rect
          x={x - label.length *2.8}
          y={y - 10}
          rx={10}
          ry={10}
          width={label.length * 10}
          height={20}
          fill={getColor(platform, index)}
          stroke={getColor(platform, index)}
          strokeWidth={1}
          style={{ filter: "drop-shadow(1px 1px 2px rgba(0,0,0,0.1))" }}
        />
        <text
          x={x + 15}
          y={y + 2}
          fill="#ffffff"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          fontWeight="bold"
        >
          {label}
        </text>
      </g>
    );
  };

  if (ratioData && Object.keys(ratioData).length === 0) {
    return <Loading />;
  }

  return (
    <>
      <div className="container mx-auto p-3 pt-0 pb-20">
        {/* 🔙 뒤로가기 버튼 */}
        <div className="relative flex items-center justify-center mb-4">
          <button
            className="absolute left-0 p-2 bg-gray-200 hover:bg-gray-300 rounded-full shadow-md transition"
            onClick={() => router.back()}>
            <span className="text-lg font-bold text-gray-600">&lt;</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            일일 매출 상세
          </h1>
        </div>

        {/* ✅ 1. 플랫폼별 매출 비중 */}
        <Card className="mb-6 shadow-md border border-gray-300 rounded-lg p-5">
          <CardHeader className="flex flex-row items-center justify-between p-0">
            {/* 제목 */}
            <h2 className="text-lg font-bold text-gray-800 whitespace-nowrap">
              플랫폼별 매출 비중
            </h2>

            {/* 금액별 / 건수별 선택 버튼 */}
            <div className="flex gap-2">
              {["금액별", "건수별"].map((type) => (
                <button
                  key={type}
                  className={`text-sm leading-none px-3 py-1 rounded-full border transition
                    ${selectedType === type
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"}`}
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="45%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={67}
                  dataKey="value"
                  isAnimationActive={true}
                  label={renderCustomizedLabel}
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry, index)} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>

          {/* 🔽 요약 박스 */}
          <div className="flex justify-center gap-3 mt-0 text-black">
            <div className="bg-white rounded-lg py-3 px-4 flex flex-col items-center shadow">
                <div className="text-xs text-gray-500">주 성별</div>
                <div className="text-sm font-bold">{summary.mainGender}</div>
            </div>
            <div className="bg-white rounded-lg py-3 px-4 flex flex-col items-center shadow">
                <div className="text-xs text-gray-500">주 연령대</div>
                <div className="text-sm font-bold">{summary.mainAge}대</div>
            </div>
            <div className="bg-white rounded-lg py-3 px-4 flex flex-col items-center shadow">
                <div className="text-xs text-gray-500">주 시간대</div>
                <div className="text-sm font-bold">{summary.mainHour}시</div>
            </div>
          </div>
        </Card>

        <Card className="mb-6 shadow-md border border-gray-300 rounded-lg p-5">
          <CardHeader className="flex p-0">
            <h2 className="text-lg font-bold text-gray-800 whitespace-nowrap">
              시간대별 매출 추이
            </h2>
          </CardHeader>
          <CardContent>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={hourlySalesData}>
                  <XAxis
                    dataKey="hour"
                    axisLine={false}
                    tickLine={false}
                    interval={2}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis hide />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#FB8C00"
                    fill="#FFE0B2"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ✅ 하단 분석 버튼 영역 */}
        <div className="fixed left-0 w-full px-4">
          <div className="flex justify-between max-w-md mx-auto">
            <button
              className="flex-1 mr-2 py-3 rounded-xl bg-blue-100 text-blue-700 font-semibold shadow hover:bg-blue-200 transition"
              onClick={() => router.push(`/chart-dashboard?date=${base_date_str}`)}
            >
              주간 분석비교 보기
            </button>
            <button
              className="flex-1 ml-2 py-3 rounded-xl bg-green-100 text-green-700 font-semibold shadow hover:bg-green-200 transition"
              onClick={() => router.push(`/sales-compare`)}
            >
              월간 분석비교 보기
            </button>
          </div>
        </div>
      </div>
      <GNB />
    </>
  );
}