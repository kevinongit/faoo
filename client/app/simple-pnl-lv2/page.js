"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HelpCircle,
  Calculator,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Building2,
  Users,
  Lightbulb,
  LayoutGrid,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useMonthSalesStore from "@/lib/store/monthSalesStore";
import { useAuthStore } from "@/lib/store/authStore";
import ProtectedRoute from "@/components/ProtectedRoute";

const SimplePnlLv2 = () => {
  const { user } = useAuthStore();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const { monthSalesData, fetchMonthSales } = useMonthSalesStore();

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [inputs, setInputs] = useState({
    costOfSales: 0,
    rent: 0,
    labor: 0,
    utilities: 0,
    otherExpenses: 0,
  });
  const [savedData, setSavedData] = useState(null);
  const [isDataChanged, setIsDataChanged] = useState(false);
  const [results, setResults] = useState({
    totalCost: 0,
    netProfit: 0,
    vatReference: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Memoize the year_month string
  const yearMonth = useMemo(() => 
    `${year}${month.toString().padStart(2, "0")}`, 
    [year, month]
  );

  // Generate all 12 months
  const monthList = useMemo(() => {
    const months = [];
    // Add previous year's months (current month + 1 to 12)
    for (let i = currentMonth + 1; i <= 12; i++) {
      months.push({
        number: i,
        year: currentYear - 1,
        isPreviousYear: true,
        isSelected: year === currentYear - 1 && i === month,
      });
    }
    // Add current year's months (1 to current month)
    for (let i = 1; i <= currentMonth; i++) {
      months.push({
        number: i,
        year: currentYear,
        isPreviousYear: false,
        isSelected: year === currentYear && i === month,
        isCurrentMonth: i === currentMonth,
      });
    }
    return months;
  }, [currentYear, currentMonth, year, month]);

  // Handle month selection
  const handleMonthSelect = (selectedMonth, selectedYear) => {
    setMonth(selectedMonth);
    setYear(selectedYear);
  };

  // Add totalRevenue calculation using useMemo
  const totalRevenue = useMemo(() => {
    if (!monthSalesData || !Array.isArray(monthSalesData)) return 0;

    const currentMonthData = monthSalesData.find(
      (data) => data.sale_month === yearMonth
    );

    return currentMonthData ? Number(currentMonthData.sum_amt) : 0;
  }, [monthSalesData, yearMonth]);

  const fetchSavedData = useCallback(async () => {
    if (!user?.business_number) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}:6100/simple-pnl/get`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_number: user.business_number,
            year_month: yearMonth,
          }),
        }
      );
      const result = await response.json();

      if (result.success && result.data) {
        const savedInputs = {
          costOfSales: Math.floor(Number(result.data.inputs.costOfSales || 0)),
          rent: Math.floor(Number(result.data.inputs.rent || 0)),
          labor: Math.floor(Number(result.data.inputs.labor || 0)),
          utilities: Math.floor(Number(result.data.inputs.utilities || 0)),
          otherExpenses: Math.floor(Number(result.data.inputs.otherExpenses || 0)),
        };
        setSavedData({
          ...result.data,
          inputs: savedInputs,
        });
        setInputs(savedInputs);
        setIsDataChanged(false);
      } else {
        setSavedData(null);
        setInputs({
          costOfSales: 0,
          rent: 0,
          labor: 0,
          utilities: 0,
          otherExpenses: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching saved data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.business_number, yearMonth]);

  // Effect to fetch sales data
  useEffect(() => {
    if (user?.business_number) {
      fetchMonthSales(user.business_number, yearMonth, yearMonth);
    }
  }, [fetchMonthSales, user?.business_number, yearMonth]);

  // Effect to fetch saved data
  useEffect(() => {
    fetchSavedData();
  }, [fetchSavedData]);

  const calculate = () => {
    const totalCost = Math.floor(
      inputs.costOfSales +
        inputs.rent +
        inputs.labor +
        inputs.utilities +
        inputs.otherExpenses
    );
    const netProfit = Math.floor(totalRevenue - totalCost);
    const vatReference = Math.floor((totalRevenue * 0.1) / 1.1);
    setResults({ totalCost, netProfit, vatReference });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, "");
    setInputs((prev) => ({
      ...prev,
      [name]: Math.floor(Number(numericValue || 0)),
    }));
    setIsDataChanged(true);
  };

  const handleSave = useCallback(async () => {
    if (!user?.business_number) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}:6100/simple-pnl/save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_number: user.business_number,
            year_month: yearMonth,
            inputs: inputs,
          }),
        }
      );
      const result = await response.json();

      if (result.success) {
        setSavedData(inputs);
        setIsDataChanged(false);
      } else {
        console.error("Failed to save data:", result.message);
      }
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.business_number, yearMonth, inputs]);

  // Add formatNumber function
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "0";
    return Math.floor(Number(num)).toLocaleString("ko-KR");
  };

  return (
    <ProtectedRoute>
      <TooltipProvider>
        <div className="max-w-md p-4 mx-auto font-sans">
          <h1 className="mb-6 text-2xl font-bold text-center">손익계산서 v2</h1>

          {/* Compact Date Selector */}
          <div className="mb-6 bg-white rounded-lg shadow-sm p-2">
            <div className="flex justify-center items-center mb-2">
              <span className="text-lg font-medium text-gray-700">
                {year}년 {month}월
              </span>
            </div>

            <div className="flex justify-center space-x-1">
              {monthList.map((m) => (
                <button
                  key={`${m.year}-${m.number}`}
                  onClick={() => handleMonthSelect(m.number, m.year)}
                  className={`
                    relative w-6 h-6 flex items-center justify-center rounded 
                    transition-all duration-200 ease-in-out
                    transform hover:scale-110
                    ${
                      m.isSelected
                        ? "bg-blue-500 text-white"
                        : m.isPreviousYear
                        ? "bg-gray-200 hover:bg-gray-300 text-gray-600"
                        : "bg-gray-50 hover:bg-gray-100"
                    }
                    ${m.isCurrentMonth ? "ring-1 ring-blue-400" : ""}
                  `}
                >
                  {m.number}
                  {m.isCurrentMonth && (
                    <span className="absolute -top-0.5 -right-0.5">
                      <span className="flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                      </span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-4 mb-6">
            {/* Cost of Sales Input */}
            <div className="grid items-center grid-cols-3 gap-2">
              <label className="flex items-center col-span-1 gap-2 text-sm font-medium group">
                <ShoppingCart size={18} className="text-gray-500 transition-colors group-hover:text-blue-500" />
                매출원가
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle size={14} className="text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">상품 매출에 대한 원가 비용</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <div className="col-span-2 relative flex items-center">
                <Input
                  name="costOfSales"
                  value={formatNumber(inputs.costOfSales)}
                  onChange={handleInputChange}
                  className="text-right pr-8 border-gray-300 transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent hover:border-blue-300"
                  placeholder="0"
                />
                <span className="absolute right-2">원</span>
              </div>
            </div>

            {/* Rent Input */}
            <div className="grid items-center grid-cols-3 gap-2">
              <label className="flex items-center col-span-1 gap-2 text-sm font-medium group">
                <Building2 size={18} className="text-gray-500 transition-colors group-hover:text-blue-500" />
                임차료
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle size={14} className="text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">매장, 사무실 등의 임대료</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <div className="col-span-2 relative flex items-center">
                <Input
                  name="rent"
                  value={formatNumber(inputs.rent)}
                  onChange={handleInputChange}
                  className="text-right pr-8 border-gray-300 transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent hover:border-blue-300"
                  placeholder="0"
                />
                <span className="absolute right-2">원</span>
              </div>
            </div>

            {/* Labor Input */}
            <div className="grid items-center grid-cols-3 gap-2">
              <label className="flex items-center col-span-1 gap-2 text-sm font-medium group">
                <Users size={18} className="text-gray-500 transition-colors group-hover:text-blue-500" />
                인건비
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle size={14} className="text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">직원 급여 및 복리후생비</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <div className="col-span-2 relative flex items-center">
                <Input
                  name="labor"
                  value={formatNumber(inputs.labor)}
                  onChange={handleInputChange}
                  className="text-right pr-8 border-gray-300 transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent hover:border-blue-300"
                  placeholder="0"
                />
                <span className="absolute right-2">원</span>
              </div>
            </div>

            {/* Utilities Input */}
            <div className="grid items-center grid-cols-3 gap-2">
              <label className="flex items-center col-span-1 gap-2 text-sm font-medium group">
                <Lightbulb size={18} className="text-gray-500 transition-colors group-hover:text-blue-500" />
                공과금
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle size={14} className="text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">전기, 수도, 가스 등의 공공요금</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <div className="col-span-2 relative flex items-center">
                <Input
                  name="utilities"
                  value={formatNumber(inputs.utilities)}
                  onChange={handleInputChange}
                  className="text-right pr-8 border-gray-300 transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent hover:border-blue-300"
                  placeholder="0"
                />
                <span className="absolute right-2">원</span>
              </div>
            </div>

            {/* Other Expenses Input */}
            <div className="grid items-center grid-cols-3 gap-2">
              <label className="flex items-center col-span-1 gap-2 text-sm font-medium group">
                <LayoutGrid size={18} className="text-gray-500 transition-colors group-hover:text-blue-500" />
                기타비용
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle size={14} className="text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">기타 운영비용 (소모품비, 광고비 등)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <div className="col-span-2 relative flex items-center">
                <Input
                  name="otherExpenses"
                  value={formatNumber(inputs.otherExpenses)}
                  onChange={handleInputChange}
                  className="text-right pr-8 border-gray-300 transition-all duration-200 focus:ring-2 focus:ring-blue-400 focus:border-transparent hover:border-blue-300"
                  placeholder="0"
                />
                <span className="absolute right-2">원</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6">
            <Button
              onClick={calculate}
              className="flex-1 flex items-center justify-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 group"
            >
              <Calculator
                size={20}
                className="transition-transform duration-200 group-hover:rotate-12"
              />
              계산하기
            </Button>

            <Button
              onClick={handleSave}
              disabled={!isDataChanged || isLoading}
              className={`flex-1 flex items-center justify-center gap-2 transition-all duration-200 group
                ${isDataChanged && !isLoading
                  ? 'text-white bg-emerald-600 hover:bg-emerald-700' 
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed'}`}
            >
              <span className="transition-transform duration-200 group-hover:scale-110">
                {isLoading ? '⏳' : '💾'}
              </span>
              {isLoading ? '저장중...' : '저장하기'}
            </Button>
          </div>

          {/* Financial Metrics Cards */}
          <div className="space-y-4 mb-6">
            {/* Total Revenue Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">총매출액</span>
                <span className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  <Calculator size={12} className="mr-1" />
                  매출집계
                </span>
              </div>
              <div className="flex items-baseline justify-end">
                <span className="text-2xl font-bold text-gray-900">{formatNumber(totalRevenue)}</span>
                <span className="ml-1 text-gray-600">원</span>
              </div>
            </div>

            {/* Total Cost Card */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">총비용</span>
                <span className="flex items-center text-xs text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                  <Calculator size={12} className="mr-1" />
                  비용합계
                </span>
              </div>
              <div className="flex items-baseline justify-end">
                <span className="text-2xl font-bold text-gray-900">{formatNumber(results.totalCost)}</span>
                <span className="ml-1 text-gray-600">원</span>
              </div>
            </div>

            {/* Net Profit Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">순이익</span>
                <span className="flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <Calculator size={12} className="mr-1" />
                  매출-비용
                </span>
              </div>
              <div className="flex items-baseline justify-end">
                <span className={`text-2xl font-bold ${results.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatNumber(results.netProfit)}
                </span>
                <span className="ml-1 text-gray-600">원</span>
              </div>
            </div>

            {/* VAT Reference Card */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600">부가세 참고액</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle size={14} className="ml-1 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">매출액의 10%를 1.1로 나눈 금액</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="flex items-center text-xs text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
                  <Calculator size={12} className="mr-1" />
                  VAT
                </span>
              </div>
              <div className="flex items-baseline justify-end">
                <span className="text-2xl font-bold text-gray-900">{formatNumber(results.vatReference)}</span>
                <span className="ml-1 text-gray-600">원</span>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </ProtectedRoute>
  );
};

export default SimplePnlLv2;
