// store/salesStore.js
import { create } from "zustand";

const useSaleDataStore = create((set, get) => ({
  apiUrl: `${process.env.NEXT_PUBLIC_BASE_URL}:6100`,
  last7daySales: null,
  weekSalesData: null,
  error: null,
  fetchData: async (businessNumber, start_date, end_date) => {
    const HOST = get().apiUrl;
    try {
      // 주 단위 데이터를 가져오도록 수정
      // start_date와 end_date를 모두 전달하여 해당 기간의 데이터를 가져옴
      const last7daySales =
        await fetch(`${HOST}/saleapi/last7daySales`, {
          method: "POST",
          body: JSON.stringify({ 
            business_number: businessNumber, 
            base_date: end_date,  // 기존 호환성을 위해 base_date 유지
            start_date: start_date,  // 주의 시작 날짜 (월요일)
            end_date: end_date  // 주의 끝 날짜 (일요일)
          }),
          headers: { "Content-Type": "application/json" },
        }).then((res) => res.json())

      set({ last7daySales:last7daySales.result_7day });
      console.log(`주 단위 데이터 가져오기 성공: ${start_date} ~ ${end_date}`);
    } catch (error) {
      set({ error: error.message });
      console.error(`데이터 가져오기 오류: ${error.message}`);
    }
  },
  fetchWeekData: async (businessNumber, base_date, weekOffset) => {
    const HOST = get().apiUrl;
    try {
      const weekSales =
        await fetch(`${HOST}/saleapi/weekSales`, {
          method: "POST",
          body: JSON.stringify({ business_number: businessNumber, base_date: base_date, week_offset: weekOffset }),
          headers: { "Content-Type": "application/json" },
        }).then((res) => res.json())

      set({ weekSalesData:processWeekData(weekSales) });
    } catch (error) {
      set({ error: error.message });
    }
  },
}));

function processWeekData(weekSales) {
  const sales_list = [];

  const result_base = weekSales.result_base.sort((x, y) => Number(x.sale_date) - Number(y.sale_date));
  const result_7day = weekSales.result_7day.sort((x, y) => Number(x.sale_date) - Number(y.sale_date));
  const result_prevYear = weekSales.result_prevYear.sort((x, y) => Number(x.sale_date) - Number(y.sale_date));

  for (let i = 0; i < result_base.length; i++) {
    sales_list.push({base: result_base[i], prev7day: result_7day[i], prevYear: result_prevYear[i]});
  }

  return sales_list;
}

export default useSaleDataStore;
