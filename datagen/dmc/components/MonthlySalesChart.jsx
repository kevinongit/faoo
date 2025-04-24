"use client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function MonthlySalesChart({ monthlySales }) {
  if (!monthlySales || monthlySales.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        월별 매출 데이터가 없습니다.
      </div>
    );
  }

  // 데이터 정렬
  const sortedData = [...monthlySales].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  // 평균 월매출 계산 (이번달 제외)
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const validSales = sortedData.filter(item => 
    !(item.year === currentYear && item.month === currentMonth)
  );

  const averageMonthlySales = validSales.length > 0
    ? Math.round(validSales.reduce((sum, item) => sum + item.revenue, 0) / validSales.length)
    : 0;

  // 산정기간 계산
  const startDate = validSales[0];
  const endDate = validSales[validSales.length - 1];
  const periodText = startDate && endDate
    ? `${startDate.year}.${String(startDate.month).padStart(2, '0')} - ${endDate.year}.${String(endDate.month).padStart(2, '0')}`
    : '';

  // y축 범위 계산
  const revenues = sortedData.map(item => item.revenue);
  const minRevenue = Math.min(...revenues);
  const maxRevenue = Math.max(...revenues);
  const padding = (maxRevenue - minRevenue) * 0.1; // 10% 패딩

  const data = {
    labels: sortedData.map(
      (item) => `${item.year.toString().slice(-2)}.${item.month.toString().padStart(2, '0')}`
    ),
    datasets: [
      {
        label: "월별 매출",
        data: sortedData.map((item) => item.revenue),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "월별 매출 추이",
      },
    },
    scales: {
      y: {
        min: Math.max(0, minRevenue - padding), // 최소값이 0보다 작지 않도록
        max: maxRevenue + padding,
        ticks: {
          callback: function (value) {
            return value.toLocaleString() + "원";
          },
        },
      },
    },
  };

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">월별 매출 추이</h3>
        <div className="text-sm text-gray-600">
          <p>평균 월매출: {averageMonthlySales.toLocaleString()}원</p>
          <p>산정기간: {periodText}</p>
        </div>
      </div>
      <div className="h-[400px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
} 