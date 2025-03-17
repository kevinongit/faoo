"use client";

import { useState, useEffect } from "react";
import { useDataStore } from "./store/useDataStore";
import DataTable from "./components/DataTable";
import { Button } from "./components/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/Select";
import { Input } from "./components/Input";
import { saveDataToMongo, fetchMongoData } from "./actions/mongoActions";
import Link from "next/link";

export default function ClientPage({ collections, initialMongoData }) {
  const [activeTab, setActiveTab] = useState("generate");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [trends, setTrends] = useState([]);
  const [businessNumber, setBusinessNumber] = useState("");
  const [durationUnit, setDurationUnit] = useState("d");
  const [durationCount, setDurationCount] = useState("1");
  const [revenueTrend, setRevenueTrend] = useState("slow_increase");
  const [trendPercentage, setTrendPercentage] = useState("10");
  const [selectedCollection, setSelectedCollection] = useState(
    collections[0] || ""
  );
  const [expandedSections, setExpandedSections] = useState({});
  const { setData, data, setMongoData, mongoData } = useDataStore();

  useEffect(() => {
    if (activeTab === "generate") {
      fetch("http://localhost:3400/users")
        .then((res) => res.json())
        .then(setUsers)
        .catch((err) => console.error("Error fetching users:", err));
      fetch("http://localhost:3400/rtrend")
        .then((res) => res.json())
        .then(setTrends)
        .catch((err) => console.error("Error fetching trends:", err));
    } else if (activeTab === "query" && initialMongoData) {
      console.log("Initial MongoDB data loaded:", initialMongoData);
      setMongoData(initialMongoData);
    }
  }, [activeTab, initialMongoData]);

  const generateData = async () => {
    if (
      !businessNumber ||
      !durationUnit ||
      !durationCount ||
      !revenueTrend ||
      !trendPercentage
    ) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const genDuration = `${durationCount}${durationUnit}`;
      const fullRevenueTrend = `${revenueTrend}_${trendPercentage}`;
      const response = await fetch("http://localhost:3400/gen-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_number: businessNumber,
          gen_duration: genDuration,
          weekday_avg_revenue: 160000,
          revenue_trend: fullRevenueTrend,
        }),
      });
      const jsonData = await response.json();
      console.log("Generated data:", jsonData);
      setData(jsonData);
    } catch (error) {
      console.error("Error generating data:", error);
    }
    setLoading(false);
  };

  const handleSaveToMongo = async () => {
    setLoading(true);
    try {
      console.log("Saving data to MongoDB:", data);
      await saveDataToMongo(data);
      alert("Data successfully saved to MongoDB");
    } catch (error) {
      console.error("Error saving to MongoDB:", error);
      alert("Failed to save data");
    }
    setLoading(false);
  };

  const handleFetchFromMongo = async (collection) => {
    setLoading(true);
    try {
      console.log("Fetching MongoDB data for collection:", collection);
      const mongoJson = await fetchMongoData(collection);
      console.log("Fetched MongoDB data:", mongoJson);
      setMongoData(mongoJson);
    } catch (error) {
      console.error("Error fetching from MongoDB:", error);
    }
    setLoading(false);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderAccordionSection = (title, data) => {
    const recordCount = Array.isArray(data) ? data.length : data ? 1 : 0;
    return (
      <div className="mb-4">
        <button
          onClick={() => toggleSection(title)}
          className="w-full text-left bg-gray-200 p-3 font-semibold rounded-t-lg focus:outline-none"
        >
          {`${title} (${recordCount}건)`} {expandedSections[title] ? "▼" : "▶"}
        </button>
        {expandedSections[title] && data && (
          <div className="p-4 bg-white rounded-b-lg shadow">
            <DataTable data={data} title={title} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <nav className="bg-primary text-white p-4 shadow-md">
        <ul className="flex space-x-6 justify-center">
          <li>
            <button
              onClick={() => setActiveTab("generate")}
              className={`px-4 py-2 rounded-md ${
                activeTab === "generate" ? "bg-blue-700" : "hover:bg-blue-600"
              }`}
            >
              데이터 생성
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveTab("query")}
              className={`px-4 py-2 rounded-md ${
                activeTab === "query" ? "bg-blue-700" : "hover:bg-blue-600"
              }`}
            >
              수집데이터 조회
            </button>
          </li>
          <li>
            <Link href="/notify" passHref>
              <Button className={`px-4 py-2 rounded-md hover:bg-blue-600`}>
                알림 전송
              </Button>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="container mx-auto p-6 max-w-4xl">
        {activeTab === "generate" && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">데이터 생성</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business
                </label>
                <Select
                  onValueChange={setBusinessNumber}
                  value={businessNumber}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a business" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem
                        key={user.business_number}
                        value={user.business_number}
                      >
                        {`${user.merchant_name} (${user.name}, ${user.business_number_dash}, ${user.smb_sector})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={durationCount}
                    onChange={(e) => setDurationCount(e.target.value)}
                    className="w-20"
                    min={durationUnit === "y" ? 1 : 1}
                    max={durationUnit === "y" ? 2 : 999}
                  />
                  <Select onValueChange={setDurationUnit} value={durationUnit}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="d">Day</SelectItem>
                      <SelectItem value="w">Week</SelectItem>
                      <SelectItem value="m">Month</SelectItem>
                      <SelectItem value="y">Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Revenue Trend
                </label>
                <div className="flex gap-2">
                  <Select onValueChange={setRevenueTrend} value={revenueTrend}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a trend" />
                    </SelectTrigger>
                    <SelectContent>
                      {trends.map((trend) => (
                        <SelectItem key={trend} value={trend}>
                          {trend.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={trendPercentage}
                    onChange={(e) => setTrendPercentage(e.target.value)}
                    className="w-20"
                    min="1"
                    max="100"
                    placeholder="%"
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={generateData}
              disabled={loading}
              className="mt-4 w-full bg-primary hover:bg-blue-600"
            >
              {loading ? "Generating..." : "Generate Data"}
            </Button>

            {data && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Generated Data</h3>
                {renderAccordionSection("Merchant Info", [data.merchant_info])}
                {renderAccordionSection(
                  "Approval Details",
                  data.card_sales_data.daily_sales_data.flatMap(
                    (item) => item.approval_details
                  )
                )}
                {renderAccordionSection(
                  "Acquisition Details",
                  data.card_sales_data.daily_sales_data.map(
                    (item) => item.acquisition_details
                  )
                )}
                {renderAccordionSection(
                  "Deposit Details",
                  data.card_sales_data.daily_sales_data.map(
                    (item) => item.deposit_details
                  )
                )}
                {renderAccordionSection("Baemin", data.baemin.daily_sales_data)}
                {renderAccordionSection(
                  "CoupangEats",
                  data.coupangeats.daily_sales_data
                )}
                {renderAccordionSection("Yogiyo", data.yogiyo.daily_sales_data)}
                {renderAccordionSection(
                  "Cash Receipts",
                  data.hometax_cash_receipts.daily_cash_receipts_data
                )}
                {renderAccordionSection(
                  "Tax Invoices",
                  data.hometax_tax_invoices.daily_tax_invoices_data
                )}
                <Button
                  onClick={handleSaveToMongo}
                  disabled={loading}
                  className="mt-4 w-full bg-secondary hover:bg-purple-700"
                >
                  {loading ? "Saving..." : "데이터 수집"}
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === "query" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">수집데이터 조회</h2>
            <div className="flex gap-4 mb-4">
              <Select
                onValueChange={(val) => {
                  setSelectedCollection(val);
                  handleFetchFromMongo(val);
                }}
                value={selectedCollection}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a collection" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {mongoData && (
              <>
                <h3 className="text-lg font-medium mb-2">MongoDB Data</h3>
                {renderAccordionSection("Merchant Info (Mongo)", [
                  mongoData.merchant_info,
                ])}
                {renderAccordionSection(
                  "Approval Details (Mongo)",
                  mongoData.card_sales_data.daily_sales_data.flatMap(
                    (item) => item.approval_details
                  )
                )}
                {renderAccordionSection(
                  "Acquisition Details (Mongo)",
                  mongoData.card_sales_data.daily_sales_data.map(
                    (item) => item.acquisition_details
                  )
                )}
                {renderAccordionSection(
                  "Deposit Details (Mongo)",
                  mongoData.card_sales_data.daily_sales_data.map(
                    (item) => item.deposit_details
                  )
                )}
                {renderAccordionSection(
                  "Baemin (Mongo)",
                  mongoData.baemin.daily_sales_data
                )}
                {renderAccordionSection(
                  "CoupangEats (Mongo)",
                  mongoData.coupangeats.daily_sales_data
                )}
                {renderAccordionSection(
                  "Yogiyo (Mongo)",
                  mongoData.yogiyo.daily_sales_data
                )}
                {renderAccordionSection(
                  "Cash Receipts (Mongo)",
                  mongoData.hometax_cash_receipts.daily_cash_receipts_data
                )}
                {renderAccordionSection(
                  "Tax Invoices (Mongo)",
                  mongoData.hometax_tax_invoices.daily_tax_invoices_data
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
