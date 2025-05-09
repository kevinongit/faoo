import { create } from "zustand";
import { DGSV2_URL } from "../constants/api";

const API_BASE_URL = DGSV2_URL;

const useSalesSimulationStore = create((set, get) => ({
  // 상태
  formData: {
    businessNumber: "",
    businessName: "",
    businessType: "",
    weekdayAvgSales: "",
    weekendAvgSales: "",
    deliveryRatio: "30",
    coupangEatsRatio: "40",
    baeminRatio: "55",
    yogiyoRatio: "5",
    hasDelivery: false,
    hasOnlineSales: false,
    onlineSalesRatio: "",
    smartStoreRatio: "45",
    elevenStreetRatio: "35",
    gmarketRatio: "20",
    startDate: "",
    endDate: "",
    trend: "stable",
    trendRate: "0",
    trendDeviation: "0",
    seasonType: "",
    seasonality: "medium",
    locationType: "mixed",
    weatherImpact: "medium",
    customerAgeGroups: {
      teens: 0,
      twenties: 0,
      thirties: 0,
      forties: 0,
      fifties: 0,
      sixties: 0,
    },
    marketingImpact: "medium",
    businessDays: [],
    isWeekendOpen: false,
    weekdayOpenTime: "09:00",
    weekdayCloseTime: "22:00",
    weekendOpenTime: "10:00",
    weekendCloseTime: "22:00",
    weekdayAverageSales: "",
    weekendAverageSales: "",
    trendType: "stable",
    seasonalPattern: "none",
  },
  isLoading: false,
  error: null,
  result: null,
  businessNumbers: [],

  // 액션
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  fetchBusinessNumbers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/business-numbers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch business numbers"
        );
      }

      const data = await response.json();
      set({ businessNumbers: data, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  resetForm: () =>
    set({
      formData: {
        businessNumber: "",
        businessName: "",
        businessType: "restaurant",
        locationType: "mixed",
        businessDays: [],
        weekdayOpenTime: "09:00",
        weekdayCloseTime: "22:00",
        weekendOpenTime: "10:00",
        weekendCloseTime: "22:00",
        weekdayAvgSales: "",
        weekendAvgSales: "",
        hasDelivery: false,
        deliveryRatio: 0,
        baeminRatio: "55",
        coupangEatsRatio: "40",
        yogiyoRatio: "5",
        hasOnlineSales: false,
        onlineSalesRatio: "",
        smartStoreRatio: "45",
        elevenStreetRatio: "35",
        gmarketRatio: "20",
        trendType: "stable",
        trendRate: "5",
        seasonalPattern: "none",
        trendDeviation: "10",
        startDate: "",
        endDate: "",
        trend: "stable",
        seasonType: "",
        seasonality: "medium",
        weatherImpact: "medium",
        customerAgeGroups: {
          teens: 0,
          twenties: 0,
          thirties: 0,
          forties: 0,
          fifties: 0,
          sixties: 0,
        },
        marketingImpact: "medium",
      },
      isLoading: false,
      error: null,
      result: null,
    }),

  setDateRange: (period) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let startDate = new Date(yesterday);

    switch (period) {
      case "1month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "6months":
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case "1year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        return;
    }

    set((state) => ({
      formData: {
        ...state.formData,
        startDate: startDate.toISOString().split("T")[0],
        endDate: yesterday.toISOString().split("T")[0],
      },
    }));
  },

  transformFormData: (formData) => {
    // 필수 필드 검증
    if (!formData.businessNumber || !formData.businessType) {
      throw new Error("사업자번호와 업종은 필수 입력 항목입니다.");
    }

    if (
      !formData.weekdayAvgSales ||
      isNaN(parseInt(formData.weekdayAvgSales))
    ) {
      throw new Error("평일 평균 매출은 필수 입력 항목입니다.");
    }

    if (!formData.startDate || !formData.endDate) {
      throw new Error("시작일과 종료일은 필수 입력 항목입니다.");
    }

    // 영업일 검증
    if (!formData.businessDays || formData.businessDays.length === 0) {
      throw new Error("영업일을 선택해주세요.");
    }

    // 배달 비율 검증
    if (formData.hasDelivery) {
      const totalDeliveryRatio =
        parseInt(formData.baeminRatio) +
        parseInt(formData.coupangEatsRatio) +
        parseInt(formData.yogiyoRatio);

      if (totalDeliveryRatio !== 100) {
        throw new Error("배달 플랫폼 비율의 합이 100%가 되어야 합니다.");
      }
    }

    // 온라인 판매 비율 검증
    if (formData.hasOnlineSales) {
      const totalOnlineRatio =
        parseInt(formData.smartStoreRatio) +
        parseInt(formData.elevenStreetRatio) +
        parseInt(formData.gmarketRatio);

      if (totalOnlineRatio !== 100) {
        throw new Error("온라인 판매 플랫폼 비율의 합이 100%가 되어야 합니다.");
      }
    }

    return {
      business_info: {
        business_number: formData.businessNumber,
        business_name: formData.businessName || "",
        business_type: formData.businessType,
        location_type: formData.locationType || "residential",
        business_days: formData.businessDays,
        is_weekend_open: formData.isWeekendOpen || false,
        weekday_open_time: formData.weekdayOpenTime || "10:00",
        weekday_close_time: formData.weekdayCloseTime || "22:00",
        weekend_open_time: formData.weekendOpenTime || "10:00",
        weekend_close_time: formData.weekendCloseTime || "22:00",
      },
      sales_data: {
        weekday_avg_sales: parseInt(formData.weekdayAvgSales),
        weekend_avg_sales: formData.isWeekendOpen
          ? parseInt(formData.weekendAvgSales || 0)
          : 0,
        has_delivery: formData.hasDelivery || false,
        delivery_ratios: formData.hasDelivery
          ? {
              baemin: parseInt(formData.baeminRatio),
              coupang_eats: parseInt(formData.coupangEatsRatio),
              yogiyo: parseInt(formData.yogiyoRatio),
            }
          : null,
        has_online_sales: formData.hasOnlineSales || false,
        online_sales_ratios: formData.hasOnlineSales
          ? {
              smart_store: parseInt(formData.smartStoreRatio),
              eleven_street: parseInt(formData.elevenStreetRatio),
              gmarket: parseInt(formData.gmarketRatio),
            }
          : null,
      },
      date_range: {
        start_date: formData.startDate,
        end_date: formData.endDate,
      },
      trend: {
        type: formData.trend || "stable",
        rate: parseInt(formData.trendRate || "0"),
        deviation: parseInt(formData.trendDeviation || "0"),
      },
      seasonality: {
        pattern: formData.seasonality || "low",
      },
    };
  },

  generateData: async () => {
    const { formData } = get();
    set({ isLoading: true, error: null });

    try {
      const transformedData = useSalesSimulationStore
        .getState()
        .transformFormData(formData);
      const response = await fetch(`${API_BASE_URL}/gen-sales`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate data");
      }

      const result = await response.json();
      set({ result, isLoading: false });
      return result;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },
}));

export default useSalesSimulationStore;
