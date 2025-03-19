"use client";

import { useState, useEffect } from "react";
import { useDataStore } from "./store/useDataStore";
import DataTable from "./components/DataTable";
import { Button } from "./components/Button";
import Loading from "./components/Loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/Select";
import { Input } from "./components/Input";
import { saveDataToMongo } from "./actions/mongoActions";

export default function TemporaryPage({ users = [] }) {
  const [loading, setLoading] = useState({ loading: false, text: "" });
  const [businessNumber, setBusinessNumber] = useState("");
  const [durationUnit, setDurationUnit] = useState("d");
  const [durationCount, setDurationCount] = useState("1");

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const generateData = async () => {
    if (
      !businessNumber ||
      !durationUnit ||
      !durationCount
    ) {
      alert("Please fill all fields");
      return;
    }
    setLoading({ loading: true, text: "Data Generating..." });
    try {
      const genDuration = `${durationCount}${durationUnit}`;
      const response = await fetch("http://localhost:3400/gen-data-temporary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_number: businessNumber,
          gen_duration: genDuration,
          weekday_avg_revenue: 160000,
        }),
      });

      setLoading({ loading: true, text: "Data analysis in progress..." });
      await fetch("http://localhost:3800/datagen");

      setLoading({ loading: true, text: "Data analysis completed" });
      await delay(1000);

      setLoading({ loading: false, text: "" });
    } catch (error) {
      console.error("Error generating data:", error);
    }
    setLoading({ loading: false, text: "" });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Loading loading={loading.loading} size={150} color="red" text={loading.text} />

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">비교군 데이터 생성</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business
            </label>
            <Select onValueChange={setBusinessNumber} value={businessNumber}>
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
        </div>
        <Button
          onClick={generateData}
          disabled={loading.loading}
          className="mt-4 w-full bg-primary hover:bg-blue-600"
        >
          {loading.loading ? "Generating..." : "Generate Data"}
        </Button>
      </div>
    </div>
  );
}
