'use client';
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, Calculator } from "lucide-react";
import useSalesStore from "@/lib/store/salesStore";
import { useAuthStore } from "@/lib/store/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";

const SimplePnl = () => {
  const { user, token, isAuthenticated } = useAuthStore();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [inputs, setInputs] = useState({
    costOfSales: 0,
    rent: 0,
    labor: 0,
    utilities: 0,
    otherExpenses: 0,
  });
  const [results, setResults] = useState({
    totalCost: 0,
    netProfit: 0,
    vatReference: 0,
  });

  const { salesData, fetchSalesData, isLoading, error } = useSalesStore();
  console.log("salesData", salesData);
  const years = Array.from({ length: currentYear - 2019 }, (_, i) => 2020 + i);
  const months =
    year === currentYear
      ? Array.from({ length: currentMonth }, (_, i) => i + 1)
      : Array.from({ length: 12 }, (_, i) => i + 1);

  useEffect(() => {
    if (user?.business_number) {
      fetchSalesData(user.business_number);
    }
  }, [fetchSalesData, user?.business_number, year, month]);

  const totalRevenue = salesData?.monthlySales
    ?.find((sale) => sale.month === month && new Date().getFullYear() === year)
    ?.total || 0;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const calculate = () => {
    const totalCost =
      inputs.costOfSales +
      inputs.rent +
      inputs.labor +
      inputs.utilities +
      inputs.otherExpenses;
    const netProfit = totalRevenue - totalCost;
    const vatReference = totalRevenue * 0.1 / 1.1;
    setResults({ totalCost, netProfit, vatReference });
  };

  if (isLoading) return <div className="p-4 text-center">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  if (!salesData) return null;

  return (
    <ProtectedRoute>
      <TooltipProvider>
        <div className="max-w-md p-4 mx-auto font-sans">
          <h1 className="mb-6 text-2xl font-bold text-center">간편 손익계산서</h1>

          {/* 년도 및 월 선택 */}
          <div className="flex gap-4 mb-6">
            <Select value={year.toString()} onValueChange={(val) => setYear(parseInt(val))}>
              <SelectTrigger className="w-full bg-white border-gray-300">
                <SelectValue placeholder="년도" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}년</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={month.toString()} onValueChange={(val) => setMonth(parseInt(val))}>
              <SelectTrigger className="w-full bg-white border-gray-300">
                <SelectValue placeholder="월" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m.toString()}>{m}월</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 입력 및 출력 */}
          <div className="space-y-4">
            <div className="grid items-center grid-cols-3 gap-2">
              <label className="flex items-center col-span-1 gap-1 text-sm font-medium">
                총매출액
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle size={16} className="text-gray-500 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>자동으로 받아온 매출액 (부가세 포함)</TooltipContent>
                </Tooltip>
              </label>
              <Input
                value={totalRevenue.toLocaleString()}
                disabled
                className="col-span-2 bg-gray-100 border-gray-300"
              />
            </div>

            <div className="grid items-center grid-cols-3 gap-2">
              <label className="flex items-center col-span-1 gap-1 text-sm font-medium">
                매출원가
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle size={16} className="text-gray-500 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>재료비, 구매비 등 매출 발생 직접 비용</TooltipContent>
                </Tooltip>
              </label>
              <Input
                name="costOfSales"
                onChange={handleInputChange}
                className="col-span-2 border-gray-300"
                placeholder="0"
              />
            </div>

            <div className="grid items-center grid-cols-3 gap-2">
              <label className="flex items-center col-span-1 gap-1 text-sm font-medium">
                임대료
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle size={16} className="text-gray-500 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>사업장 임대 비용</TooltipContent>
                </Tooltip>
              </label>
              <Input
                name="rent"
                onChange={handleInputChange}
                className="col-span-2 border-gray-300"
                placeholder="0"
              />
            </div>

            <div className="grid items-center grid-cols-3 gap-2">
              <label className="flex items-center col-span-1 gap-1 text-sm font-medium">
                인건비
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle size={16} className="text-gray-500 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>직원 급여, 아르바이트 비용</TooltipContent>
                </Tooltip>
              </label>
              <Input
                name="labor"
                onChange={handleInputChange}
                className="col-span-2 border-gray-300"
                placeholder="0"
              />
            </div>

            <div className="grid items-center grid-cols-3 gap-2">
              <label className="flex items-center col-span-1 gap-1 text-sm font-medium">
                공과금
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle size={16} className="text-gray-500 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>전기, 수도, 인터넷 등</TooltipContent>
                </Tooltip>
              </label>
              <Input
                name="utilities"
                onChange={handleInputChange}
                className="col-span-2 border-gray-300"
                placeholder="0"
              />
            </div>

            <div className="grid items-center grid-cols-3 gap-2">
              <label className="flex items-center col-span-1 gap-1 text-sm font-medium">
                기타 운영비
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle size={16} className="text-gray-500 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>마케팅비, 운송비 등 기타 비용</TooltipContent>
                </Tooltip>
              </label>
              <Input
                name="otherExpenses"
                onChange={handleInputChange}
                className="col-span-2 border-gray-300"
                placeholder="0"
              />
            </div>

            {/* 계산 버튼 */}
            <Button
              onClick={calculate}
              className="flex items-center justify-center w-full gap-2 mt-4 text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Calculator size={20} /> 계산하기
            </Button>

            {/* 결과 표시 */}
            <div className="mt-6 space-y-2">
              <div className="grid items-center grid-cols-3 gap-2 p-3 bg-gray-100 rounded-lg">
                <span className="col-span-1 font-semibold">총비용</span>
                <span className="col-span-2 text-right">{results.totalCost.toLocaleString()} 원</span>
              </div>
              <div className="grid items-center grid-cols-3 gap-2 p-3 bg-gray-100 rounded-lg">
                <span className="col-span-1 font-semibold">순이익</span>
                <span className="col-span-2 text-right">{results.netProfit.toLocaleString()} 원</span>
              </div>
              <div className="grid items-center grid-cols-3 gap-2 p-3 bg-gray-100 rounded-lg">
                <span className="col-span-1 font-semibold">부가세 참고액</span>
                <span className="col-span-2 text-right">{results.vatReference.toLocaleString()} 원</span>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </ProtectedRoute>
  );
};

export default SimplePnl;