// store/salesStore.js
import { create } from "zustand";

const useSaleDataStore = create((set, get) => ({
  apiUrl: `${process.env.NEXT_PUBLIC_BASE_URL}:6100`,
  last7daySales: null,
  weekSalesData: null,
  error: null,
  fetchData: async (businessNumber) => {
    const HOST = get().apiUrl;
    try {
      const last7daySales =
        await fetch(`${HOST}/saleapi/last7daySales`, {
          method: "POST",
          body: JSON.stringify({ business_number: businessNumber }),
          headers: { "Content-Type": "application/json" },
        }).then((res) => res.json())

      set({ last7daySales:processData(last7daySales) });
    } catch (error) {
      set({ error: error.message });
    }
  },
  fetchWeekData: async (businessNumber, base_date) => {
    const HOST = get().apiUrl;
    try {
      const weekSales =
        await fetch(`${HOST}/saleapi/weekSales`, {
          method: "POST",
          body: JSON.stringify({ business_number: businessNumber, base_date: base_date }),
          headers: { "Content-Type": "application/json" },
        }).then((res) => res.json())

      set({ weekSalesData:processWeekData(weekSales) });
    } catch (error) {
      set({ error: error.message });
    }
  },
}));

function summary(sales) {
  return sales.reduce((sumList, sales) => {
    const sumObj = sumList.find(x => x.sale_date == sales.sale_date);

    if (sumObj) {
      sumObj.sum_amt += Number(sales.sale_amt);
      sumObj.list.push(sales);
    }else{
      sumList.push({
        sale_date: sales.sale_date,
        sum_amt: Number(sales.sale_amt),
        list: [sales]
      })
    }

    return sumList;
  }, []).sort((x, y) => Number(x.sale_date) - Number(y.sale_date));
}

function processData(last7daySales) {
  if (last7daySales && last7daySales.result_7day && last7daySales.result_7day.length > 0) {
    return summary(last7daySales.result_7day);
  }else{
    return [];
  }
}

function processDayData(base_date, daySales) {
  if (daySales && daySales.result_day && daySales.result_day.length > 0) {
    return daySales.result_day.reduce((sumObj, sales) => {
      sumObj.sum_amt += Number(sales.sale_amt);
      sumObj.list.push(sales);

      return sumObj;
    }, {sale_date: base_date, sum_amt: 0, list: []});
  }else{
    return {sale_date: base_date, sum_amt: 0, list: []};
  }
}

function processWeekData(weekSales) {
  const sales_info = {};

  if (weekSales && weekSales.result_base && weekSales.result_base.length > 0) {
    sales_info.base_week = summary(weekSales.result_base);
  }else{
    sales_info.base_week = [];
  }

  if (weekSales && weekSales.result_7day && weekSales.result_7day.length > 0) {
    sales_info.result_7day = summary(weekSales.result_7day);
  }else{
    sales_info.result_7day = [];
  }

  if (weekSales && weekSales.result_prevYear && weekSales.result_prevYear.length > 0) {
    sales_info.result_prevYear = summary(weekSales.result_prevYear);
  }else{
    sales_info.result_prevYear = [];
  }

  return sales_info;
}

export default useSaleDataStore;
