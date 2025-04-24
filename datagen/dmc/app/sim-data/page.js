"use client";
import Navigation from "../components/Navigation";
import { useStore } from "../store";
import { useState, useEffect, useRef } from "react";
import {
  CheckIcon,
  UserIcon,
  Building2,
  MapPin,
  FileText,
  Briefcase,
  Star,
  TrendingUp,
  BarChart2,
  Users,
  Target,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DeliveryRatioSlider from "@/components/DeliveryRatioSlider";
import OnlineSalesRatioSlider from "@/components/OnlineSalesRatioSlider";
import MonthlySalesChart from "@/components/MonthlySalesChart";

export default function SimData() {
  const {
    fetchUsers,
    checkGenData,
    checkGenComparison,
    genDataStatus,
    genComparisonStatus,
    users,
  } = useStore();
  const [selectedUser, setSelectedUser] = useState("");
  const [address, setAddress] = useState("");
  const [sector, setSector] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState({
    step1: { status: "ready", completed: false },
    step2: { status: "ready", completed: false },
    step3: { status: "ready", completed: false },
    step4: { status: "ready", completed: false },
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dataCount, setDataCount] = useState("");
  const [formData, setFormData] = useState({
    businessDays: ["mon", "tue", "wed", "thu", "fri"],
    isWeekendOpen: false,
    weekdayOpenTime: "10:00",
    weekdayCloseTime: "22:00",
    weekendOpenTime: "10:00",
    weekendCloseTime: "22:00",
    hasDelivery: false,
    deliveryRatio: "30",
    baeminRatio: "55",
    coupangEatsRatio: "40",
    yogiyoRatio: "5",
    hasOnlineSales: false,
    onlineSalesRatio: "20",
    smartStoreRatio: "35",
    coupangRatio: "50",
    gmarketRatio: "15",
    trend: "stable",
    trendRate: "5",
    seasonalDeviation: "10",
    seasonality: "neutral",
    locationType: "residential",
    startDate: "",
    endDate: "",
    zoneRange: "same",
    sectorRange: "same",
    revenueRange: "none",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [revenueData, setRevenueData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const generateButtonRef = useRef(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [collectionData, setCollectionData] = useState(null); // 데이터 수집 결과 저장

  const stepLabels = [
    { id: 1, label: "데이터생성" },
    { id: 2, label: "데이터조회" },
    { id: 3, label: "수집및분석" },
    { id: 4, label: "비교군생성" },
  ];

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserSelect = (userId) => {
    console.log("Selected User:", userId); // 디버깅용
    setSelectedUser(userId);
    if (currentStep === 0) {
      setCurrentStep(1);
    }
  };

  const handleStep2 = async () => {
    if (!selectedUser) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3400/fetch-smb-revenue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessNumber: selectedUser,
        }),
      });

      if (!response.ok) {
        throw new Error("데이터 조회에 실패했습니다.");
      }

      const result = await response.json();
      console.log("Fetched revenue data:", result); // 디버깅용 로그 추가

      if (result.status === "success" && result.data) {
        setRevenueData(result.data);
        console.log("Online stores data:", result.data.online_stores); // 디버깅용 로그 추가
        setSteps((prev) => ({
          ...prev,
          step2: { status: "completed", completed: true },
          step3: { status: "ready", completed: false },
        }));
      } else {
        throw new Error(result.message || "데이터 조회에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3 = async () => {
    if (!selectedUser) {
      setError("사업자를 선택해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. 데이터 수집 API 호출
      const collectResponse = await fetch("http://localhost:3400/do-collect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessNumber: selectedUser,
        }),
      });

      if (!collectResponse.ok) {
        throw new Error("데이터 수집에 실패했습니다.");
      }

      const collectResult = await collectResponse.json();
      console.log("데이터 수집 결과:", collectResult);
      setCollectionData(collectResult); // 수집 결과 저장

      // 2. 분석 서버 호출
      const analysisResponse = await fetch(
        `http://localhost:3800/datagen?businessNumber=${selectedUser}`,
        {
          method: "GET",
        }
      );

      if (!analysisResponse.ok) {
        throw new Error("데이터 분석에 실패했습니다.");
      }

      const analysisResult = await analysisResponse.json();
      console.log("데이터 분석 결과:", analysisResult);

      // 3. 단계 상태 업데이트
      setSteps((prev) => ({
        ...prev,
        step3: { status: "completed", completed: true },
        step4: { status: "ready", completed: false },
      }));

      // 4. 다음 단계로 이동하지 않고 현재 단계에 머무름
      // setCurrentStep(4);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep4 = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 오늘 날짜 기준 이전달 계산
      const today = new Date();
      const previousMonth = new Date(
        today.getFullYear(),
        today.getMonth() - 1,
        1
      );
      const previousMonthStr = `${previousMonth.getFullYear()}-${String(
        previousMonth.getMonth() + 1
      ).padStart(2, "0")}`;

      // 수집된 데이터에서 이전달 매출 총액 추출
      const previousMonthData = collectionData?.data?.monthly_sales?.find(
        (data) =>
          `${data.year}-${String(data.month).padStart(2, "0")}` ===
          previousMonthStr
      );

      const lastMonthRevenue = previousMonthData?.revenue || 500000;

      const response = await fetch("http://localhost:3400/comparison-groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zone_nm: users.find((u) => u.business_number === selectedUser)
            ?.zone_nm,
          smb_sector: users.find((u) => u.business_number === selectedUser)
            ?.smb_sector,
          revenue_grade: formData.revenueRange,
          base_revenue: lastMonthRevenue, // 이전달 매출 총액 사용
        }),
      });

      if (!response.ok) {
        throw new Error("비교군 생성에 실패했습니다.");
      }

      const result = await response.json();
      setComparisonResult(result);

      setSteps((prev) => ({
        ...prev,
        step4: { status: "completed", completed: true },
      }));
    } catch (error) {
      console.error("Error generating comparison group:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepClick = (stepId) => {
    if (stepId < currentStep) {
      setCurrentStep(stepId);
    }
  };

  const resetProcess = () => {
    setSelectedUser("");
    setCurrentStep(0);
    setSteps({
      step1: { status: "ready", completed: false },
      step2: { status: "ready", completed: false },
      step3: { status: "ready", completed: false },
      step4: { status: "ready", completed: false },
    });
  };

  const getSelectedUserName = () => {
    console.log(typeof selectedUser, users);
    return (
      users.find((u) => u.business_number === selectedUser)?.merchant_name || ""
    );
  };

  const validateForm = () => {
    if (!selectedUser) {
      setError("사업장을 선택해주세요.");
      return false;
    }

    if (!formData.businessDays || formData.businessDays.length === 0) {
      setError("영업일을 선택해주세요.");
      return false;
    }

    if (!formData.weekdayAvgSales) {
      setError("평일 평균매출을 입력해주세요.");
      return false;
    }

    // 주말 영업일이 선택된 경우에만 주말 평균매출 검증
    const hasWeekend = formData.businessDays.some(
      (day) => day === "sat" || day === "sun"
    );
    if (hasWeekend && !formData.weekendAvgSales) {
      setError("주말 평균매출을 입력해주세요.");
      return false;
    }

    if (!formData.startDate || !formData.endDate) {
      setError("기간을 선택해주세요.");
      return false;
    }

    return true;
  };

  const handleGenerateData = async () => {
    console.log("handleGenerateData");
    try {
      if (!validateForm()) {
        console.log("validateForm failed");
        return;
      }
      console.log("Form Data:", formData);
      setIsLoading(true);
      setError(null);

      // 주말 영업일이 선택된 경우에만 주말 평균매출 포함
      const requestData = {
        ...formData,
        businessNumber: selectedUser,
        weekendAvgSales: formData.businessDays.some(
          (day) => day === "sat" || day === "sun"
        )
          ? formData.weekendAvgSales
          : undefined,
      };
      console.log("Request Data:", requestData);
      console.log("Date Range:", {
        startDate: requestData.startDate,
        endDate: requestData.endDate,
        days: Math.round(
          (new Date(requestData.endDate) - new Date(requestData.startDate)) /
            (1000 * 60 * 60 * 24)
        ),
      });

      // 데이터 생성 API 호출
      const response = await fetch("http://localhost:3400/gen-smb-revenue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error("데이터 생성에 실패했습니다.");
      }

      const result = await response.json();
      console.log("Generation Result:", result);
      setGenerationResult(result);
      setCurrentStep(2);
    } catch (err) {
      console.error("Error in handleGenerateData:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToGenerateButton = () => {
    generateButtonRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Helper functions for calculations
  const calculateCardSalesTotal = (revenueData) => {
    if (!revenueData?.card_sales_data?.daily_sales_data) return 0;
    return revenueData.card_sales_data.daily_sales_data.reduce((total, day) => {
      if (!day.approval_details) return total;
      return (
        total +
        day.approval_details.reduce(
          (dayTotal, approval) => dayTotal + (approval.total_amount || 0),
          0
        )
      );
    }, 0);
  };

  const calculateOnlineStoreTotal = (revenueData, formData) => {
    if (!formData?.hasOnlineSales || !revenueData?.online_stores) return 0;
    return Object.values(revenueData.online_stores).reduce((total, store) => {
      return (
        total +
        store.reduce((storeTotal, day) => {
          return storeTotal + (day.sales_amount || 0);
        }, 0)
      );
    }, 0);
  };

  const calculateDeliveryTotal = (revenueData, formData) => {
    if (!formData?.hasDelivery) return 0;
    let total = 0;
    ["baemin", "coupangeats", "yogiyo"].forEach((service) => {
      if (revenueData[service]?.daily_sales_data) {
        total += revenueData[service].daily_sales_data.reduce(
          (serviceTotal, day) => serviceTotal + (day.total_sales_amount || 0),
          0
        );
      }
    });
    return total;
  };

  const calculateOfflineTotal = (revenueData) => {
    let total = calculateCardSalesTotal(revenueData);
    if (revenueData?.hometax_cash_receipts) {
      total += revenueData.hometax_cash_receipts.reduce(
        (sum, day) => sum + (day.total_cash_amount || 0),
        0
      );
    }
    if (revenueData?.tax_invoices?.total_issued_amount) {
      total += revenueData.tax_invoices.total_issued_amount;
    }
    return total;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            {!generationResult ? (
              <div className="space-y-6">
                {/* 기본 정보 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                  <h3 className="text-lg font-medium mb-4">기본 정보</h3>

                  {/* 영업일 선택 */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      영업일
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const allDays = [
                              "mon",
                              "tue",
                              "wed",
                              "thu",
                              "fri",
                              "sat",
                              "sun",
                            ];
                            const currentDays = formData.businessDays || [];
                            const isAllSelected = allDays.every((day) =>
                              currentDays.includes(day)
                            );
                            setFormData({
                              ...formData,
                              businessDays: isAllSelected ? [] : allDays,
                              isWeekendOpen: !isAllSelected,
                            });
                          }}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            formData.businessDays.length === 7
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          }`}
                        >
                          [전체]
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const weekdays = [
                              "mon",
                              "tue",
                              "wed",
                              "thu",
                              "fri",
                            ];
                            const currentDays = formData.businessDays || [];
                            const isWeekdaysSelected = weekdays.every((day) =>
                              currentDays.includes(day)
                            );
                            setFormData({
                              ...formData,
                              businessDays: isWeekdaysSelected ? [] : weekdays,
                              isWeekendOpen: false,
                            });
                          }}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            formData.businessDays.length === 5 &&
                            !formData.isWeekendOpen
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          }`}
                        >
                          [주중]
                        </button>
                      </div>
                      <div className="flex gap-2 flex-1">
                        {[
                          { id: "mon", label: "월" },
                          { id: "tue", label: "화" },
                          { id: "wed", label: "수" },
                          { id: "thu", label: "목" },
                          { id: "fri", label: "금" },
                          { id: "sat", label: "토" },
                          { id: "sun", label: "일" },
                        ].map((day) => (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => {
                              const currentDays = formData.businessDays || [];
                              const newDays = currentDays.includes(day.id)
                                ? currentDays.filter((d) => d !== day.id)
                                : [...currentDays, day.id];
                              setFormData({
                                ...formData,
                                businessDays: newDays,
                                isWeekendOpen:
                                  newDays.includes("sat") ||
                                  newDays.includes("sun"),
                              });
                            }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                              formData.businessDays.includes(day.id)
                                ? day.id === "sat"
                                  ? "bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-300"
                                  : day.id === "sun"
                                  ? "bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300"
                                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                : "bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 영업시간 */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        주중 영업시간
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={formData.weekdayOpenTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              weekdayOpenTime: e.target.value,
                            })
                          }
                          className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            formData.businessDays.some((day) =>
                              ["mon", "tue", "wed", "thu", "fri"].includes(day)
                            )
                              ? "border-gray-200 dark:border-gray-700"
                              : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
                          }`}
                          disabled={
                            !formData.businessDays.some((day) =>
                              ["mon", "tue", "wed", "thu", "fri"].includes(day)
                            )
                          }
                        />
                        <span className="text-gray-500 dark:text-gray-400">
                          ~
                        </span>
                        <input
                          type="time"
                          value={formData.weekdayCloseTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              weekdayCloseTime: e.target.value,
                            })
                          }
                          className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            formData.businessDays.some((day) =>
                              ["mon", "tue", "wed", "thu", "fri"].includes(day)
                            )
                              ? "border-gray-200 dark:border-gray-700"
                              : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
                          }`}
                          disabled={
                            !formData.businessDays.some((day) =>
                              ["mon", "tue", "wed", "thu", "fri"].includes(day)
                            )
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        주말 영업시간
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={formData.weekendOpenTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              weekendOpenTime: e.target.value,
                            })
                          }
                          className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            formData.businessDays.some((day) =>
                              ["sat", "sun"].includes(day)
                            )
                              ? "border-gray-200 dark:border-gray-700"
                              : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
                          }`}
                          disabled={
                            !formData.businessDays.some((day) =>
                              ["sat", "sun"].includes(day)
                            )
                          }
                        />
                        <span className="text-gray-500 dark:text-gray-400">
                          ~
                        </span>
                        <input
                          type="time"
                          value={formData.weekendCloseTime}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              weekendCloseTime: e.target.value,
                            })
                          }
                          className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            formData.businessDays.some((day) =>
                              ["sat", "sun"].includes(day)
                            )
                              ? "border-gray-200 dark:border-gray-700"
                              : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
                          }`}
                          disabled={
                            !formData.businessDays.some((day) =>
                              ["sat", "sun"].includes(day)
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 매출 정보 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                  <h3 className="text-lg font-medium mb-4">매출 정보</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        평일 평균 매출 <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const currentValue =
                                parseInt(formData.weekdayAvgSales) || 0;
                              setFormData({
                                ...formData,
                                weekdayAvgSales: (
                                  currentValue + 500000
                                ).toString(),
                              });
                              setValidationErrors({});
                            }}
                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                          >
                            +50만
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const currentValue =
                                parseInt(formData.weekdayAvgSales) || 0;
                              setFormData({
                                ...formData,
                                weekdayAvgSales: (
                                  currentValue + 100000
                                ).toString(),
                              });
                              setValidationErrors({});
                            }}
                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                          >
                            +10만
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const currentValue =
                                parseInt(formData.weekdayAvgSales) || 0;
                              setFormData({
                                ...formData,
                                weekdayAvgSales: (
                                  currentValue + 10000
                                ).toString(),
                              });
                              setValidationErrors({});
                            }}
                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                          >
                            +1만
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                weekdayAvgSales: "0",
                              });
                              setValidationErrors({});
                            }}
                            className="px-3 py-1.5 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                          >
                            클리어
                          </button>
                        </div>
                        <input
                          type="text"
                          value={
                            formData.weekdayAvgSales
                              ? parseInt(
                                  formData.weekdayAvgSales
                                ).toLocaleString()
                              : ""
                          }
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, "");
                            if (!isNaN(value) || value === "") {
                              setFormData({
                                ...formData,
                                weekdayAvgSales: value,
                              });
                              setValidationErrors({});
                            }
                          }}
                          className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            validationErrors.weekdayAvgSales
                              ? "border-red-500"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                          placeholder="예: 500,000"
                          required={formData.businessDays.some((day) =>
                            ["mon", "tue", "wed", "thu", "fri"].includes(day)
                          )}
                        />
                        {validationErrors.weekdayAvgSales && (
                          <p className="mt-1 text-sm text-red-500">
                            {validationErrors.weekdayAvgSales}
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        주말 평균 매출 <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const currentValue =
                                parseInt(formData.weekendAvgSales) || 0;
                              setFormData({
                                ...formData,
                                weekendAvgSales: (
                                  currentValue + 500000
                                ).toString(),
                              });
                              setValidationErrors({});
                            }}
                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                          >
                            +50만
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const currentValue =
                                parseInt(formData.weekendAvgSales) || 0;
                              setFormData({
                                ...formData,
                                weekendAvgSales: (
                                  currentValue + 100000
                                ).toString(),
                              });
                              setValidationErrors({});
                            }}
                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                          >
                            +10만
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const currentValue =
                                parseInt(formData.weekendAvgSales) || 0;
                              setFormData({
                                ...formData,
                                weekendAvgSales: (
                                  currentValue + 10000
                                ).toString(),
                              });
                              setValidationErrors({});
                            }}
                            className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                          >
                            +1만
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                weekendAvgSales: "0",
                              });
                              setValidationErrors({});
                            }}
                            className="px-3 py-1.5 bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
                          >
                            클리어
                          </button>
                        </div>
                        <input
                          type="text"
                          value={
                            formData.weekendAvgSales
                              ? parseInt(
                                  formData.weekendAvgSales
                                ).toLocaleString()
                              : ""
                          }
                          onChange={(e) => {
                            const value = e.target.value.replace(/,/g, "");
                            if (!isNaN(value) || value === "") {
                              setFormData({
                                ...formData,
                                weekendAvgSales: value,
                              });
                              setValidationErrors({});
                            }
                          }}
                          className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            validationErrors.weekendAvgSales
                              ? "border-red-500"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                          placeholder="예: 800,000"
                          disabled={!formData.isWeekendOpen}
                          required={formData.businessDays.some((day) =>
                            ["sat", "sun"].includes(day)
                          )}
                        />
                        {validationErrors.weekendAvgSales && (
                          <p className="mt-1 text-sm text-red-500">
                            {validationErrors.weekendAvgSales}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 배달 및 온라인 스토어 정보 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                  <h3 className="text-lg font-medium mb-4">
                    배달 및 온라인 스토어 정보
                  </h3>
                  <div className="space-y-6">
                    {/* 배달 정보 */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          id="hasDelivery"
                          checked={formData.hasDelivery}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              hasDelivery: e.target.checked,
                              deliveryRatio: e.target.checked
                                ? formData.deliveryRatio
                                : "0",
                            });
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor="hasDelivery"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          배달 서비스 제공
                        </label>
                      </div>

                      {formData.hasDelivery && (
                        <div className="ml-8 space-y-4 border-l-2 border-gray-100 dark:border-gray-700 pl-6">
                          <div className="flex items-center gap-4">
                            <label className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300">
                              배달 비율
                            </label>
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="number"
                                value={formData.deliveryRatio}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    deliveryRatio: e.target.value,
                                  })
                                }
                                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0-100"
                                min="0"
                                max="100"
                              />
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                %
                              </span>
                            </div>
                          </div>

                          {formData.deliveryRatio > 0 && (
                            <div className="space-y-4">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                배달 플랫폼 비율
                              </label>
                              <div className="w-full max-w-md">
                                <DeliveryRatioSlider
                                  value={{
                                    coupangEatsRatio: formData.coupangEatsRatio,
                                    baeminRatio: formData.baeminRatio,
                                    yogiyoRatio: formData.yogiyoRatio,
                                  }}
                                  onChange={(ratios) => {
                                    setFormData({
                                      ...formData,
                                      ...ratios,
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 온라인 스토어 정보 */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          id="hasOnlineSales"
                          checked={formData.hasOnlineSales}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              hasOnlineSales: e.target.checked,
                              onlineSalesRatio: e.target.checked
                                ? formData.onlineSalesRatio
                                : "0",
                            });
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label
                          htmlFor="hasOnlineSales"
                          className="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                          온라인 스토어 제공
                        </label>
                      </div>

                      {formData.hasOnlineSales && (
                        <div className="ml-8 space-y-4 border-l-2 border-gray-100 dark:border-gray-700 pl-6">
                          <div className="flex items-center gap-4">
                            <label className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300">
                              온라인 스토어 비율
                            </label>
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="number"
                                value={formData.onlineSalesRatio}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    onlineSalesRatio: e.target.value,
                                  })
                                }
                                className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0-100"
                                min="0"
                                max="100"
                              />
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                %
                              </span>
                            </div>
                          </div>

                          {formData.onlineSalesRatio > 0 && (
                            <div className="space-y-4">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                온라인 스토어 플랫폼 비율
                              </label>
                              <div className="w-full max-w-md">
                                <OnlineSalesRatioSlider
                                  smartStoreRatio={formData.smartStoreRatio}
                                  coupangRatio={formData.coupangRatio}
                                  gmarketRatio={formData.gmarketRatio}
                                  onChange={(smartStore, coupang, gmarket) => {
                                    setFormData({
                                      ...formData,
                                      smartStoreRatio: smartStore.toString(),
                                      coupangRatio: coupang.toString(),
                                      gmarketRatio: gmarket.toString(),
                                    });
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 기간 정보 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium">기간 설정</h3>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date();
                          const threeMonthsAgo = new Date(today);
                          threeMonthsAgo.setMonth(
                            threeMonthsAgo.getMonth() - 3
                          );
                          setFormData({
                            ...formData,
                            startDate: threeMonthsAgo
                              .toISOString()
                              .split("T")[0],
                            endDate: today.toISOString().split("T")[0],
                          });
                          setValidationErrors({});
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.endDate &&
                          formData.startDate &&
                          new Date(formData.endDate).getTime() -
                            new Date(formData.startDate).getTime() ===
                            90 * 24 * 60 * 60 * 1000
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        3개월
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date();
                          const sixMonthsAgo = new Date(today);
                          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
                          setFormData({
                            ...formData,
                            startDate: sixMonthsAgo.toISOString().split("T")[0],
                            endDate: today.toISOString().split("T")[0],
                          });
                          setValidationErrors({});
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.endDate &&
                          formData.startDate &&
                          new Date(formData.endDate).getTime() -
                            new Date(formData.startDate).getTime() ===
                            180 * 24 * 60 * 60 * 1000
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        6개월
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date();
                          const oneYearAgo = new Date(today);
                          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
                          setFormData({
                            ...formData,
                            startDate: oneYearAgo.toISOString().split("T")[0],
                            endDate: today.toISOString().split("T")[0],
                          });
                          setValidationErrors({});
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          formData.endDate &&
                          formData.startDate &&
                          new Date(formData.endDate).getTime() -
                            new Date(formData.startDate).getTime() ===
                            365 * 24 * 60 * 60 * 1000
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                            : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        1년
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        시작일 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            startDate: e.target.value,
                          });
                          setValidationErrors({});
                        }}
                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          validationErrors.startDate
                            ? "border-red-500"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                        required
                      />
                      {validationErrors.startDate && (
                        <p className="mt-1 text-sm text-red-500">
                          {validationErrors.startDate}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        종료일 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            endDate: e.target.value,
                          });
                          setValidationErrors({});
                        }}
                        max={new Date().toISOString().split("T")[0]}
                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                          validationErrors.endDate
                            ? "border-red-500"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                        required
                      />
                      {validationErrors.endDate && (
                        <p className="mt-1 text-sm text-red-500">
                          {validationErrors.endDate}
                        </p>
                      )}
                    </div>
                  </div>
                  {validationErrors.dateRange && (
                    <p className="mt-2 text-sm text-red-500">
                      {validationErrors.dateRange}
                    </p>
                  )}
                  {formData.startDate &&
                    formData.endDate &&
                    !validationErrors.dateRange && (
                      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>총 </span>
                        <span className="font-medium">
                          {Math.round(
                            (new Date(formData.endDate) -
                              new Date(formData.startDate)) /
                              (1000 * 60 * 60 * 24)
                          )}
                          일
                        </span>
                        <span> 의 데이터가 생성됩니다</span>
                      </div>
                    )}
                </div>

                {/* 트렌드 및 추가 설정 */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                  <h3 className="text-lg font-medium mb-4">추가 설정</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          매출 트렌드
                        </label>
                        <div className="flex items-center gap-4">
                          <select
                            value={formData.trend}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                trend: e.target.value,
                              })
                            }
                            className="w-1/2 p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          >
                            <option value="stable">안정적</option>
                            <option value="increasing">상승</option>
                            <option value="decreasing">하락</option>
                          </select>

                          {(formData.trend === "increasing" ||
                            formData.trend === "decreasing") && (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentValue =
                                      parseInt(formData.trendRate) || 0;
                                    setFormData({
                                      ...formData,
                                      trendRate: Math.max(
                                        0,
                                        currentValue - 5
                                      ).toString(),
                                    });
                                  }}
                                  className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M20 12H4"
                                    />
                                  </svg>
                                </button>
                                <input
                                  type="number"
                                  value={formData.trendRate}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      trendRate: e.target.value,
                                    })
                                  }
                                  min="0"
                                  max="100"
                                  className="w-20 p-2.5 border-t border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center"
                                  placeholder="예: 5"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentValue =
                                      parseInt(formData.trendRate) || 0;
                                    setFormData({
                                      ...formData,
                                      trendRate: Math.min(
                                        100,
                                        currentValue + 5
                                      ).toString(),
                                    });
                                  }}
                                  className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 4v16m8-8H4"
                                    />
                                  </svg>
                                </button>
                              </div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                %
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                          계절적 영향
                        </label>
                        <div className="flex items-center gap-4">
                          <select
                            value={formData.seasonality}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                seasonality: e.target.value,
                              })
                            }
                            className="w-1/2 p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          >
                            <option value="neutral">영향없음</option>
                            <option value="winter">
                              동고하저(겨울철 강세)
                            </option>
                            <option value="summer">
                              동저하고(여름철 강세)
                            </option>
                          </select>

                          {(formData.seasonality === "winter" ||
                            formData.seasonality === "summer") && (
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentValue =
                                      parseInt(formData.seasonalDeviation) || 0;
                                    setFormData({
                                      ...formData,
                                      seasonalDeviation: Math.max(
                                        0,
                                        currentValue - 5
                                      ).toString(),
                                    });
                                  }}
                                  className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M20 12H4"
                                    />
                                  </svg>
                                </button>
                                <input
                                  type="number"
                                  value={formData.seasonalDeviation}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      seasonalDeviation: e.target.value,
                                    })
                                  }
                                  min="0"
                                  max="100"
                                  className="w-20 p-2.5 border-t border-b border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-center"
                                  placeholder="예: 10"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentValue =
                                      parseInt(formData.seasonalDeviation) || 0;
                                    setFormData({
                                      ...formData,
                                      seasonalDeviation: Math.min(
                                        100,
                                        currentValue + 5
                                      ).toString(),
                                    });
                                  }}
                                  className="px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 4v16m8-8H4"
                                    />
                                  </svg>
                                </button>
                              </div>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                %
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        상권 유형
                      </label>
                      <select
                        value={formData.locationType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            locationType: e.target.value,
                          })
                        }
                        className="w-full p-2.5 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        <option value="residential">주거지</option>
                        <option value="commercial">상업지</option>
                        <option value="tourist">관광지</option>
                        <option value="mixed">혼합</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    ref={generateButtonRef}
                    onClick={handleGenerateData}
                    disabled={!selectedUser || isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        생성 중...
                      </span>
                    ) : (
                      "데이터 생성"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">데이터 생성 상태</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(generationResult.generatedAt).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      생성 상태
                    </span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      생성 완료
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      생성 일시
                    </span>
                    <span className="text-sm">
                      {new Date(generationResult.generatedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      생성 데이터
                    </span>
                    <span className="text-sm">
                      {generationResult.dataCount}건
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      생성 기간
                    </span>
                    <span className="text-sm">{generationResult.period}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              {generationResult?.status === "success" ? (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-green-700">
                    데이터 생성이 완료되었습니다.
                    <br />
                    기간: {generationResult.period}
                    <br />
                    생성일시:{" "}
                    {new Date(generationResult.generatedAt).toLocaleString()}
                  </p>
                </div>
              ) : (
                <div className="mt-4 p-4 bg-red-50 rounded-lg">
                  <p className="text-red-700">
                    {error || "데이터 생성에 실패했습니다."}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <Button
                onClick={handleStep2}
                disabled={
                  !generationResult ||
                  generationResult.status !== "success" ||
                  isLoading
                }
                className="w-full max-w-xs relative"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>데이터 조회 중...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                    <span>데이터 조회</span>
                  </div>
                )}
              </Button>
            </div>
            {revenueData && (
              <div className="mt-4 bg-white rounded-lg border p-6 max-w-6xl mx-auto">
                <h3 className="text-lg font-medium mb-6">조회 결과</h3>
                <div className="space-y-8">
                  {/* 총 매출 요약 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">총 매출</p>
                      <p className="text-lg font-medium">
                        {(() => {
                          const onlineTotal = calculateOnlineStoreTotal(
                            revenueData,
                            formData
                          );
                          const deliveryTotal = calculateDeliveryTotal(
                            revenueData,
                            formData
                          );
                          const offlineTotal =
                            calculateOfflineTotal(revenueData);
                          const grandTotal =
                            onlineTotal + deliveryTotal + offlineTotal;
                          return `${grandTotal.toLocaleString()}원`;
                        })()}
                      </p>
                    </div>
                    {formData.hasDelivery && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">
                          배달 앱 매출
                          {(() => {
                            const deliveryTotal = calculateDeliveryTotal(
                              revenueData,
                              formData
                            );
                            const onlineTotal = calculateOnlineStoreTotal(
                              revenueData,
                              formData
                            );
                            const offlineTotal =
                              calculateOfflineTotal(revenueData);
                            const grandTotal =
                              onlineTotal + deliveryTotal + offlineTotal;
                            const percentage = (
                              (deliveryTotal / grandTotal) *
                              100
                            ).toFixed(1);
                            return ` (${percentage}%)`;
                          })()}
                        </p>
                        <p className="text-lg font-medium">
                          {(() => {
                            const total = calculateDeliveryTotal(
                              revenueData,
                              formData
                            );
                            return `${total.toLocaleString()}원`;
                          })()}
                        </p>
                      </div>
                    )}
                    {formData.hasOnlineSales && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">
                          온라인 스토어 매출
                          {(() => {
                            const onlineTotal = calculateOnlineStoreTotal(
                              revenueData,
                              formData
                            );
                            const deliveryTotal = calculateDeliveryTotal(
                              revenueData,
                              formData
                            );
                            const offlineTotal =
                              calculateOfflineTotal(revenueData);
                            const grandTotal =
                              onlineTotal + deliveryTotal + offlineTotal;
                            const percentage = (
                              (onlineTotal / grandTotal) *
                              100
                            ).toFixed(1);
                            return ` (${percentage}%)`;
                          })()}
                        </p>
                        <p className="text-lg font-medium">
                          {onlineTotal.toLocaleString()}원
                        </p>
                      </div>
                    )}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500">
                        오프라인 매출
                        {(() => {
                          const offlineTotal =
                            calculateOfflineTotal(revenueData);
                          const onlineTotal = calculateOnlineStoreTotal(
                            revenueData,
                            formData
                          );
                          const deliveryTotal = calculateDeliveryTotal(
                            revenueData,
                            formData
                          );
                          const grandTotal =
                            onlineTotal + deliveryTotal + offlineTotal;
                          const percentage = (
                            (offlineTotal / grandTotal) *
                            100
                          ).toFixed(1);
                          return ` (${percentage}%)`;
                        })()}
                      </p>
                      <p className="text-lg font-medium">
                        {(() => {
                          const total = calculateOfflineTotal(revenueData);
                          return `${total.toLocaleString()}원`;
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* 상세 정보 */}
                  <div className="space-y-4">
                    <h4 className="font-medium">상세 정보</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* 온라인 스토어 상세 */}
                      {formData.hasOnlineSales && revenueData.online_stores && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-medium mb-2">
                            온라인 스토어 상세
                          </h5>
                          <div className="space-y-4">
                            {Object.entries(revenueData.online_stores).map(
                              ([platform, data]) => (
                                <div key={platform} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">
                                      {platform === "smartstore"
                                        ? "스마트스토어"
                                        : platform === "coupang"
                                        ? "쿠팡"
                                        : "G마켓"}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      수수료율: {data[0]?.platform_fee_rate}%
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div>
                                      <p className="text-gray-500">매출</p>
                                      <p>
                                        {data
                                          .reduce(
                                            (total, day) =>
                                              total + (day.sales_amount || 0),
                                            0
                                          )
                                          .toLocaleString()}
                                        원
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">수수료</p>
                                      <p>
                                        {data
                                          .reduce(
                                            (total, day) =>
                                              total + (day.platform_fee || 0),
                                            0
                                          )
                                          .toLocaleString()}
                                        원
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-gray-500">정산금액</p>
                                      <p>
                                        {data
                                          .reduce(
                                            (total, day) =>
                                              total +
                                              (day.settlement_amount || 0),
                                            0
                                          )
                                          .toLocaleString()}
                                        원
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* 배달 앱 상세 */}
                      {formData.hasDelivery && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h5 className="font-medium mb-2">배달 앱 상세</h5>
                          <div className="space-y-4">
                            {["baemin", "coupangeats", "yogiyo"].map(
                              (service) => {
                                const serviceData = revenueData[service];
                                if (!serviceData?.daily_sales_data) return null;

                                const totalSales =
                                  serviceData.daily_sales_data.reduce(
                                    (total, day) => {
                                      return (
                                        total + (day.total_sales_amount || 0)
                                      );
                                    },
                                    0
                                  );

                                const totalDeliverySales = [
                                  "baemin",
                                  "coupangeats",
                                  "yogiyo",
                                ].reduce((total, s) => {
                                  if (revenueData[s]?.daily_sales_data) {
                                    return (
                                      total +
                                      revenueData[s].daily_sales_data.reduce(
                                        (sum, day) =>
                                          sum + (day.total_sales_amount || 0),
                                        0
                                      )
                                    );
                                  }
                                  return total;
                                }, 0);

                                const percentage = (
                                  (totalSales / totalDeliverySales) *
                                  100
                                ).toFixed(1);

                                return (
                                  <div key={service} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-medium">
                                        {service === "baemin"
                                          ? "배민"
                                          : service === "coupangeats"
                                          ? "쿠팡이츠"
                                          : "요기요"}{" "}
                                        ({percentage}%)
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                      <div>
                                        <p className="text-gray-500">매출</p>
                                        <p>{totalSales.toLocaleString()}원</p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">수수료</p>
                                        <p className="text-red-500">
                                          {serviceData.daily_sales_data
                                            .reduce(
                                              (total, day) =>
                                                total + (day.total_fee || 0),
                                              0
                                            )
                                            .toLocaleString()}
                                          원
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-gray-500">
                                          정산금액
                                        </p>
                                        <p className="text-blue-500">
                                          {serviceData.daily_sales_data
                                            .reduce(
                                              (total, day) =>
                                                total +
                                                (day.settlement_amount || 0),
                                              0
                                            )
                                            .toLocaleString()}
                                          원
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}

                      {/* 오프라인 상세 */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h5 className="font-medium mb-2">오프라인 상세</h5>
                        <div className="space-y-4">
                          {/* 카드 매출 */}
                          {revenueData.card_sales_data?.daily_sales_data && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">
                                  카드 매출
                                  {(() => {
                                    const cardTotal =
                                      revenueData.card_sales_data.daily_sales_data.reduce(
                                        (total, day) => {
                                          if (!day.approval_details)
                                            return total;
                                          return (
                                            total +
                                            day.approval_details.reduce(
                                              (dayTotal, approval) =>
                                                dayTotal +
                                                (approval.total_amount || 0),
                                              0
                                            )
                                          );
                                        },
                                        0
                                      );
                                    const offlineTotal =
                                      calculateOfflineTotal(revenueData);
                                    const percentage = (
                                      (cardTotal / offlineTotal) *
                                      100
                                    ).toFixed(1);
                                    return ` (${percentage}%)`;
                                  })()}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <p className="text-gray-500">매출</p>
                                  <p>
                                    {revenueData.card_sales_data.daily_sales_data
                                      .reduce((total, day) => {
                                        if (!day.approval_details) return total;
                                        return (
                                          total +
                                          day.approval_details.reduce(
                                            (dayTotal, approval) => {
                                              return (
                                                dayTotal +
                                                (approval.total_amount || 0)
                                              );
                                            },
                                            0
                                          )
                                        );
                                      }, 0)
                                      .toLocaleString()}
                                    원
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">수수료</p>
                                  <p className="text-red-500">
                                    {revenueData.card_sales_data.daily_sales_data
                                      .reduce((total, day) => {
                                        return (
                                          total +
                                          (day.acquisition_details?.total_fee ||
                                            0)
                                        );
                                      }, 0)
                                      .toLocaleString()}
                                    원
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">정산금액</p>
                                  <p className="text-blue-500">
                                    {revenueData.card_sales_data.daily_sales_data
                                      .reduce((total, day) => {
                                        return (
                                          total +
                                          (day.acquisition_details
                                            ?.net_amount || 0)
                                        );
                                      }, 0)
                                      .toLocaleString()}
                                    원
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 현금영수증 */}
                          {revenueData.hometax_cash_receipts && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">
                                  현금영수증
                                  {(() => {
                                    const cashTotal =
                                      revenueData.hometax_cash_receipts.reduce(
                                        (sum, day) =>
                                          sum + (day.total_cash_amount || 0),
                                        0
                                      );
                                    const offlineTotal =
                                      calculateOfflineTotal(revenueData);
                                    const percentage = (
                                      (cashTotal / offlineTotal) *
                                      100
                                    ).toFixed(1);
                                    return ` (${percentage}%)`;
                                  })()}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <p className="text-gray-500">매출</p>
                                  <p>
                                    {revenueData.hometax_cash_receipts
                                      .reduce(
                                        (sum, day) =>
                                          sum + (day.total_cash_amount || 0),
                                        0
                                      )
                                      .toLocaleString()}
                                    원
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">발행건수</p>
                                  <p>
                                    {revenueData.hometax_cash_receipts
                                      .reduce(
                                        (sum, day) =>
                                          sum + (day.issued_count || 0),
                                        0
                                      )
                                      .toLocaleString()}
                                    건
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">미발행건수</p>
                                  <p>
                                    {revenueData.hometax_cash_receipts
                                      .reduce(
                                        (sum, day) =>
                                          sum + (day.non_issued_count || 0),
                                        0
                                      )
                                      .toLocaleString()}
                                    건
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 세금계산서 */}
                          {revenueData.tax_invoices && (
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">
                                  세금계산서
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-sm">
                                <div>
                                  <p className="text-gray-500">매출</p>
                                  <p>
                                    {revenueData.tax_invoices.total_issued_amount.toLocaleString()}
                                    원
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              데이터를 수집하고 분석합니다.
            </p>
            <Button
              onClick={handleStep3}
              disabled={
                !steps.step2.completed ||
                steps.step3.status === "completed" ||
                isLoading
              }
              className="w-full"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  수집 중...
                </span>
              ) : (
                "수집 및 분석"
              )}
            </Button>
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}
            {collectionData && collectionData.data?.monthly_sales && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">월별 매출 추이</h3>
                <MonthlySalesChart
                  monthlySales={collectionData.data.monthly_sales}
                />
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
              <div className="flex items-center gap-2 mb-6">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">비교 그룹 생성</h3>
              </div>

              {/* 비교 그룹 */}
              <div className="flex items-center gap-2 mb-6">
                <Users className="h-5 w-5 text-primary" />
                <label className="text-sm font-medium">비교그룹</label>
              </div>

              {/* 기본 정보 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-6">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        지역
                      </div>
                      <div className="text-base font-semibold">
                        서울{" "}
                        {users.find((u) => u.business_number === selectedUser)
                          ?.zone_nm || "정보 없음"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        업종
                      </div>
                      <div className="text-base font-semibold">
                        {users.find((u) => u.business_number === selectedUser)
                          ?.smb_sector || "정보 없음"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 지역내 매출등급 */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  <label className="text-sm font-medium">
                    {users.find((u) => u.business_number === selectedUser)
                      ?.merchant_name || "선택된 사업장"}
                    의 비교군 매출 등급 설정
                  </label>
                </div>

                {/* 매출 등급 선택 */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">
                    매출 등급
                  </div>
                  <Select
                    value={formData.revenueRange}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        revenueRange: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="매출 등급을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1등급 (상위 10%)</SelectItem>
                      <SelectItem value="2">2등급 (상위 20%)</SelectItem>
                      <SelectItem value="3">3등급 (상위 30%)</SelectItem>
                      <SelectItem value="4">4등급 (상위 40%)</SelectItem>
                      <SelectItem value="5">5등급 (평균)</SelectItem>
                      <SelectItem value="6">6등급 (전체 60% 내)</SelectItem>
                      <SelectItem value="7">7등급 (전체 70% 내)</SelectItem>
                      <SelectItem value="8">8등급 (하위 30% 이하)</SelectItem>
                      <SelectItem value="9">9등급 (하위 20% 이하)</SelectItem>
                      <SelectItem value="10">10등급 (하위 10% 이하)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 지난달 매출 금액 표시 */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">
                        {(() => {
                          const today = new Date();
                          const previousMonth = new Date(
                            today.getFullYear(),
                            today.getMonth() - 1,
                            1
                          );
                          return `${String(previousMonth.getFullYear()).slice(
                            -2
                          )}.${String(previousMonth.getMonth() + 1).padStart(
                            2,
                            "0"
                          )}월 매출금액`;
                        })()}
                      </span>
                    </div>
                    <span className="text-lg font-semibold">
                      {(() => {
                        const today = new Date();
                        const previousMonth = new Date(
                          today.getFullYear(),
                          today.getMonth() - 1,
                          1
                        );
                        const previousMonthStr = `${previousMonth.getFullYear()}-${String(
                          previousMonth.getMonth() + 1
                        ).padStart(2, "0")}`;
                        const previousMonthData =
                          collectionData?.data?.monthly_sales?.find(
                            (data) =>
                              `${data.year}-${String(data.month).padStart(
                                2,
                                "0"
                              )}` === previousMonthStr
                          );
                        return (
                          (
                            previousMonthData?.revenue || 500000
                          ).toLocaleString() + "원"
                        );
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleStep4}
                disabled={
                  !steps.step3.completed ||
                  steps.step4.status === "completed" ||
                  isLoading ||
                  !formData.revenueRange ||
                  formData.revenueRange === "none"
                }
                className="w-full mt-6"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    생성 중...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    비교 그룹 생성
                  </span>
                )}
              </Button>
            </div>

            {/* Step 4 content - Add this after the comparison group generation button */}
            {comparisonResult && (
              <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-4">비교군 생성 결과</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">매출 등급</p>
                      <p className="text-base font-medium">
                        {comparisonResult.monthInfo.percentileRank}등급
                        {comparisonResult.monthInfo.percentileRank === "1" &&
                          " (상위 10%)"}
                        {comparisonResult.monthInfo.percentileRank === "2" &&
                          " (상위 20%)"}
                        {comparisonResult.monthInfo.percentileRank === "3" &&
                          " (상위 30%)"}
                        {comparisonResult.monthInfo.percentileRank === "4" &&
                          " (상위 40%)"}
                        {comparisonResult.monthInfo.percentileRank === "5" &&
                          " (평균)"}
                        {comparisonResult.monthInfo.percentileRank === "6" &&
                          " (전체 60% 내)"}
                        {comparisonResult.monthInfo.percentileRank === "7" &&
                          " (전체 70% 내)"}
                        {comparisonResult.monthInfo.percentileRank === "8" &&
                          " (하위 30% 이하)"}
                        {comparisonResult.monthInfo.percentileRank === "9" &&
                          " (하위 20% 이하)"}
                        {comparisonResult.monthInfo.percentileRank === "10" &&
                          " (하위 10% 이하)"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">기준 매출</p>
                      <p className="text-base font-medium">
                        {comparisonResult.monthAmt.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">매출 분포</p>
                    <div className="space-y-2">
                      {Object.entries(comparisonResult.monthInfo)
                        .filter(
                          ([key]) =>
                            key.startsWith("top") && key !== "percentileRank"
                        )
                        .map(([key, value]) => {
                          const grade =
                            key === "topOthAvg"
                              ? "10"
                              : key === "top10Avg"
                              ? "1"
                              : key === "top20Avg"
                              ? "2"
                              : key === "top30Avg"
                              ? "3"
                              : key === "top40Avg"
                              ? "4"
                              : key === "top50Avg"
                              ? "5"
                              : key === "top60Avg"
                              ? "6"
                              : key === "top70Avg"
                              ? "7"
                              : key === "top80Avg"
                              ? "8"
                              : "9";

                          const isSelectedGrade =
                            grade === formData.revenueRange;

                          return (
                            <div
                              key={key}
                              className={`flex justify-between items-center p-2 rounded-lg ${
                                isSelectedGrade
                                  ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800"
                                  : ""
                              }`}
                            >
                              <span
                                className={`text-sm ${
                                  isSelectedGrade ? "font-bold" : ""
                                }`}
                              >
                                {key === "topOthAvg"
                                  ? "10등급 (하위 10% 이하)"
                                  : key === "top10Avg"
                                  ? "1등급 (상위 10%)"
                                  : key === "top20Avg"
                                  ? "2등급 (상위 20%)"
                                  : key === "top30Avg"
                                  ? "3등급 (상위 30%)"
                                  : key === "top40Avg"
                                  ? "4등급 (상위 40%)"
                                  : key === "top50Avg"
                                  ? "5등급 (평균)"
                                  : key === "top60Avg"
                                  ? "6등급 (전체 60% 내)"
                                  : key === "top70Avg"
                                  ? "7등급 (전체 70% 내)"
                                  : key === "top80Avg"
                                  ? "8등급 (하위 30% 이하)"
                                  : "9등급 (하위 20% 이하)"}
                              </span>
                              <span
                                className={`text-sm font-medium ${
                                  isSelectedGrade
                                    ? "text-green-600 dark:text-green-400 font-bold"
                                    : ""
                                }`}
                              >
                                {value.toLocaleString()}원
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 5:
        return (
          <div className="flex flex-col items-center justify-center min-h-[300px] space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4">
                {getSelectedUserName()} 데이터 생성 완료
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                모든 데이터 생성 및 분석이 완료되었습니다.
              </p>
            </div>
            <Button
              onClick={() => {
                // 모든 상태 초기화
                setSelectedUser("");
                setCurrentStep(0);
                setSteps({
                  step1: { status: "ready", completed: false },
                  step2: { status: "ready", completed: false },
                  step3: { status: "ready", completed: false },
                  step4: { status: "ready", completed: false },
                });
                setFormData({
                  businessDays: ["mon", "tue", "wed", "thu", "fri"],
                  isWeekendOpen: false,
                  weekdayOpenTime: "10:00",
                  weekdayCloseTime: "22:00",
                  weekendOpenTime: "10:00",
                  weekendCloseTime: "22:00",
                  hasDelivery: false,
                  deliveryRatio: "30",
                  baeminRatio: "55",
                  coupangEatsRatio: "40",
                  yogiyoRatio: "5",
                  hasOnlineSales: false,
                  onlineSalesRatio: "20",
                  smartStoreRatio: "35",
                  coupangRatio: "50",
                  gmarketRatio: "15",
                  trend: "stable",
                  trendRate: "5",
                  seasonalDeviation: "10",
                  seasonality: "neutral",
                  locationType: "residential",
                  startDate: "",
                  endDate: "",
                  zoneRange: "same",
                  sectorRange: "same",
                  revenueRange: "none",
                });
                setGenerationResult(null);
                setRevenueData(null);
                setComparisonResult(null);
                setCollectionData(null);
              }}
              className="w-full max-w-xs flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              새로운 데이터 생성
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const handlePresetClick = () => {
    const businessDays = ["mon", "tue", "wed", "thu", "fri", "sat"];
    const weekdayAvgSales = 400000;
    const weekendAvgSales = 500000;

    // 2024년 1월 1일부터 어제까지의 날짜 설정
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1); // 어제
    const startDate = new Date("2024-01-01"); // 2024년 1월 1일

    setFormData({
      ...formData,
      businessDays,
      weekdayAvgSales: weekdayAvgSales.toString(),
      weekendAvgSales: weekendAvgSales.toString(),
      startDate: startDate.toISOString().split("T")[0],
      endDate: yesterday.toISOString().split("T")[0],
      hasDelivery: true,
      deliveryRatio: 30,
      baeminRatio: 50,
      coupangEatsRatio: 30,
      yogiyoRatio: 20,
      hasOnlineStore: false,
    });

    // 데이터 생성 버튼으로 스크롤
    setTimeout(scrollToGenerateButton, 100);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Business Selection Section */}
          <div className="mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-medium whitespace-nowrap">
                  사업장 선택
                </h3>
                <div className="flex-1">
                  <Select
                    value={selectedUser}
                    onValueChange={(value) => {
                      console.log("Select onChange:", value);
                      handleUserSelect(value);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="사업장을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {users &&
                        users.map((user) => (
                          <SelectItem
                            key={user.bid}
                            value={user.business_number}
                          >
                            {user.merchant_name} ({user.business_number})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedUser && currentStep > 0 && (
                  <Button variant="outline" size="sm" onClick={resetProcess}>
                    초기화
                  </Button>
                )}
              </div>

              {selectedUser && (
                <div className="pt-4">
                  <div className="flex items-center space-x-4 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {
                          users.find((u) => u.business_number === selectedUser)
                            ?.merchant_name
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        {
                          users.find((u) => u.business_number === selectedUser)
                            ?.merchant_address
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        {
                          users.find((u) => u.business_number === selectedUser)
                            ?.business_number_dash
                        }
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <span className="text-sm">
                        {
                          users.find((u) => u.business_number === selectedUser)
                            ?.smb_sector
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Creation Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
            {/* Step Progress Indicator */}
            <div className="mb-8">
              <div className="relative flex items-center justify-between">
                {stepLabels.map((step, index) => (
                  <div
                    key={step.id}
                    className="flex flex-col items-center relative z-10"
                  >
                    <button
                      onClick={() => selectedUser && handleStepClick(step.id)}
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                        !selectedUser
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : currentStep === step.id
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : currentStep > step.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-gray-200 text-gray-400"
                      )}
                      disabled={!selectedUser || step.id > currentStep}
                    >
                      {selectedUser && currentStep > step.id ? (
                        <CheckIcon className="h-5 w-5" />
                      ) : (
                        <span>{step.id}</span>
                      )}
                    </button>
                    <span
                      className={cn(
                        "mt-3 text-sm font-medium",
                        !selectedUser
                          ? "text-gray-400"
                          : currentStep === step.id
                          ? "text-primary"
                          : currentStep > step.id
                          ? "text-gray-700"
                          : "text-gray-400"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            {!selectedUser ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 mb-6 min-h-[200px] flex items-center justify-center">
                <p className="text-gray-500 text-center">
                  사업장을 선택하여 프로세스를 시작하세요
                </p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 mb-6 min-h-[200px]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold">
                    {stepLabels[currentStep - 1]?.label}
                  </h2>
                  {selectedUser && currentStep === 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePresetClick}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      사업장 프리셋
                    </Button>
                  )}
                </div>
                {currentStep !== 5 && (
                  <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                    {getSelectedUserName()}님의 {currentStep}단계 진행 중입니다
                  </p>
                )}
                {renderStepContent()}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              {currentStep !== 5 && (
                <Button
                  variant="outline"
                  onClick={() =>
                    setCurrentStep((prev) => Math.max(1, prev - 1))
                  }
                  disabled={!selectedUser || currentStep <= 1}
                >
                  이전
                </Button>
              )}
              {currentStep === 5 ? null : (
                <Button
                  onClick={() => {
                    // 현재 스텝에 따라 다른 동작 수행
                    switch (currentStep) {
                      case 1:
                        if (generationResult?.status === "success") {
                          setSteps((prev) => ({
                            ...prev,
                            step1: { status: "completed", completed: true },
                            step2: { status: "ready", completed: false },
                          }));
                          setCurrentStep(2);
                        }
                        break;
                      case 2:
                        if (revenueData) {
                          setSteps((prev) => ({
                            ...prev,
                            step2: { status: "completed", completed: true },
                            step3: { status: "ready", completed: false },
                          }));
                          setCurrentStep(3);
                        }
                        break;
                      case 3:
                        setSteps((prev) => ({
                          ...prev,
                          step3: { status: "completed", completed: true },
                          step4: { status: "ready", completed: false },
                        }));
                        setCurrentStep(4);
                        break;
                      case 4:
                        if (steps.step4.completed) {
                          setCurrentStep(5);
                        }
                        break;
                      default:
                        setCurrentStep((prev) => Math.min(4, prev + 1));
                    }
                  }}
                  disabled={
                    !selectedUser ||
                    (currentStep === 1 &&
                      (!generationResult ||
                        generationResult.status !== "success")) ||
                    (currentStep === 2 && !revenueData) ||
                    (currentStep === 3 && !steps.step3.completed) ||
                    (currentStep === 4 && !steps.step4.completed)
                  }
                >
                  {currentStep === 4 && steps.step4.completed ? "완료" : "다음"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
