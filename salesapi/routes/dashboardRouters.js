const express = require("express");
const dashboardRouter = express.Router();
const {MongoClient} = require("mongodb");
//const { MONGODB_URI } = process.env;
const logger = require("../middleware/logger");

// MongoDB 연결 함수
async function connectToDatabase() {
  const client = new MongoClient("mongodb://localhost:27017/chart_data");
  await client.connect();
  return client.db();
}

// 이번 달 온라인 & 오프라인 매출 조회 API
dashboardRouter.post("/sales/month", async (req, res) => {
  try {
    const {business_number} = req.body;
    if (!business_number) {
      return res.status(400).json({error: "Business number is required"});
    }

    const db = await connectToDatabase();

    // 현재 연도 및 월 가져오기 (YYYYMM 형식)
    const today = new Date();
    const currentMonth = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}`;
    console.log(currentMonth);

    // 온라인 & 오프라인 매출 데이터 가져오기
    const onlineSalesCollection = db.collection("sales_online_info");
    const offlineSalesCollection = db.collection("sales_offline_info");

    console.log(business_number, currentMonth);
    const onlineSales = await onlineSalesCollection
      .find({
        business_number,
        sale_date: {$regex: `^${currentMonth}`} // 이번 달의 데이터만 필터링
      })
      .toArray();

    const offlineSales = await offlineSalesCollection
      .find({
        business_number,
        sale_date: {$regex: `^${currentMonth}`}
      })
      .toArray();

    //console.log("onlineSales", onlineSales);
    //console.log("offlineSales", offlineSales);

    // 총 매출 계산
    const totalOnlineSales = onlineSales.reduce((sum, sale) => sum + Number(sale.sale_amt), 0);
    const totalOfflineSales = offlineSales.reduce((sum, sale) => sum + Number(sale.sale_amt), 0);

    console.log(totalOnlineSales, totalOfflineSales);
    const totalSales = totalOnlineSales + totalOfflineSales;

    logger.info(
      `/sales/month retrieved for business number: ${business_number} | Online: ${totalOnlineSales} | Offline: ${totalOfflineSales}`
    );

    res.json({
      business_number,
      current_month: currentMonth,
      online_sales: totalOnlineSales,
      offline_sales: totalOfflineSales,
      total_sales: totalSales
    });
  } catch (error) {
    logger.error("Error retrieving this month's sales data:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

dashboardRouter.post("/sales/comparison", async (req, res) => {
  try {
    const {business_number} = req.body;
    if (!business_number) {
      return res.status(400).json({error: "Business number is required"});
    }

    const db = await connectToDatabase();
    const salesOnlineCollection = db.collection("sales_online_info");
    const salesOfflineCollection = db.collection("sales_offline_info");

    // ✅ 오늘, 어제, 이틀 전 날짜 구하기 (YYYYMMDD 형식)
    const today = new Date();
    const todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(
      today.getDate()
    ).padStart(2, "0")}`;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}${String(yesterday.getMonth() + 1).padStart(2, "0")}${String(
      yesterday.getDate()
    ).padStart(2, "0")}`;

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const twoDaysAgoStr = `${twoDaysAgo.getFullYear()}${String(twoDaysAgo.getMonth() + 1).padStart(2, "0")}${String(
      twoDaysAgo.getDate()
    ).padStart(2, "0")}`;

    console.log(`📅 Fetching sales for: ${twoDaysAgoStr}, ${yesterdayStr}, ${todayStr}`);

    // ✅ 한 번의 쿼리로 3일치 데이터 가져오기
    const onlineSales = await salesOnlineCollection
      .find({business_number, sale_date: {$in: [twoDaysAgoStr, yesterdayStr, todayStr]}})
      .toArray();

    const offlineSales = await salesOfflineCollection
      .find({business_number, sale_date: {$in: [twoDaysAgoStr, yesterdayStr, todayStr]}})
      .toArray();

    const lastYearYesterday = new Date(yesterday);
    lastYearYesterday.setFullYear(lastYearYesterday.getFullYear() - 1);
    const lastYearYesterdayStr = `${lastYearYesterday.getFullYear()}${String(lastYearYesterday.getMonth() + 1).padStart(
      2,
      "0"
    )}${String(lastYearYesterday.getDate()).padStart(2, "0")}`;
    const lastYearOnlineSales = await salesOnlineCollection
      .find({business_number, sale_date: lastYearYesterdayStr})
      .toArray();

    const lastYearOfflineSales = await salesOfflineCollection
      .find({business_number, sale_date: lastYearYesterdayStr})
      .toArray();
    const totalLastYearOnlineSales = lastYearOnlineSales.reduce((sum, sale) => sum + Number(sale.sale_amt), 0);
    const totalLastYearOfflineSales = lastYearOfflineSales.reduce((sum, sale) => sum + Number(sale.sale_amt), 0);
    const totalLastYearSales = totalLastYearOnlineSales + totalLastYearOfflineSales;
    // 데이터를 날짜별로 분류하여 합산
    const salesData = {
      two_days_ago_sales: 0,
      yesterday_sales: 0,
      today_sales: 0,
      yesterday_lastyear: 0
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
      ...salesData
    });
  } catch (error) {
    logger.error("❌ Error retrieving daily sales data:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

dashboardRouter.post("/sales/daily", async (req, res) => {
  try {
    const {business_number, year, month} = req.body;
    if (!business_number || !year || !month) {
      return res.status(400).json({error: "Business number, year, and month are required"});
    }

    const db = await connectToDatabase();
    const salesOnlineCollection = db.collection("sales_online_info");
    const salesOfflineCollection = db.collection("sales_offline_info");

    // 요청받은 연도와 월을 `YYYYMM` 형식으로 변환
    const monthStr = `${year}${String(month).padStart(2, "0")}`;

    console.log(`📅 Fetching sales for: ${monthStr}`);

    //  해당 월의 데이터 조회 (온라인 & 오프라인 매출)
    const onlineSales = await salesOnlineCollection
      .find({business_number, sale_date: {$regex: `^${monthStr}`}})
      .toArray();

    const offlineSales = await salesOfflineCollection
      .find({business_number, sale_date: {$regex: `^${monthStr}`}})
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
      daily_sales: dailySales
    });
  } catch (error) {
    logger.error("❌ Error retrieving daily sales summary:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

module.exports = dashboardRouter;
