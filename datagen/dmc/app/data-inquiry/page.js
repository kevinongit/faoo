"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { DGSV4_URL } from "../constants/api";
import DataTable from "../../components/DataTable";
import { useStore } from "../store";
import Navigation from "../components/Navigation";
async function fetchDataOverview(businessNumber) {
  try {
    const response = await fetch(
      `${DGSV4_URL}/data-fetch-overview?business_number=${businessNumber}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data overview:", error);
    return null;
  }
}

async function fetchSubData(businessNumber, subData, page = 1, limit = 20) {
  try {
    const response = await fetch(
      `${DGSV4_URL}/data-fetch-${subData}?business_number=${businessNumber}&page=${page}&limit=${limit}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${subData} data:`, error);
    return null;
  }
}

export default function DataInquiryPage() {
  const { users, fetchUsers } = useStore();
  const [selectedUser, setSelectedUser] = useState(null);
  const [overviewData, setOverviewData] = useState(null);
  const [subData, setSubData] = useState({});
  const [currentPage, setCurrentPage] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setOverviewData(null);
    setSubData({});
    setCurrentPage({});
  };

  const handleInquiry = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const overview = await fetchDataOverview(selectedUser.business_number);
      setOverviewData(overview);

      // Initialize sub-data for each category
      const categories = [
        "baemin",
        "coupangeats",
        "yogiyo",
        "card_sales",
        "cash_receipts",
        "tax_invoices",
      ];
      const initialSubData = {};
      const initialPages = {};

      for (const category of categories) {
        initialSubData[category] = await fetchSubData(
          selectedUser.business_number,
          category
        );
        initialPages[category] = 1;
      }

      setSubData(initialSubData);
      setCurrentPage(initialPages);
    } catch (error) {
      console.error("Error during data inquiry:", error);
    }
    setLoading(false);
  };

  const handleLoadMore = async (category) => {
    if (!selectedUser) return;

    const nextPage = (currentPage[category] || 1) + 1;
    const newData = await fetchSubData(
      selectedUser.business_number,
      category,
      nextPage
    );

    if (newData) {
      setSubData((prev) => ({
        ...prev,
        [category]: [...(prev[category] || []), ...newData],
      }));
      setCurrentPage((prev) => ({
        ...prev,
        [category]: nextPage,
      }));
    }
  };

  const renderDataTable = (data, category) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-gray-500 text-center py-4">데이터가 없습니다.</div>
      );
    }

    return (
      <div className="space-y-4">
        <DataTable data={data} title={category} />
        <div className="flex justify-center">
          <Button
            onClick={() => handleLoadMore(category)}
            className="mt-4"
            disabled={loading}
          >
            더 보기
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8">
      <Navigation />
      <Card>
        <CardHeader>
          <CardTitle>데이터 조회</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Select onValueChange={handleUserSelect}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="사용자 선택" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.business_number} value={user}>
                      {user.merchant_name} ({user.business_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleInquiry}
                disabled={!selectedUser || loading}
              >
                {loading ? "조회 중..." : "조회"}
              </Button>
            </div>

            {overviewData && (
              <Tabs defaultValue="baemin" className="w-full">
                <TabsList>
                  <TabsTrigger value="baemin">배민</TabsTrigger>
                  <TabsTrigger value="coupangeats">쿠팡이츠</TabsTrigger>
                  <TabsTrigger value="yogiyo">요기요</TabsTrigger>
                  <TabsTrigger value="card_sales">카드매출</TabsTrigger>
                  <TabsTrigger value="cash_receipts">현금영수증</TabsTrigger>
                  <TabsTrigger value="tax_invoices">세금계산서</TabsTrigger>
                </TabsList>

                <TabsContent value="baemin">
                  {renderDataTable(subData.baemin, "배민")}
                </TabsContent>
                <TabsContent value="coupangeats">
                  {renderDataTable(subData.coupangeats, "쿠팡이츠")}
                </TabsContent>
                <TabsContent value="yogiyo">
                  {renderDataTable(subData.yogiyo, "요기요")}
                </TabsContent>
                <TabsContent value="card_sales">
                  {renderDataTable(subData.card_sales, "카드매출")}
                </TabsContent>
                <TabsContent value="cash_receipts">
                  {renderDataTable(subData.cash_receipts, "현금영수증")}
                </TabsContent>
                <TabsContent value="tax_invoices">
                  {renderDataTable(subData.tax_invoices, "세금계산서")}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
