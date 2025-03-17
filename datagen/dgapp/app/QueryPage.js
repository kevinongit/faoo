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
import { fetchMongoData } from "./actions/mongoActions";

export default function QueryPage({ collections = [], initialMongoData }) {
  const [loading, setLoading] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(
    collections[0] || ""
  );
  const [expandedSections, setExpandedSections] = useState({});
  const { setMongoData, mongoData } = useDataStore();

  useEffect(() => {
    if (initialMongoData) {
      console.log("Initial MongoDB data loaded:", initialMongoData);
      setMongoData(initialMongoData);
    }
  }, [initialMongoData]);

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
    <div className="container mx-auto p-6 max-w-4xl">
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
    </div>
  );
}
