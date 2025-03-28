import { create } from "zustand";

const useMonthSalesStore = create((set, get) => ({
  apiUrl: `${process.env.NEXT_PUBLIC_BASE_URL}:6100`,
  monthSalesData: null,
  isLoading: false,
  error: null,

  fetchMonthSales: async (businessNumber, fromDate, toDate) => {
    set({ isLoading: true, error: null });
    const HOST = get().apiUrl;

    try {
      const response = await fetch(`${HOST}/saleapi/monthSales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_number: businessNumber,
          from_date: fromDate,
          to_date: toDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch monthly sales data");
      }

      const data = await response.json();
      set({ monthSalesData: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

export default useMonthSalesStore;
