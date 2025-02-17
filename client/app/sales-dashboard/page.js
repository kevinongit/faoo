"use client";
import { useEffect, useState } from "react";
import useSalesStore from "../../lib/store/salesStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, BarChart } from "@/components/MyChart";
import { useMediaQuery } from "@/components/ui/hooks/useMediaQuery";

export default function SalesDashboard() {
  const { salesData, isLoading, error, fetchSalesData } = useSalesStore();
  const [businessNumber, setBusinessNumber] = useState("1111100001");
  const isMobile = useMediaQuery("(max-width: 768px)");
  const xAxisTickFormatter = (value) => {
    if (typeof value === "string") {
      return value.slice(0, 3);
    }
    // Handle other data types or return a default value
    return String(value);
  };

  useEffect(() => {
    fetchSalesData(businessNumber);
  }, [businessNumber]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!salesData) return null;

  return (
    <div className="container mx-auto p-2 sm:p-4">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">Sales Dashboard</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl sm:text-3xl font-bold">
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
                <CardContent className="p-2 flex justify-between items-center">
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
