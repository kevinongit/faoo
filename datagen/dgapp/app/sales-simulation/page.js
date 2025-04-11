"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import PageLayout from "../PageLayout";
import useSalesSimulationStore from "../store/salesSimulationStore";
import DeliveryRatioSlider from "../components/DeliveryRatioSlider";
import OnlineSalesRatioSlider from "../components/OnlineSalesRatioSlider";

async function fetchUsers() {
  try {
    const usersRes = await fetch("http://localhost:3400/users");
    const users = await usersRes.json();
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export default function SalesSimulationPage() {
  const router = useRouter();
  const {
    formData,
    isLoading,
    error,
    setFormData,
    generateData,
    resetForm,
    setDateRange,
  } = useSalesSimulationStore();

  const [validationErrors, setValidationErrors] = useState({});
  const [maxEndDate, setMaxEndDate] = useState("");
  const [businessNumbers, setBusinessNumbers] = useState([]);
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    // 어제 날짜를 최대 종료일로 설정
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    setMaxEndDate(yesterday.toISOString().split("T")[0]);

    // 사업자 번호 목록 가져오기
    fetchUsers().then((users) => {
      console.log("Fetched users:", users);
      setBusinessNumbers(users);
    });

    // 초기 폼 데이터 설정
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
      onlineSalesRatio: "0",
      smartStoreRatio: "40",
      elevenStreetRatio: "30",
      gmarketRatio: "30",
      trend: "stable",
      trendRate: "5",
      trendDeviation: "10",
      seasonality: "low",
      locationType: "residential",
    });
  }, [setFormData]);

  const validateForm = () => {
    const errors = {};

    // 사업자번호 검증 (10자리 숫자)
    if (!/^\d{10}$/.test(formData.businessNumber)) {
      errors.businessNumber = "사업자번호는 10자리 숫자여야 합니다";
    }

    // 매출 금액 검증
    if (isNaN(formData.weekdayAvgSales) || formData.weekdayAvgSales <= 0) {
      errors.weekdayAvgSales = "평일 평균 매출은 0보다 큰 숫자여야 합니다";
    }

    // 주말 평균 매출 검증 (주말이 선택된 경우에만)
    if (formData.isWeekendOpen) {
      if (isNaN(formData.weekendAvgSales) || formData.weekendAvgSales <= 0) {
        errors.weekendAvgSales = "주말 평균 매출은 0보다 큰 숫자여야 합니다";
      }
    }

    // 배달 비율 검증 (0-100)
    if (
      isNaN(formData.deliveryRatio) ||
      formData.deliveryRatio < 0 ||
      formData.deliveryRatio > 100
    ) {
      errors.deliveryRatio = "배달 비율은 0에서 100 사이여야 합니다";
    }

    // 배달 플랫폼 비율 검증
    if (formData.deliveryRatio > 0) {
      const coupangEats = Number(formData.coupangEatsRatio) || 0;
      const baemin = Number(formData.baeminRatio) || 0;
      const yogiyo = Number(formData.yogiyoRatio) || 0;
      const total = coupangEats + baemin + yogiyo;
    }

    // 날짜 검증
    if (!formData.startDate) {
      errors.startDate = "시작일을 선택해주세요";
    }
    if (!formData.endDate) {
      errors.endDate = "종료일을 선택해주세요";
    }
    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      errors.endDate = "종료일은 시작일보다 이후여야 합니다";
    }

    // 온라인 판매 비율 검증
    if (formData.hasOnlineSales) {
      const onlineSalesRatio = parseFloat(formData.onlineSalesRatio);
      if (
        isNaN(onlineSalesRatio) ||
        onlineSalesRatio < 0 ||
        onlineSalesRatio > 100
      ) {
        errors.onlineSalesRatio =
          "온라인 판매 비율은 0에서 100 사이여야 합니다.";
      }

      const smartStoreRatio = parseFloat(formData.smartStoreRatio);
      const elevenStreetRatio = parseFloat(formData.elevenStreetRatio);
      const gmarketRatio = parseFloat(formData.gmarketRatio);

      if (smartStoreRatio + elevenStreetRatio + gmarketRatio !== 100) {
        errors.platformRatios =
          "온라인 판매 플랫폼 비율의 합이 100%가 되어야 합니다.";
      }
    }

    setValidationErrors(errors);
    console.log("validateForm", errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    console.log("handlesubmit");

    // 입력값 콘솔 출력
    console.log("Form Data:", {
      ...formData,
      businessDays: formData.businessDays || [],
      isWeekendOpen: formData.isWeekendOpen || false,
    });

    try {
      await generateData();
      router.push("/success");
    } catch (error) {
      console.error("Error generating data:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });

    // 사업자 번호가 변경되면 해당 사업자의 종목을 자동으로 채움
    if (name === "businessNumber" && value) {
      const selectedBusiness = businessNumbers.find(
        (business) => business.business_number === value
      );
      if (selectedBusiness) {
        setFormData({
          ...formData,
          businessNumber: value,
          businessType: selectedBusiness.smb_sector,
        });
      }
    }

    // 입력 시 해당 필드의 에러 메시지 제거
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">
          소상공인 매출 데이터 시뮬레이션
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 */}
          <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <h3 className="text-base font-semibold text-gray-800 mb-6">
              기본 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  사업자번호
                </label>
                <select
                  name="businessNumber"
                  value={formData.businessNumber}
                  onChange={handleChange}
                  className={`w-full p-2.5 border rounded-lg ${
                    validationErrors.businessNumber
                      ? "border-red-500"
                      : "border-gray-200"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  required
                >
                  <option value="">사업자 번호 선택</option>
                  {businessNumbers.map((user) => (
                    <option
                      key={user.business_number}
                      value={user.business_number}
                    >
                      {`${user.merchant_name} (${user.name}, ${user.business_number_dash}, ${user.smb_sector})`}
                    </option>
                  ))}
                </select>
                {validationErrors.businessNumber && (
                  <p className="text-red-500 text-sm mt-1.5">
                    {validationErrors.businessNumber}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  종목
                </label>
                <input
                  type="text"
                  name="businessType"
                  value={formData.businessType}
                  readOnly
                  className="w-full p-2.5 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
            </div>

            {/* 영업일 선택 */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        businessDays: isAllSelected ? [] : allDays,
                        isWeekendOpen: !isAllSelected,
                      });
                    }}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      (formData.businessDays || []).length === 7
                        ? "text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    [전체]
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const weekdays = ["mon", "tue", "wed", "thu", "fri"];
                      const currentDays = formData.businessDays || [];
                      const isWeekdaysSelected = weekdays.every((day) =>
                        currentDays.includes(day)
                      );

                      setFormData({
                        businessDays: isWeekdaysSelected ? [] : weekdays,
                        isWeekendOpen: false,
                      });
                    }}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      (formData.businessDays || []).length === 5 &&
                      !formData.isWeekendOpen
                        ? "text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
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
                          businessDays: newDays,
                          isWeekendOpen:
                            newDays.includes("sat") || newDays.includes("sun"),
                        });
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        (formData.businessDays || []).includes(day.id)
                          ? day.id === "sat"
                            ? "bg-blue-200 text-blue-700"
                            : day.id === "sun"
                            ? "bg-red-200 text-red-700"
                            : "bg-gray-200 text-gray-700"
                          : "bg-white text-gray-400 hover:bg-gray-50"
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
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  주중 영업시간
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    name="weekdayOpenTime"
                    value={formData.weekdayOpenTime}
                    onChange={handleChange}
                    className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      (formData.businessDays || []).some((day) =>
                        ["mon", "tue", "wed", "thu", "fri"].includes(day)
                      )
                        ? "border-gray-200"
                        : "border-gray-200 bg-gray-50"
                    }`}
                    disabled={
                      !(formData.businessDays || []).some((day) =>
                        ["mon", "tue", "wed", "thu", "fri"].includes(day)
                      )
                    }
                    required={(formData.businessDays || []).some((day) =>
                      ["mon", "tue", "wed", "thu", "fri"].includes(day)
                    )}
                  />
                  <span className="text-gray-500">~</span>
                  <input
                    type="time"
                    name="weekdayCloseTime"
                    value={formData.weekdayCloseTime}
                    onChange={handleChange}
                    className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      (formData.businessDays || []).some((day) =>
                        ["mon", "tue", "wed", "thu", "fri"].includes(day)
                      )
                        ? "border-gray-200"
                        : "border-gray-200 bg-gray-50"
                    }`}
                    disabled={
                      !(formData.businessDays || []).some((day) =>
                        ["mon", "tue", "wed", "thu", "fri"].includes(day)
                      )
                    }
                    required={(formData.businessDays || []).some((day) =>
                      ["mon", "tue", "wed", "thu", "fri"].includes(day)
                    )}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  주말 영업시간
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    name="weekendOpenTime"
                    value={formData.weekendOpenTime}
                    onChange={handleChange}
                    className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      (formData.businessDays || []).some((day) =>
                        ["sat", "sun"].includes(day)
                      )
                        ? "border-gray-200"
                        : "border-gray-200 bg-gray-50"
                    }`}
                    disabled={
                      !(formData.businessDays || []).some((day) =>
                        ["sat", "sun"].includes(day)
                      )
                    }
                    required={(formData.businessDays || []).some((day) =>
                      ["sat", "sun"].includes(day)
                    )}
                  />
                  <span className="text-gray-500">~</span>
                  <input
                    type="time"
                    name="weekendCloseTime"
                    value={formData.weekendCloseTime}
                    onChange={handleChange}
                    className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      (formData.businessDays || []).some((day) =>
                        ["sat", "sun"].includes(day)
                      )
                        ? "border-gray-200"
                        : "border-gray-200 bg-gray-50"
                    }`}
                    disabled={
                      !(formData.businessDays || []).some((day) =>
                        ["sat", "sun"].includes(day)
                      )
                    }
                    required={(formData.businessDays || []).some((day) =>
                      ["sat", "sun"].includes(day)
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 매출 정보 */}
          <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <h3 className="text-base font-semibold text-gray-800 mb-6">
              매출 정보
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  평일 평균 매출
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
                          weekdayAvgSales: (currentValue + 500000).toString(),
                        });
                      }}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
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
                          weekdayAvgSales: (currentValue + 100000).toString(),
                        });
                      }}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
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
                          weekdayAvgSales: (currentValue + 10000).toString(),
                        });
                      }}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
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
                      }}
                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      클리어
                    </button>
                  </div>
                  <input
                    type="text"
                    name="weekdayAvgSales"
                    value={
                      formData.weekdayAvgSales
                        ? parseInt(formData.weekdayAvgSales).toLocaleString()
                        : ""
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (!isNaN(value) || value === "") {
                        setFormData({
                          ...formData,
                          weekdayAvgSales: value,
                        });
                      }
                    }}
                    className={`w-full p-2.5 border rounded-lg ${
                      validationErrors.weekdayAvgSales
                        ? "border-red-500"
                        : "border-gray-200"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="예: 500,000"
                    required
                  />
                  {validationErrors.weekdayAvgSales && (
                    <p className="text-red-500 text-sm mt-1.5">
                      {validationErrors.weekdayAvgSales}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  주말 평균 매출
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
                          weekendAvgSales: (currentValue + 500000).toString(),
                        });
                      }}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
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
                          weekendAvgSales: (currentValue + 100000).toString(),
                        });
                      }}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
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
                          weekendAvgSales: (currentValue + 10000).toString(),
                        });
                      }}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
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
                      }}
                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      클리어
                    </button>
                  </div>
                  <input
                    type="text"
                    name="weekendAvgSales"
                    value={
                      formData.weekendAvgSales
                        ? parseInt(formData.weekendAvgSales).toLocaleString()
                        : ""
                    }
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, "");
                      if (!isNaN(value) || value === "") {
                        setFormData({
                          ...formData,
                          weekendAvgSales: value,
                        });
                      }
                    }}
                    className={`w-full p-2.5 border rounded-lg ${
                      validationErrors.weekendAvgSales
                        ? "border-red-500"
                        : "border-gray-200"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      !formData.isWeekendOpen ? "bg-gray-50" : ""
                    }`}
                    placeholder="예: 800,000"
                    disabled={!formData.isWeekendOpen}
                    required={formData.isWeekendOpen}
                  />
                  {validationErrors.weekendAvgSales && (
                    <p className="text-red-500 text-sm mt-1.5">
                      {validationErrors.weekendAvgSales}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 배달 및 온라인 판매 정보 */}
          <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <h3 className="text-base font-semibold text-gray-800 mb-6">
              배달 및 온라인 판매 정보
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
                          : 0,
                      });
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="hasDelivery"
                    className="text-sm font-medium text-gray-700"
                  >
                    배달 서비스 제공
                  </label>
                </div>

                {formData.hasDelivery && (
                  <div className="ml-8 space-y-4 border-l-2 border-gray-100 pl-6">
                    <div className="flex items-center gap-4">
                      <label className="w-24 text-sm font-medium text-gray-700">
                        배달 비율
                      </label>
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="number"
                          name="deliveryRatio"
                          value={formData.deliveryRatio}
                          onChange={handleChange}
                          className={`w-24 px-3 py-2 border rounded-md ${
                            validationErrors.deliveryRatio
                              ? "border-red-500"
                              : "border-gray-300"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="0-100"
                          min="0"
                          max="100"
                          required
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>

                    {formData.deliveryRatio > 0 && (
                      <div className="flex flex-col items-center">
                        <div className="w-full max-w-md">
                          <DeliveryRatioSlider
                            value={{
                              coupangEatsRatio: formData.coupangEatsRatio,
                              baeminRatio: formData.baeminRatio,
                              yogiyoRatio: formData.yogiyoRatio,
                            }}
                            onChange={(ratios) => {
                              console.log(ratios);
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

              {/* 온라인 판매 정보 */}
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
                          : "",
                      });
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="hasOnlineSales"
                    className="text-sm font-medium text-gray-700"
                  >
                    온라인 판매 제공
                  </label>
                </div>

                {formData.hasOnlineSales && (
                  <div className="ml-8 space-y-4 border-l-2 border-gray-100 pl-6">
                    <div className="flex items-center gap-4">
                      <label className="w-24 text-sm font-medium text-gray-700">
                        온라인 판매 비율
                      </label>
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="number"
                          name="onlineSalesRatio"
                          value={formData.onlineSalesRatio}
                          onChange={handleChange}
                          className={`w-24 px-3 py-2 border rounded-md ${
                            validationErrors.onlineSalesRatio
                              ? "border-red-500"
                              : "border-gray-300"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="0-100"
                          min="0"
                          max="100"
                          required
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        온라인 판매 플랫폼 비율
                      </label>
                      <OnlineSalesRatioSlider
                        smartStoreRatio={formData.smartStoreRatio}
                        elevenStreetRatio={formData.elevenStreetRatio}
                        gmarketRatio={formData.gmarketRatio}
                        onChange={(smartStore, elevenStreet, gmarket) => {
                          setFormData({
                            ...formData,
                            smartStoreRatio: smartStore.toString(),
                            elevenStreetRatio: elevenStreet.toString(),
                            gmarketRatio: gmarket.toString(),
                          });
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 기간 정보 */}
          <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-gray-800">
                기간 설정
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDateRange("1month")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.endDate &&
                    formData.startDate &&
                    new Date(formData.endDate).getTime() -
                      new Date(formData.startDate).getTime() ===
                      30 * 24 * 60 * 60 * 1000
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  1개월
                </button>
                <button
                  type="button"
                  onClick={() => setDateRange("6months")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.endDate &&
                    formData.startDate &&
                    new Date(formData.endDate).getTime() -
                      new Date(formData.startDate).getTime() ===
                      180 * 24 * 60 * 60 * 1000
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  6개월
                </button>
                <button
                  type="button"
                  onClick={() => setDateRange("1year")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.endDate &&
                    formData.startDate &&
                    new Date(formData.endDate).getTime() -
                      new Date(formData.startDate).getTime() ===
                      365 * 24 * 60 * 60 * 1000
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  1년
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  시작일
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`w-full p-2.5 border rounded-lg ${
                      validationErrors.startDate
                        ? "border-red-500"
                        : "border-gray-200"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    required
                  />
                  {validationErrors.startDate && (
                    <p className="text-red-500 text-sm mt-1.5">
                      {validationErrors.startDate}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  종료일
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    max={maxEndDate}
                    className={`w-full p-2.5 border rounded-lg ${
                      validationErrors.endDate
                        ? "border-red-500"
                        : "border-gray-200"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    required
                  />
                  {validationErrors.endDate && (
                    <p className="text-red-500 text-sm mt-1.5">
                      {validationErrors.endDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
            {formData.startDate && formData.endDate && (
              <div className="mt-4 text-sm text-gray-500">
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
          <div className="bg-white p-6 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            <h3 className="text-base font-semibold text-gray-800 mb-6">
              추가 설정
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  매출 트렌드
                </label>
                <div className="space-y-4">
                  <select
                    name="trend"
                    value={formData.trend}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="stable">안정적</option>
                    <option value="increasing">상승</option>
                    <option value="decreasing">하락</option>
                    <option value="seasonal">계절적</option>
                  </select>

                  {/* 트렌드 변화율 입력 */}
                  {(formData.trend === "increasing" ||
                    formData.trend === "decreasing") && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        {formData.trend === "increasing" ? "상승" : "하락"}{" "}
                        변화율 (%)
                      </label>
                      <input
                        type="number"
                        name="trendRate"
                        value={formData.trendRate}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="예: 5"
                        required
                      />
                    </div>
                  )}

                  {/* 계절성 선택 */}
                  {formData.trend === "seasonal" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700">
                          계절성 패턴
                        </label>
                        <select
                          name="seasonType"
                          value={formData.seasonType}
                          onChange={handleChange}
                          className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          required
                        >
                          <option value="">패턴 선택</option>
                          <option value="winter_to_summer">
                            동고하저 (겨울강세)
                          </option>
                          <option value="summer_to_winter">
                            동저하고 (여름강세)
                          </option>
                        </select>
                      </div>
                      {formData.seasonType && (
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700">
                            계절성 편차 (%)
                          </label>
                          <input
                            type="number"
                            name="trendDeviation"
                            value={formData.trendDeviation}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="예: 10"
                            required
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    계절성 영향
                  </label>
                  <select
                    name="seasonality"
                    value={formData.seasonality}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="low">낮음</option>
                    <option value="medium">중간</option>
                    <option value="high">높음</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    상권 유형
                  </label>
                  <select
                    name="locationType"
                    value={formData.locationType}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="residential">주거지</option>
                    <option value="commercial">상업지</option>
                    <option value="tourist">관광지</option>
                    <option value="mixed">혼합</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
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
                "데이터 생성"
              )}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              초기화
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
