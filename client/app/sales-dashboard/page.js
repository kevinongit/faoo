"use client";
import { useEffect, useState } from "react";
import useSalesStore from "../../lib/store/salesStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, BarChart } from "@/components/MyChart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SalesDashboard() {
  const { salesData, isLoading, error, fetchSalesData } = useSalesStore();
  const [businessNumber, setBusinessNumber] = useState("1111100001");

  useEffect(() => {
    fetchSalesData(businessNumber);
  }, [businessNumber]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!salesData) return null;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sales Dashboard</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Total Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            {salesData.totalSales.toLocaleString()} KRW
          </p>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Monthly Sales Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart data={salesData.monthlySales} />
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Sales by Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={salesData.platformComparison} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.topProducts.map((product, index) => (
                <TableRow key={index}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sales.toLocaleString()} KRW</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
