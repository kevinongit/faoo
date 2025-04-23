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

/**
 * @swagger
 * /hometax/hometax_sales_invoices:
 *   post:
 *     tags:
 *       - Hometax
 *     summary: 홈택스 매출 세금계산서 조회
 *     description: 사업자 번호로 홈택스 매출 세금계산서를 조회합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_number
 *             properties:
 *               business_number:
 *                 type: string
 *                 example: "1001010001"
 *                 description: 사업자 번호
 *     responses:
 *       200:
 *         description: 세금계산서 배열
 */
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

/**
 * @swagger
 * /hometax/hometax_vat_reports:
 *   post:
 *     tags:
 *       - Hometax
 *     summary: 홈택스 부가세 신고 내역 조회
 *     description: 사업자 번호로 홈택스 부가세 신고 내역을 조회합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_number
 *             properties:
 *               business_number:
 *                 type: string
 *                 example: "1001010001"
 *                 description: 사업자 번호
 *     responses:
 *       200:
 *         description: 세금계산서 배열
 */
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

/**
 * @swagger
 * /hometax/hometax_vat_data:
 *   post:
 *     tags:
 *       - Hometax
 *     summary: 홈택스 부가세 상세 데이터 조회
 *     description: 사업자 번호로 홈택스 부가세 상세 데이터를 조회합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_number
 *             properties:
 *               business_number:
 *                 type: string
 *                 example: "1001010001"
 *                 description: 사업자 번호
 *     responses:
 *       200:
 *         description: 세금계산서 배열
 */
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

/**
 * @swagger
 * /hometax/hometax_vat_summaries:
 *   post:
 *     tags:
 *       - Hometax
 *     summary: 홈택스 부가세 요약 조회
 *     description: 사업자 번호로 홈택스 부가세 요약을 조회합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_number
 *             properties:
 *               business_number:
 *                 type: string
 *                 example: "1001010001"
 *                 description: 사업자 번호
 *     responses:
 *       200:
 *         description: 세금계산서 배열
 */
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

/**
 * @swagger
 * /coupangeats/coupangeats_seller_info:
 *   post:
 *     tags:
 *       - CoupangEats
 *     summary: 쿠팡이츠 판매자 정보 조회
 *     description: 사업자 번호로 쿠팡이츠 판매자 정보를 조회합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_number
 *             properties:
 *               business_number:
 *                 type: string
 *                 example: "1001010001"
 *                 description: 사업자 번호
 *     responses:
 *       200:
 *         description: 세금계산서 배열
 */
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

/**
 * @swagger
 * /coupangeats/coupangeats_vat_reports:
 *   post:
 *     tags:
 *       - CoupangEats
 *     summary: 쿠팡이츠 부가세 신고 내역 조회
 *     description: 사업자 번호로 쿠팡이츠 부가세 신고 내역을 조회합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_number
 *             properties:
 *               business_number:
 *                 type: string
 *                 example: "1001010001"
 *                 description: 사업자 번호
 *     responses:
 *       200:
 *         description: 세금계산서 배열
 */
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

/**
 * @swagger
 * /naver/naver_seller_info:
 *   post:
 *     tags:
 *       - Naver
 *     summary: 네이버 판매자 정보 조회
 *     description: 사업자 번호로 네이버 판매자 정보를 조회합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_number
 *             properties:
 *               business_number:
 *                 type: string
 *                 example: "1001010001"
 *                 description: 사업자 번호
 *     responses:
 *       200:
 *         description: 세금계산서 배열
 */
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

/**
 * @swagger
 * /naver/naver_vat_reports:
 *   post:
 *     tags:
 *       - Naver
 *     summary: 네이버 부가세 신고 내역 조회
 *     description: 사업자 번호로 네이버 부가세 신고 내역을 조회합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_number
 *             properties:
 *               business_number:
 *                 type: string
 *                 example: "1001010001"
 *                 description: 사업자 번호
 *     responses:
 *       200:
 *         description: 세금계산서 배열
 */
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

/**
 * @swagger
 * /zeropay/zeropay_merchant_info:
 *   post:
 *     tags:
 *       - ZeroPay
 *     summary: 제로페이 가맹점 정보 조회
 *     description: 사업자 번호로 제로페이 가맹점 정보를 조회합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_number
 *             properties:
 *               business_number:
 *                 type: string
 *                 example: "1001010001"
 *                 description: 사업자 번호
 *     responses:
 *       200:
 *         description: 세금계산서 배열
 */
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

/**
 * @swagger
 * /zeropay/zeropay_payment_history:
 *   post:
 *     tags:
 *       - ZeroPay
 *     summary: 제로페이 결제 내역 조회
 *     description: 사업자 번호로 제로페이 결제 내역을 조회합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_number
 *             properties:
 *               business_number:
 *                 type: string
 *                 example: "1001010001"
 *                 description: 사업자 번호
 *     responses:
 *       200:
 *         description: 세금계산서 배열
 */
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

/**
 * @swagger
 * /zeropay/zeropay_deposit_schedule:
 *   post:
 *     tags:
 *       - ZeroPay
 *     summary: 제로페이 입금 스케줄 조회
 *     description: 사업자 번호로 제로페이 입금 스케줄을 조회합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_number
 *             properties:
 *               business_number:
 *                 type: string
 *                 example: "1001010001"
 *                 description: 사업자 번호
 *     responses:
 *       200:
 *         description: 세금계산서 배열
 */
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
