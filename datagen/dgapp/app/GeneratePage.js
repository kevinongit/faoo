"use client";

import {useState, useEffect} from "react";
import {useDataStore} from "./store/useDataStore";
import DataTable from "./components/DataTable";
import {Button} from "./components/Button";
import Loading from "./components/Loading";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./components/Select";
import {Input} from "./components/Input";
import {saveDataToMongo} from "./actions/mongoActions";
import useFlowStore from "./store/useFlowStore";
import { usePageStore } from "./store/usePageStore";

export default function GeneratePage({users = [], trends = []}) {
  const [loading, setLoading] = useState({loading: false, text: ""});
  const {businessNumber, setBusinessNumber} = usePageStore();
  const [durationUnit, setDurationUnit] = useState("d");
  const [durationCount, setDurationCount] = useState("1");
  const [revenueTrend, setRevenueTrend] = useState("slow_increase");
  const [trendPercentage, setTrendPercentage] = useState("10");
  const [expandedSections, setExpandedSections] = useState({});
  const {setData, data} = useDataStore();
  const addPath = useFlowStore((state) => state.addPath);
  const setActivePaths = useFlowStore((state) => state.setActivePaths);
  const addEdge = useFlowStore((state) => state.addEdge);

  useEffect((state) => {
    setActivePaths([]);
    //addPath("start");
  }, []);

  const generateData = async () => {
    addPath("start");
    if (!businessNumber || !durationUnit || !durationCount || !revenueTrend || !trendPercentage) {
      alert("Please fill all fields");
      return;
    }
    setLoading({loading: true, text: "Generating data..."});

    try {
      const genDuration = `${durationCount}${durationUnit}`;
      const fullRevenueTrend = `${revenueTrend}_${trendPercentage}`;
      const response = await fetch("http://localhost:3400/gen-data", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          business_number: businessNumber,
          gen_duration: genDuration,
          weekday_avg_revenue: 160000,
          revenue_trend: fullRevenueTrend
        })
      });
      const jsonData = await response.json();
      console.log("Generated data:", jsonData);
      setData(jsonData);
    } catch (error) {
      console.error("Error generating data:", error);
    }
    setLoading({loading: false, text: ""});
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleSaveToMongo = async () => {
    addPath("sales_data");

    setLoading({loading: true, text: "Data saving in progress..."});
    await delay(1000);

    try {
      addPath("sales_data_save");
      console.log("Saving data to MongoDB:", data);
      await saveDataToMongo(data);

      setLoading({loading: true, text: "Data successfully saved"});
      await delay(1000);

      addPath("sales_data_analysis");
      addEdge({
        id: "e-datasave-db2",
        source: "datasave",
        target: "db2",
        sourceHandle: "right-source",
        targetHandle: "left-target",
        type: "smoothstep"
      });

      setLoading({loading: true, text: "Data analysis in progress..."});
      const response = await fetch("http://localhost:3800/datagen");

      const jsonData = await response.json();
      console.log("Data analysis completed:", jsonData);

      await delay(3000);

      setLoading({loading: true, text: "Data analysis completed"});

      await delay(1000);

      setLoading({loading: false, text: ""});
    } catch (error) {
      console.error("Error saving to MongoDB:", error);
      alert("Failed to save data");
    }
    setLoading({loading: false, text: ""});
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderAccordionSection = (title, data) => {
    const recordCount = Array.isArray(data) ? data.length : data ? 1 : 0;

    console.log("renderAccordionSection", title, data);
    return (
      <div className="mb-4">
        <button
          onClick={() => toggleSection(title)}
          className="w-full text-left bg-gray-200 p-3 font-semibold rounded-t-lg focus:outline-none">
          {`${title} (${recordCount}건)`} {expandedSections[title] ? "▼" : "▶"}
        </button>
        {expandedSections[title] && data && (
          <div className="p-4 bg-white rounded-b-lg shadow">
            <DataTable
              data={data}
              title={title}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Loading
        loading={loading.loading}
        size={150}
        color="red"
        text={loading.text}
      />

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">데이터 생성</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business</label>
            <Select
              onValueChange={setBusinessNumber}
              value={businessNumber}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a business" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem
                    key={user.business_number}
                    value={user.business_number}>
                    {`${user.merchant_name} (${user.name}, ${user.business_number_dash}, ${user.smb_sector})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={durationCount}
                onChange={(e) => setDurationCount(e.target.value)}
                className="w-20"
                min={durationUnit === "y" ? 1 : 1}
                max={durationUnit === "y" ? 2 : 999}
              />
              <Select
                onValueChange={setDurationUnit}
                value={durationUnit}>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Revenue Trend</label>
            <div className="flex gap-2">
              <Select
                onValueChange={setRevenueTrend}
                value={revenueTrend}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a trend" />
                </SelectTrigger>
                <SelectContent>
                  {trends.map((trend) => (
                    <SelectItem
                      key={trend}
                      value={trend}>
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
          disabled={loading.loading}
          className="mt-4 w-full bg-primary hover:bg-blue-600">
          {loading.loading ? "Generating..." : "Generate Data"}
        </Button>

        {data && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Generated Data</h3>
            {renderAccordionSection("Merchant Info", [data.merchant_info])}
            {renderAccordionSection(
              "Approval Details",
              data.card_sales_data.daily_sales_data.reduce((acc, item) => {
                if (item.approval_details && item.approval_details.length > 0) {
                  acc.push(...item.approval_details);
                }
                return acc;
              }, [])
            )}
            {renderAccordionSection(
              "Acquisition Details",
              data.card_sales_data.daily_sales_data.reduce((acc, item) => {
                if (item.acquisition_details) {
                  acc.push(item.acquisition_details);
                }
                return acc;
              }, [])
            )}
            {renderAccordionSection(
              "Deposit Details",
              data.card_sales_data.daily_sales_data.reduce((acc, item) => {
                if (item.deposit_details) {
                  acc.push(item.deposit_details);
                }
                return acc;
              }, [])
            )}
            {renderAccordionSection("Baemin", data.baemin.daily_sales_data)}
            {renderAccordionSection("CoupangEats", data.coupangeats.daily_sales_data)}
            {renderAccordionSection("Yogiyo", data.yogiyo.daily_sales_data)}
            {renderAccordionSection("Cash Receipts", data.hometax_cash_receipts.daily_cash_receipts_data)}
            {renderAccordionSection("Tax Invoices", data.hometax_tax_invoices.daily_tax_invoices_data)}
            <Button
              onClick={handleSaveToMongo}
              disabled={loading.loading}
              className="mt-4 w-full bg-secondary hover:bg-purple-700">
              {loading.loading ? "Saving..." : "데이터 수집"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
