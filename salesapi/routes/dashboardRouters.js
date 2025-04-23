const express = require("express");
const dashboardRouter = express.Router();
const { MongoClient, UnorderedBulkOperation } = require("mongodb");
//const { MONGODB_URI } = process.env;
const logger = require("../middleware/logger");

// MongoDB 연결 함수
async function connectToDatabase() {
  const client = new MongoClient("mongodb://localhost:27017/chart_data");
  await client.connect();
  return client.db();
}

/**
 * @swagger
 * /sales/month:
 *   post:
 *     tags:
 *       - Dashboard
 *     summary: 이번 달 온라인 & 오프라인 매출 조회
 *     description: 사업자 번호와 선택적 연도, 월을 받아 해당 월의 온라인 및 오프라인 매출 합계를 반환합니다.
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
 *               year:
 *                 type: integer
 *               month:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 월별 매출 응답
 */
// 이번 달 온라인 & 오프라인 매출 조회 API
dashboardRouter.post("/sales/month", async (req, res) => {
  try {
    const { business_number, year, month } = req.body;
    if (!business_number) {
      return res.status(400).json({ error: "Business number is required" });
    }

    const db = await connectToDatabase();

    let selectedMonth = undefined;
    if (year && month) {
      selectedMonth = `${year}${String(month).padStart(2, "0")}`;
    } else {
      const today = new Date();
      selectedMonth = `${today.getFullYear()}${String(
        today.getMonth() + 1
      ).padStart(2, "0")}`;
    }
    console.log(selectedMonth);

    // 온라인 & 오프라인 매출 데이터 가져오기
    const onlineSalesCollection = db.collection("sales_online_info");
    const offlineSalesCollection = db.collection("sales_offline_info");

    console.log(business_number, selectedMonth);
    const onlineSales = await onlineSalesCollection
      .find({
        business_number,
        sale_date: { $regex: `^${selectedMonth}` }, // 이번 달의 데이터만 필터링
      })
      .toArray();

    const offlineSales = await offlineSalesCollection
      .find({
        business_number,
        sale_date: { $regex: `^${selectedMonth}` },
      })
      .toArray();

    //console.log("onlineSales", onlineSales);
    //console.log("offlineSales", offlineSales);

    // 총 매출 계산
    const totalOnlineSales = onlineSales.reduce(
      (sum, sale) => sum + Number(sale.sale_amt),
      0
    );
    const totalOfflineSales = offlineSales.reduce(
      (sum, sale) => sum + Number(sale.sale_amt),
      0
    );

    console.log(totalOnlineSales, totalOfflineSales);
    const totalSales = totalOnlineSales + totalOfflineSales;

    logger.info(
      `/sales/month retrieved for business number: ${business_number} | Online: ${totalOnlineSales} | Offline: ${totalOfflineSales}`
    );

    res.json({
      business_number,
      select_month: selectedMonth,
      online_sales: totalOnlineSales,
      offline_sales: totalOfflineSales,
      total_sales: totalSales,
    });
  } catch (error) {
    logger.error("Error retrieving this month's sales data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /sales/comparison:
 *   post:
 *     tags:
 *       - Dashboard
 *     summary: 오늘, 어제, 이틀 전 및 작년 어제 매출 비교 조회
 *     description: 사업자 번호를 받아 오늘, 어제, 이틀 전 및 작년 어제의 온라인과 오프라인 매출 합계를 반환합니다.
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
 *     responses:
 *       200:
 *         description: 매출 비교 데이터 응답
 */
dashboardRouter.post("/sales/comparison", async (req, res) => {
  try {
    const { business_number } = req.body;
    if (!business_number) {
      return res.status(400).json({ error: "Business number is required" });
    }

    const db = await connectToDatabase();
    const salesOnlineCollection = db.collection("sales_online_info");
    const salesOfflineCollection = db.collection("sales_offline_info");

    // ✅ 오늘, 어제, 이틀 전 날짜 구하기 (YYYYMMDD 형식)
    const today = new Date();
    const todayStr = `${today.getFullYear()}${String(
      today.getMonth() + 1
    ).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}${String(
      yesterday.getMonth() + 1
    ).padStart(2, "0")}${String(yesterday.getDate()).padStart(2, "0")}`;

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = `${twoDaysAgo.getFullYear()}${String(
      twoDaysAgo.getMonth() + 1
    ).padStart(2, "0")}${String(twoDaysAgo.getDate()).padStart(2, "0")}`;

    console.log(
      `📅 Fetching sales for: ${twoDaysAgoStr}, ${yesterdayStr}, ${todayStr}`
    );

    // ✅ 한 번의 쿼리로 3일치 데이터 가져오기
    const onlineSales = await salesOnlineCollection
      .find({
        business_number,
        sale_date: { $in: [twoDaysAgoStr, yesterdayStr, todayStr] },
      })
      .toArray();

    const offlineSales = await salesOfflineCollection
      .find({
        business_number,
        sale_date: { $in: [twoDaysAgoStr, yesterdayStr, todayStr] },
      })
      .toArray();

    const lastYearYesterday = new Date(yesterday);
    lastYearYesterday.setFullYear(lastYearYesterday.getFullYear() - 1);
    const lastYearYesterdayStr = `${lastYearYesterday.getFullYear()}${String(
      lastYearYesterday.getMonth() + 1
    ).padStart(2, "0")}${String(lastYearYesterday.getDate()).padStart(2, "0")}`;
    const lastYearOnlineSales = await salesOnlineCollection
      .find({ business_number, sale_date: lastYearYesterdayStr })
      .toArray();

    const lastYearOfflineSales = await salesOfflineCollection
      .find({ business_number, sale_date: lastYearYesterdayStr })
      .toArray();
    const totalLastYearOnlineSales = lastYearOnlineSales.reduce(
      (sum, sale) => sum + Number(sale.sale_amt),
      0
    );
    const totalLastYearOfflineSales = lastYearOfflineSales.reduce(
      (sum, sale) => sum + Number(sale.sale_amt),
      0
    );
    const totalLastYearSales =
      totalLastYearOnlineSales + totalLastYearOfflineSales;
    // 데이터를 날짜별로 분류하여 합산
    const salesData = {
      two_days_ago_sales: 0,
      yesterday_sales: 0,
      today_sales: 0,
      yesterday_lastyear: 0,
    };

    console.log("totalLastYearSales", totalLastYearSales);
    salesData.yesterday_lastyear = totalLastYearSales;

    [...onlineSales, ...offlineSales].forEach((sale) => {
      const saleDate = sale.sale_date;
      const saleAmount = Number(sale.sale_amt);

      if (saleDate === todayStr) {
        salesData.today_sales += saleAmount;
      } else if (saleDate === yesterdayStr) {
        salesData.yesterday_sales += saleAmount;
      } else if (saleDate === twoDaysAgoStr) {
        salesData.two_days_ago_sales += saleAmount;
      }
    });

    // ✅ 로그 기록
    logger.info(
      `/sales/daily retrieved for business number: ${business_number} | Two Days Ago: ${salesData.two_days_ago_sales} | Yesterday: ${salesData.yesterday_sales} | Today: ${salesData.today_sales}`
    );

    // ✅ 응답 반환
    res.json({
      business_number,
      ...salesData,
    });
  } catch (error) {
    logger.error("❌ Error retrieving daily sales data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /sales/daily:
 *   post:
 *     tags:
 *       - Dashboard
 *     summary: 특정 연도-월 일별 매출 요약 조회
 *     description: 사업자 번호, 연도, 월을 받아 해당 월의 날짜별 매출 합계를 반환합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_number
 *               - year
 *               - month
 *             properties:
 *               business_number:
 *                 type: string
 *                 example: "1001010001"
 *               year:
 *                 type: integer
 *               month:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 일별 매출 요약 응답
 */
dashboardRouter.post("/sales/daily", async (req, res) => {
  try {
    const { business_number, year, month } = req.body;
    if (!business_number || !year || !month) {
      return res
        .status(400)
        .json({ error: "Business number, year, and month are required" });
    }

    const db = await connectToDatabase();
    const salesOnlineCollection = db.collection("sales_online_info");
    const salesOfflineCollection = db.collection("sales_offline_info");

    // 요청받은 연도와 월을 `YYYYMM` 형식으로 변환
    const monthStr = `${year}${String(month).padStart(2, "0")}`;

    console.log(`📅 Fetching sales for: ${monthStr}`);

    //  해당 월의 데이터 조회 (온라인 & 오프라인 매출)
    const onlineSales = await salesOnlineCollection
      .find({ business_number, sale_date: { $regex: `^${monthStr}` } })
      .toArray();

    const offlineSales = await salesOfflineCollection
      .find({ business_number, sale_date: { $regex: `^${monthStr}` } })
      .toArray();

    // 데이터를 일별로 정리
    const dailySales = {};

    [...onlineSales, ...offlineSales].forEach((sale) => {
      const day = sale.sale_date.slice(-2); // YYYYMMDD에서 마지막 두 자리(일)만 추출
      const dateKey = `${year}-${String(month).padStart(2, "0")}-${day}`; // YYYY-MM-DD 형식으로 변환
      const saleAmount = Number(sale.sale_amt);

      if (!dailySales[dateKey]) {
        dailySales[dateKey] = 0;
      }
      dailySales[dateKey] += saleAmount;
    });

    console.log(`📊 Daily Sales Data:`, dailySales);

    // 로그 기록
    logger.info(
      `/sales/daily_summary retrieved for business number: ${business_number} | Year: ${year} | Month: ${month}`
    );

    //  응답 반환
    res.json({
      business_number,
      year,
      month,
      daily_sales: dailySales,
    });
  } catch (error) {
    logger.error("❌ Error retrieving daily sales summary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /sales/monthly_comparison:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: 이번 달과 전달 총 매출 비교 조회
 *     description: 사업자 번호를 쿼리 파라미터로 받아 이번 달과 전달의 총 매출 및 증감률을 반환합니다.
 *     parameters:
 *       - in: query
 *         name: business_number
 *         schema:
 *           type: string
 *           example: "1001010001"
 *         required: true
 *         description: 사업자 번호
 *     responses:
 *       200:
 *         description: 월별 매출 비교 응답
 */
// 이번달과 전달 총 매출 API
dashboardRouter.get("/sales/monthly_comparison", async (req, res) => {
  try {
    const { business_number } = req.query;

    // 현재 날짜 기준으로 이번달과 전달 구하기
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = String(today.getMonth() + 1).padStart(2, "0");

    // 전달 계산
    const prevDate = new Date(today);
    prevDate.setMonth(today.getMonth() - 1);
    const prevYear = prevDate.getFullYear();
    const prevMonth = String(prevDate.getMonth() + 1).padStart(2, "0");

    const db = await connectToDatabase("chart_data");
    const salesOnlineCollection = db.collection("sales_online_info");
    const salesOfflineCollection = db.collection("sales_offline_info");

    // 이번달 매출 조회
    const currentMonthStr = `${currentYear}${currentMonth}`;
    console.log("현재 조회 중인 월:", currentMonthStr);

    const currentMonthOnlineSales = await salesOnlineCollection
      .find({
        business_number,
        sale_date: { $regex: `^${currentMonthStr}` },
      })
      .toArray();

    const currentMonthOfflineSales = await salesOfflineCollection
      .find({
        business_number,
        sale_date: { $regex: `^${currentMonthStr}` },
      })
      .toArray();

    console.log("이번달 온라인 매출:", currentMonthOnlineSales);
    console.log("이번달 오프라인 매출:", currentMonthOfflineSales);

    // 전달 매출 조회
    const prevMonthStr = `${prevYear}${prevMonth}`;
    console.log("전달 조회 중인 월:", prevMonthStr);

    const prevMonthOnlineSales = await salesOnlineCollection
      .find({
        business_number,
        sale_date: { $regex: `^${prevMonthStr}` },
      })
      .toArray();

    const prevMonthOfflineSales = await salesOfflineCollection
      .find({
        business_number,
        sale_date: { $regex: `^${prevMonthStr}` },
      })
      .toArray();

    console.log("전달 온라인 매출:", prevMonthOnlineSales);
    console.log("전달 오프라인 매출:", prevMonthOfflineSales);

    // 매출 합계 계산
    const currentMonthTotal =
      currentMonthOnlineSales.reduce(
        (sum, sale) => sum + Number(sale.sale_amt),
        0
      ) +
      currentMonthOfflineSales.reduce(
        (sum, sale) => sum + Number(sale.sale_amt),
        0
      );

    const prevMonthTotal =
      prevMonthOnlineSales.reduce(
        (sum, sale) => sum + Number(sale.sale_amt),
        0
      ) +
      prevMonthOfflineSales.reduce(
        (sum, sale) => sum + Number(sale.sale_amt),
        0
      );

    // 전달 대비 증감률 계산
    const growthRate =
      prevMonthTotal === 0
        ? 100
        : (
            ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) *
            100
          ).toFixed(1);

    // 로그 기록
    logger.info(
      `/sales/monthly_comparison retrieved for business number: ${business_number}`
    );

    res.json({
      business_number,
      current_month: {
        year: Number(currentYear),
        month: Number(currentMonth),
        total: currentMonthTotal,
      },
      previous_month: {
        year: Number(prevYear),
        month: Number(prevMonth),
        total: prevMonthTotal,
      },
      growth_rate: Number(growthRate),
    });
  } catch (error) {
    logger.error("❌ Error retrieving monthly comparison:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = dashboardRouter;
