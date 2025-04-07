// store/salesStore.js
import { create } from "zustand";

const useDailySalesDetailStore = create((set, get) => ({
  apiUrl: `${process.env.NEXT_PUBLIC_BASE_URL}:6100`,
  error: null,
  ratioData: {},
  fetchData: async (businessNumber, baseDate) => {
    const HOST = get().apiUrl;
    try {
      const ratioData =
        await fetch(`${HOST}/saleapi/dailySalesDetail`, {
          method: "POST",
          body: JSON.stringify({ business_number: businessNumber, base_date: baseDate }),
          headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());

      console.log(ratioData);
      set({ ratioData });
    } catch (error) {
      set({ error: error.message });
    }
  }
}));

export default useDailySalesDetailStore;
