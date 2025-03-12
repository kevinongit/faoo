// store/salesStore.js
import { create } from "zustand";

const useSalesStore = create((set, get) => ({
  apiUrl: `${process.env.NEXT_PUBLIC_BASE_URL}:6100`,
  salesData: null,
  isLoading: false,
  error: null,
  fetchSalesData: async (businessNumber) => {
    set({ isLoading: true });
    const HOST = get().apiUrl;
    try {
      const [hometaxData, coupangData, naverData, zeropayData] =
        await Promise.all([
          fetch(`${HOST}/api/hometax/hometax_sales_invoices`, {
            method: "POST",
            body: JSON.stringify({ business_number: businessNumber }),
            headers: { "Content-Type": "application/json" },
          }).then((res) => res.json()),
          fetch(`${HOST}/api/coupangeats/coupangeats_vat_reports`, {
            method: "POST",
            body: JSON.stringify({ business_number: businessNumber }),
            headers: { "Content-Type": "application/json" },
          }).then((res) => res.json()),
          fetch(`${HOST}/api/naver/naver_vat_reports`, {
            method: "POST",
            body: JSON.stringify({ business_number: businessNumber }),
            headers: { "Content-Type": "application/json" },
          }).then((res) => res.json()),
          fetch(`${HOST}/api/zeropay/zeropay_payment_history`, {
            method: "POST",
            body: JSON.stringify({ business_number: businessNumber }),
            headers: { "Content-Type": "application/json" },
          }).then((res) => res.json()),
        ]);

      console.log(hometaxData, coupangData, naverData, zeropayData);

      const salesData = processData(
        hometaxData,
        coupangData,
        naverData,
        zeropayData
      );
      set({ salesData, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

function processData(hometaxData, coupangData, naverData, zeropayData) {
  // Calculate total sales
  const totalSales =
    hometaxData.reduce((sum, invoice) => sum + invoice.total_amount, 0) +
    coupangData.reduce((sum, report) => sum + report.total_sales, 0) +
    naverData.reduce((sum, report) => sum + report.total_sales, 0) +
    zeropayData.reduce((sum, payment) => sum + payment.payment_amount, 0);

  // Calculate monthly sales from all sources
  const allMonthlySales = [
    ...hometaxData.map((invoice) => ({
      month: new Date(invoice.issue_date).getMonth() + 1,
      total: invoice.total_amount,
    })),
    ...coupangData.map((report) => ({
      month: new Date(report.report_month).getMonth() + 1,
      total: report.total_sales,
    })),
    ...naverData.map((report) => ({
      month: new Date(report.report_month).getMonth() + 1,
      total: report.total_sales,
    })),
    ...zeropayData.map((payment) => ({
      month: new Date(payment.payment_date).getMonth() + 1,
      total: payment.payment_amount,
    })),
  ];

  const monthlySales = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const total = allMonthlySales
      .filter((sale) => sale.month === month)
      .reduce((sum, sale) => sum + sale.total, 0);
    return { month, total };
  });

  // Compare sales across platforms
  const platformComparison = [
    {
      platform: "HomeTax",
      totalSales: hometaxData.reduce(
        (sum, invoice) => sum + invoice.total_amount,
        0
      ),
    },
    {
      platform: "CoupangEats",
      totalSales: coupangData.reduce(
        (sum, report) => sum + report.total_sales,
        0
      ),
    },
    {
      platform: "Naver",
      totalSales: naverData.reduce(
        (sum, report) => sum + report.total_sales,
        0
      ),
    },
    {
      platform: "ZeroPay",
      totalSales: zeropayData.reduce(
        (sum, payment) => sum + payment.payment_amount,
        0
      ),
    },
  ];

  // Identify top-selling products
  const allProducts = [
    ...hometaxData.map((invoice) => ({
      name: invoice.item_name || "Unknown Product",
      sales: invoice.total_amount,
    })),
    ...zeropayData.map((payment) => ({
      name: payment.product_name || "Unknown Product",
      sales: payment.payment_amount,
    })),
  ];

  const productSalesMap = allProducts.reduce((map, product) => {
    if (!map[product.name]) {
      map[product.name] = product.sales;
    } else {
      map[product.name] += product.sales;
    }
    return map;
  }, {});

  const topProducts = Object.entries(productSalesMap)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5); // Top 5 products

  return {
    totalSales,
    monthlySales,
    platformComparison,
    topProducts,
  };
}

export default useSalesStore;
