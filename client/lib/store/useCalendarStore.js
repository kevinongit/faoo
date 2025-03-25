import {create} from "zustand";

const useCalendarStore = create((set) => ({
  selectedDate: new Date(), // 현재 선택된 날짜
  salesData: {}, // 매출 데이터 저장 (캘린더에서 사용)
  comparisonData: {}, //1일전, 2일전, 1일전 작년 매출
  dailySales: {}, //일자별 매출
  currentYear: "2025",
  currentMonth: "03",
  isLoading: false,
  error: null,

  // 이번 달 매출 데이터 가져오기

  fetchMonthlySales: async (business_number, year, month) => {
    set({isLoading: true, error: null});

    try {
      const response = await fetch("http://localhost:6100/api/dashboard/sales/month", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({business_number, year, month})
      });

      if (!response.ok) {
        throw new Error("데이터를 불러오는 데 실패했습니다.");
      }

      const data = await response.json();
      console.log("Monthly Sales Data:", data);

      set({salesData: data, isLoading: false});
    } catch (error) {
      set({error: error.message, isLoading: false});
    }
  },

  //어제 & 오늘 매출 데이터 가져오기
  fetchComparison: async (business_number) => {
    set({isLoading: true, error: null});

    try {
      const response = await fetch("http://localhost:6100/api/dashboard/sales/comparison", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({business_number})
      });

      if (!response.ok) {
        throw new Error("데이터를 불러오는 데 실패했습니다.");
      }

      const data = await response.json();
      console.log("comparison Sales Data:", data);

      set({comparisonData: data, isLoading: false});
    } catch (error) {
      set({error: error.message, isLoading: false});
    }
  },

  setCurrentYear: (year) => set({currentYear: year}),
  setCurrentMonth: (month) => {
    if (month === 0) {
      set((state) => ({currentYear: state.currentYear - 1, currentMonth: 12}));
    } else if (month === 13) {
      set((state) => ({currentYear: state.currentYear + 1, currentMonth: 1}));
    } else {
      set({currentMonth: month});
    }
  },

  fetchDailySales: async (business_number) => {
    set({isLoading: true, error: null});

    try {
      const {currentYear, currentMonth} = useCalendarStore.getState();
      const response = await fetch(`http://localhost:6100/api/dashboard/sales/daily`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({business_number, year: currentYear, month: currentMonth})
      });

      if (!response.ok) throw new Error("매출 데이터를 불러오는 데 실패했습니다.");

      const data = await response.json();

      set({dailySales: data, isLoading: false});
    } catch (error) {
      set({error: error.message, isLoading: false});
    }
  }
}));

export default useCalendarStore;
