import {create} from "zustand";
// import axios from "axios"; // 서버 API 호출 주석 처리

const useCalendarStore = create((set) => ({
  salesData: {},

  fetchSalesData: async (year, month) => {
    try {
      // 서버 API 요청 주석 처리
      // const response = await axios.get(`/api/sales?year=${year}&month=${month}`);
      // set({ salesData: response.data });

      // 📌 Mock 데이터 생성 (1일부터 해당 월의 마지막 날까지 랜덤 매출 값 설정)
      const daysInMonth = new Date(year, month, 0).getDate();
      let mockSalesData = {};

      for (let day = 1; day <= daysInMonth; day++) {
        let randomSales = Math.floor(Math.random() * 1000000000); // 0 ~ 10억 랜덤 값
        mockSalesData[day] = randomSales;
      }

      set({salesData: mockSalesData});

      console.log("Mock sales data loaded:", mockSalesData);
    } catch (error) {
      console.error("Failed to fetch sales data:", error);
    }
  }
}));

export default useCalendarStore;
