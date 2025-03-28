"use client";
import { useState, useEffect, useMemo } from "react";
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
import useMonthSalesStore from "@/lib/store/monthSalesStore";
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
  const [savedData, setSavedData] = useState(null);
  const [isDataChanged, setIsDataChanged] = useState(false);

  const {
    salesData,
    fetchSalesData,
    isLoading: salesLoading,
    error: salesError,
  } = useSalesStore();
  const {
    monthSalesData,
    fetchMonthSales,
    isLoading: monthSalesLoading,
    error: monthSalesError,
  } = useMonthSalesStore();

  useEffect(() => {
    if (user?.business_number) {
      const fromDate = `${year}${month.toString().padStart(2, "0")}`;
      const toDate = `${year}${month.toString().padStart(2, "0")}`;
      fetchMonthSales(user.business_number, fromDate, toDate);
      fetchSalesData(user.business_number);
    }
  }, [fetchMonthSales, fetchSalesData, user?.business_number, year, month]);

  // Log the monthSalesData when it changes
  useEffect(() => {
    if (monthSalesData) {
      console.log("Month Sales Data:", monthSalesData);
    }
  }, [monthSalesData]);

  // totalRevenue 계산을 useMemo로 변경
  const totalRevenue = useMemo(() => {
    if (!monthSalesData || !Array.isArray(monthSalesData)) return 0;

    const currentMonthData = monthSalesData.find(
      (data) =>
        data.sale_month === `${year}${month.toString().padStart(2, "0")}`
    );

    return currentMonthData ? Number(currentMonthData.sum_amt) : 0;
  }, [monthSalesData, year, month]);

  console.log("totalRevenue", totalRevenue);

  // 저장된 데이터 조회
  const fetchSavedData = async (businessNumber, yearMonth) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}:6100/simple-pnl/get`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_number: businessNumber,
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
          otherExpenses: Math.floor(
            Number(result.data.inputs.otherExpenses || 0)
          ),
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
    }
  };

  // inputs 변경 감지를 위한 별도의 useEffect
  useEffect(() => {
    const checkIfChanged = () => {
      if (!savedData) {
        // 저장된 데이터가 없는 경우
        const hasNonZeroValues = Object.values(inputs).some(
          (value) => value > 0
        );
        console.log(
          "No saved data, checking for non-zero values:",
          hasNonZeroValues
        );
        return hasNonZeroValues;
      }

      // 저장된 데이터와 현재 입력값 비교
      const isChanged = Object.keys(inputs).some((key) => {
        const currentValue = Math.floor(Number(inputs[key] || 0));
        const savedValue = Math.floor(Number(savedData.inputs[key] || 0));
        const isDifferent = currentValue !== savedValue;

        if (isDifferent) {
          console.log(`Value changed for ${key}:`, {
            current: currentValue,
            saved: savedValue,
          });
        }

        return isDifferent;
      });

      console.log("Checking for changes:", {
        currentInputs: inputs,
        savedInputs: savedData.inputs,
        isChanged,
      });

      return isChanged;
    };

    const changed = checkIfChanged();
    setIsDataChanged(changed);
  }, [inputs, savedData]);

  // handleInputChange도 정수 처리 확실히
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, "");
    const newValue = Math.floor(Number(numericValue || 0));
    setInputs((prev) => ({ ...prev, [name]: newValue }));
  };

  // 저장 함수 수정
  const handleSave = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}:6100/simple-pnl/save`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_number: user.business_number,
            year_month: `${year}${month.toString().padStart(2, "0")}`,
            inputs: inputs,
          }),
        }
      );
      const result = await response.json();

      if (result.success) {
        setSavedData(result.data);
        setIsDataChanged(false);
        alert("저장되었습니다.");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // 월 변경 시 저장된 데이터 조회
  useEffect(() => {
    if (user?.business_number) {
      const fromDate = `${year}${month.toString().padStart(2, "0")}`;
      const toDate = `${year}${month.toString().padStart(2, "0")}`;
      fetchMonthSales(user.business_number, fromDate, toDate);
      fetchSavedData(user.business_number, fromDate);
    }
  }, [user?.business_number, year, month]);

  // monthSalesData 변경 감지 및 처리
  useEffect(() => {
    if (monthSalesData && savedData) {
      console.log("Comparing monthSalesData with saved data:", {
        monthSalesData,
        savedData,
      });

      // 저장된 데이터의 매출액과 현재 매출액이 다른 경우
      if (totalRevenue !== savedData.totalRevenue) {
        setIsDataChanged(true);
      }
    }
  }, [monthSalesData, savedData]);

  if (salesLoading || monthSalesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (salesError || monthSalesError) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center text-red-500">
          Error: {salesError || monthSalesError}
        </div>
      </div>
    );
  }

  if (!salesData && !monthSalesData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">데이터가 없습니다.</div>
      </div>
    );
  }

  if (monthSalesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (monthSalesError) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center text-red-500">Error: {monthSalesError}</div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <TooltipProvider>
        <div className="max-w-md p-4 mx-auto font-sans">
          <h1 className="mb-6 text-2xl font-bold text-center">
            간편 손익계산서
          </h1>

          {/* 년도 및 월 선택 */}
          <div className="flex gap-4 mb-6">
            <Select
              value={year.toString()}
              onValueChange={(val) => setYear(parseInt(val))}
            >
              <SelectTrigger className="w-full bg-white border-gray-300">
                <SelectValue placeholder="년도" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(
                  { length: currentYear - 2019 },
                  (_, i) => 2020 + i
                ).map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}년
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={month.toString()}
              onValueChange={(val) => setMonth(parseInt(val))}
            >
              <SelectTrigger className="w-full bg-white border-gray-300">
                <SelectValue placeholder="월" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {m}월
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 입력 및 출력 */}
          <div className="space-y-4">
            <div className="grid items-center grid-cols-3 gap-2">
              <label className="flex items-center col-span-1 gap-1 text-sm font-medium">
                총매출액
                <Tooltip delayDuration={1000}>
                  <TooltipTrigger asChild>
                    <button type="button" className="focus:outline-none">
                      <HelpCircle
                        size={16}
                        className="text-gray-500 cursor-pointer hover:text-gray-700"
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    sideOffset={5}
                    className="bg-white p-2 rounded-lg shadow-lg border border-gray-200"
                  >
                    <p>자동으로 받아온 매출액 (부가세 포함)</p>
                  </TooltipContent>
                </Tooltip>
              </label>
              <div className="col-span-2 relative flex items-center">
                <Input
                  value={totalRevenue.toLocaleString("ko-KR")}
                  disabled
                  className="text-right pr-8 bg-gray-100 border-gray-300"
                />
                <span className="absolute right-2">원</span>
              </div>
            </div>

            <div className="grid items-center grid-cols-3 gap-2">
              <label className="flex items-center col-span-1 gap-1 text-sm font-medium">
                매출원가
                <Tooltip delayDuration={1000}>
                  <TooltipTrigger asChild>
                    <button type="button" className="focus:outline-none">
                      <HelpCircle
                        size={16}
                        className="text-gray-500 cursor-pointer hover:text-gray-700"
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    sideOffset={5}
                    className="bg-white p-2 rounded-lg shadow-lg border border-gray-200"
                  >
                    <p>재료비, 구매비 등 매출 발생 직접 비용</p>
                  </TooltipContent>
                </Tooltip>
              </label>
              <div className="col-span-2 relative flex items-center">
                <Input
                  name="costOfSales"
                  value={inputs.costOfSales.toLocaleString("ko-KR")}
                  onChange={handleInputChange}
                  className="text-right pr-8 border-gray-300"
                  placeholder="0"
                />
                <span className="absolute right-2">원</span>
              </div>
            </div>

            <div className="grid items-center grid-cols-3 gap-2">
              <label className="flex items-center col-span-1 gap-1 text-sm font-medium">
                임대료
                <Tooltip delayDuration={1000}>
                  <TooltipTrigger asChild>
                    <button type="button" className="focus:outline-none">
                      <HelpCircle
                        size={16}
                        className="text-gray-500 cursor-pointer hover:text-gray-700"
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    sideOffset={5}
                    className="bg-white p-2 rounded-lg shadow-lg border border-gray-200"
                  >
                    <p>사업장 임대 비용</p>
                  </TooltipContent>
                </Tooltip>
              </label>
              <div className="col-span-2 relative flex items-center">
                <Input
                  name="rent"
                  value={inputs.rent.toLocaleString("ko-KR")}
                  onChange={handleInputChange}
                  className="text-right pr-8 border-gray-300"
                  placeholder="0"
                />
                <span className="absolute right-2">원</span>
              </div>
            </div>

            <div className="grid items-center grid-cols-3 gap-2">
              <label className="flex items-center col-span-1 gap-1 text-sm font-medium">
                인건비
                <Tooltip delayDuration={1000}>
                  <TooltipTrigger asChild>
                    <button type="button" className="focus:outline-none">
                      <HelpCircle
                        size={16}
                        className="text-gray-500 cursor-pointer hover:text-gray-700"
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    sideOffset={5}
                    className="bg-white p-2 rounded-lg shadow-lg border border-gray-200"
                  >
                    <p>직원 급여, 아르바이트 비용</p>
                  </TooltipContent>
                </Tooltip>
              </label>
              <div className="col-span-2 relative flex items-center">
                <Input
                  name="labor"
                  value={inputs.labor.toLocaleString("ko-KR")}
                  onChange={handleInputChange}
                  className="text-right pr-8 border-gray-300"
                  placeholder="0"
                />
                <span className="absolute right-2">원</span>
              </div>
            </div>

            <div className="grid items-center grid-cols-3 gap-2">
              <label className="flex items-center col-span-1 gap-1 text-sm font-medium">
                공과금
                <Tooltip delayDuration={1000}>
                  <TooltipTrigger asChild>
                    <button type="button" className="focus:outline-none">
                      <HelpCircle
                        size={16}
                        className="text-gray-500 cursor-pointer hover:text-gray-700"
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    sideOffset={5}
                    className="bg-white p-2 rounded-lg shadow-lg border border-gray-200"
                  >
                    <p>전기, 수도, 인터넷 등</p>
                  </TooltipContent>
                </Tooltip>
              </label>
              <div className="col-span-2 relative flex items-center">
                <Input
                  name="utilities"
                  value={inputs.utilities.toLocaleString("ko-KR")}
                  onChange={handleInputChange}
                  className="text-right pr-8 border-gray-300"
                  placeholder="0"
                />
                <span className="absolute right-2">원</span>
              </div>
            </div>

            <div className="grid items-center grid-cols-3 gap-2">
              <label className="flex items-center col-span-1 gap-1 text-sm font-medium">
                기타 운영비
                <Tooltip delayDuration={1000}>
                  <TooltipTrigger asChild>
                    <button type="button" className="focus:outline-none">
                      <HelpCircle
                        size={16}
                        className="text-gray-500 cursor-pointer hover:text-gray-700"
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    sideOffset={5}
                    className="bg-white p-2 rounded-lg shadow-lg border border-gray-200"
                  >
                    <p>마케팅비, 운송비 등 기타 비용</p>
                  </TooltipContent>
                </Tooltip>
              </label>
              <div className="col-span-2 relative flex items-center">
                <Input
                  name="otherExpenses"
                  value={inputs.otherExpenses.toLocaleString("ko-KR")}
                  onChange={handleInputChange}
                  className="text-right pr-8 border-gray-300"
                  placeholder="0"
                />
                <span className="absolute right-2">원</span>
              </div>
            </div>

            {/* 계산 버튼 */}
            <Button
              onClick={() => {
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
              }}
              className="flex items-center justify-center w-full gap-2 mt-4 text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Calculator size={20} /> 계산하기
            </Button>

            {/* 결과 표시 */}
            <div className="mt-6 space-y-2">
              <div className="grid items-center grid-cols-3 gap-2 p-3 bg-gray-100 rounded-lg">
                <span className="col-span-1 font-semibold">총비용</span>
                <span className="col-span-2 text-right">
                  {results.totalCost.toLocaleString("ko-KR")} 원
                </span>
              </div>
              <div className="grid items-center grid-cols-3 gap-2 p-3 bg-gray-100 rounded-lg">
                <span className="col-span-1 font-semibold">순이익</span>
                <span className="col-span-2 text-right">
                  {results.netProfit.toLocaleString("ko-KR")} 원
                </span>
              </div>
              <div className="grid items-center grid-cols-3 gap-2 p-3 bg-gray-100 rounded-lg">
                <span className="col-span-1 font-semibold">부가세 참고액</span>
                <span className="col-span-2 text-right">
                  {results.vatReference.toLocaleString("ko-KR")} 원
                </span>
              </div>
            </div>

            {/* 저장 버튼 추가 */}
            <Button
              onClick={handleSave}
              disabled={!isDataChanged}
              className={`w-full mt-6 ${
                isDataChanged
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              저장하기
            </Button>
          </div>
        </div>
      </TooltipProvider>
    </ProtectedRoute>
  );
};

export default SimplePnl;
