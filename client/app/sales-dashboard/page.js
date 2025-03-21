"use client";
import { useEffect, useState } from "react";
import useSalesStore from "@/lib/store/salesStore";
import { useAuthStore } from "@/lib/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, BarChart } from "@/components/MyChart";
import { useMediaQuery } from "@/components/ui/hooks/useMediaQuery";

export default function SalesDashboard() {
  const { user } = useAuthStore();
  const { salesData, isLoading, error, fetchSalesData } = useSalesStore();
  // const [businessNumber, setBusinessNumber] = useState("1111100001");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const xAxisTickFormatter = (value) => {
    if (typeof value === "string") {
      return value.slice(0, 3);
    }
    // Handle other data types or return a default value
    return String(value);
  };

  useEffect(() => {
    fetchSalesData(user.business_number);
  }, [user.business_number]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!salesData) return null;
  console.log("*salesData", salesData);
  return (
    <div className="container p-2 mx-auto sm:p-4">
      <h1 className="mb-4 text-xl font-bold sm:text-2xl">Sales Dashboard</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold sm:text-3xl">
            {salesData.totalSales.toLocaleString()} KRW
          </p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Monthly Sales Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={salesData.monthlySales}
            height={isMobile ? 200 : 300}
            xAxisTickFormatter={xAxisTickFormatter}
          />
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Sales by Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart
            data={salesData.platformComparison}
            height={isMobile ? 200 : 300}
            xAxisTickFormatter={xAxisTickFormatter}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Top Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {salesData.topProducts.map((product, index) => (
              <Card key={index}>
                <CardContent className="flex items-center justify-between p-2">
                  <span className="font-medium">{product.name}</span>
                  <span>{product.sales.toLocaleString()} KRW</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
