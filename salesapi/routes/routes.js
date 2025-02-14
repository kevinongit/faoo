const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const { MONGODB_URI } = process.env;
const {
  SalesInvoice,
  VATReport,
  VATData,
  VATSummary,
} = require("../models/hometax");
const logger = require("../middleware/logger");

// MongoDB 클라이언트 연결 함수
async function connectToDatabase() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client.db();
}

router.post("/hometax/hometax_sales_invoices", async (req, res) => {
  try {
    const { business_number } = req.body;
    const db = await connectToDatabase();
    const collection = db.collection("hometax_sales_invoices");
    const results = await collection.find({ business_number }).toArray();
    logger.info(
      `/hometax_sales_invoices retrieved for business number: ${business_number} ${results.length}`
    );
    res.json(results);
  } catch (error) {
    logger.error("Error retrieving sales invoice:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// HomeTax VAT Reports
router.post("/hometax/hometax_vat_reports", async (req, res) => {
  try {
    const { business_number } = req.body;
    const db = await connectToDatabase();
    const collection = db.collection("hometax_vat_reports");
    const results = await collection.find({ business_number }).toArray();
    logger.info(
      `/hometax_vat_reports retrieved for business number: ${business_number} ${results.length}`
    );
    res.json(results);
  } catch (error) {
    logger.error("Error retrieving VAT reports:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// HomeTax VAT Data
router.post("/hometax/hometax_vat_data", async (req, res) => {
  try {
    const { business_number } = req.body;
    const db = await connectToDatabase();
    const collection = db.collection("hometax_vat_data");
    const results = await collection.find({ business_number }).toArray();
    logger.info(
      `/hometax_vat_data retrieved for business number: ${business_number} ${results.length}`
    );
    res.json(results);
  } catch (error) {
    logger.error("Error retrieving VAT data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// HomeTax VAT Summaries
router.post("/hometax/hometax_vat_summaries", async (req, res) => {
  try {
    const { business_number } = req.body;
    const db = await connectToDatabase();
    const collection = db.collection("hometax_vat_summaries");
    const results = await collection.find({ business_number }).toArray();
    logger.info(
      `/hometax_vat_summaries retrieved for business number: ${business_number} ${results.length}`
    );
    res.json(results);
  } catch (error) {
    logger.error("Error retrieving VAT summaries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// CoupangEats Seller Info
router.post("/coupangeats/coupangeats_seller_info", async (req, res) => {
  try {
    const { business_number } = req.body;
    const db = await connectToDatabase();
    const collection = db.collection("coupangeats_seller_info");
    const results = await collection.find({ business_number }).toArray();
    logger.info(
      `/coupangeats_seller_info retrieved for business number: ${business_number} ${results.length}`
    );
    res.json(results);
  } catch (error) {
    logger.error("Error retrieving CoupangEats seller info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// CoupangEats VAT Reports
router.post("/coupangeats/coupangeats_vat_reports", async (req, res) => {
  try {
    const { business_number } = req.body;
    const db = await connectToDatabase();
    const collection = db.collection("coupangeats_vat_reports");
    const results = await collection.find({ business_number }).toArray();
    logger.info(
      `/coupangeats_vat_reports retrieved for business number: ${business_number} ${results.length}`
    );
    res.json(results);
  } catch (error) {
    logger.error("Error retrieving CoupangEats VAT reports:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Naver Seller Info
router.post("/naver/naver_seller_info", async (req, res) => {
  try {
    const { business_number } = req.body;
    const db = await connectToDatabase();
    const collection = db.collection("naver_seller_info");
    const results = await collection.find({ business_number }).toArray();
    logger.info(
      `/naver_seller_info retrieved for business number: ${business_number} ${results.length}`
    );
    res.json(results);
  } catch (error) {
    logger.error("Error retrieving Naver seller info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Naver VAT Reports
router.post("/naver/naver_vat_reports", async (req, res) => {
  try {
    const { business_number } = req.body;
    const db = await connectToDatabase();
    const collection = db.collection("naver_vat_reports");
    const results = await collection.find({ business_number }).toArray();
    logger.info(
      `/naver_vat_reports retrieved for business number: ${business_number} ${results.length}`
    );
    res.json(results);
  } catch (error) {
    logger.error("Error retrieving Naver VAT reports:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ZeroPay Merchant Info
router.post("/zeropay/zeropay_merchant_info", async (req, res) => {
  try {
    const { business_number } = req.body;
    const db = await connectToDatabase();
    const collection = db.collection("zeropay_merchant_info");
    const results = await collection.find({ business_number }).toArray();
    logger.info(
      `/zeropay_merchant_info retrieved for business number: ${business_number} ${results.length}`
    );
    res.json(results);
  } catch (error) {
    logger.error("Error retrieving ZeroPay merchant info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ZeroPay Payment History
router.post("/zeropay/zeropay_payment_history", async (req, res) => {
  try {
    const { business_number } = req.body;
    const db = await connectToDatabase();
    const collection = db.collection("zeropay_payment_history");
    const results = await collection.find({ business_number }).toArray();
    logger.info(
      `/zeropay_payment_history retrieved for business number: ${business_number} ${results.length}`
    );
    res.json(results);
  } catch (error) {
    logger.error("Error retrieving ZeroPay payment history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ZeroPay Deposit Schedule
router.post("/zeropay/zeropay_deposit_schedule", async (req, res) => {
  try {
    const { business_number } = req.body;
    const db = await connectToDatabase();
    const collection = db.collection("zeropay_deposit_schedule");
    const results = await collection.find({ business_number }).toArray();
    logger.info(
      `/zeropay_deposit_schedule retrieved for business number: ${business_number} ${results.length}`
    );
    res.json(results);
  } catch (error) {
    logger.error("Error retrieving ZeroPay deposit schedule:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
