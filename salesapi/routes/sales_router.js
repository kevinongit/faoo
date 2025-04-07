const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const { MONGODB_URI } = process.env;
const logger = require("../middleware/logger");

// MongoDB 클라이언트 연결 함수
async function connectToDatabase(dbName) {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client.db(dbName);
}

async function getSalesData(business_number, start_date, end_date) {
  const db = await connectToDatabase("chart_data");
  const off_collection = db.collection("sales_offline_info");
  const on_collection = db.collection("sales_online_info");

  const off_sum_base = await off_collection.find({ business_number: business_number, sale_date: {
    $gt: start_date,
    $lte: end_date
  }}).toArray();
  const on_sum_base = await on_collection.find({ business_number: business_number, sale_date: {
    $gt: start_date,
    $lte: end_date
  }}).toArray();

  const sumList = off_sum_base.concat(on_sum_base);

  const start_dt = new Date(start_date.substring(0, 4), start_date.substring(4, 6) - 1, start_date.substring(6, 8));
  const end_dt = new Date(end_date.substring(0, 4), end_date.substring(4, 6) - 1, end_date.substring(6, 8));

  const result = sumList.reduce((acc, sales) => {
    const obj = acc.find(x => x.sale_date == sales.sale_date);

    if (obj) {
      obj.sum_amt += Number(sales.sale_amt);
    }else{
      acc.push({
        sale_date: sales.sale_date,
        sum_amt: Number(sales.sale_amt)
      })
    }

    return acc;
  }, []);

  start_dt.setDate(start_dt.getDate() + 1)

  for (let dt = start_dt; dt <= end_dt; dt.setDate(dt.getDate() + 1)) {
    const date = dt.getFullYear() + String(dt.getMonth() + 1).padStart(2, "0") + String(dt.getDate()).padStart(2, "0");

    if (result.find(x => x.sale_date === date)) {
      continue;
    }

    result.push({
      sale_date: date,
      sum_amt: null
    });
  }

  return result;
}

router.post("/last7daySales", async (req, res) => {
  try {
    const { business_number, base_date } = req.body;
    const end_dt = new Date(base_date.substring(0, 4), base_date.substring(4, 6) - 1, base_date.substring(6, 8));
    const end_date = end_dt.getFullYear() + String(end_dt.getMonth() + 1).padStart(2, "0") + String(end_dt.getDate()).padStart(2, "0");
    end_dt.setDate(end_dt.getDate() - 7);
    const start_date = end_dt.getFullYear() + String(end_dt.getMonth() + 1).padStart(2, "0") + String(end_dt.getDate()).padStart(2, "0");

    const result_7day = await getSalesData(business_number, start_date, end_date);

    const results = {
      result_7day: result_7day
    }

    logger.info(
      `/last7daySales retrieved for business number: ${business_number} ${start_date}~${end_date} : ${result_7day.length}`
    );
    res.json(results);
  } catch (error) {
    logger.error("Error retrieving last7daySales:", error);
    res.status(500).json({ error: "Internal server error" });
  }
})

router.post("/daySales", async (req, res) => {
  try {
    const { business_number, base_date } = req.body;
    const db = await connectToDatabase();
    const off_collection = db.collection("sales_offline_info");
    const on_collection = db.collection("sales_online_info");

    const off_sum_base = await off_collection.find({ business_number: business_number, sale_date: {
      $eq: base_date
    }}).toArray();
    const on_sum_base = await on_collection.find({ business_number: business_number, sale_date: {
      $eq: base_date
    }}).toArray();

    const result_day = off_sum_base.concat(on_sum_base);

    const results = {
      result_day: result_day
    }

    logger.info(
      `/daySales retrieved for business number: ${business_number} ${base_date} : ${result_day.length}`
    );
    res.json(results);
  } catch (error) {
    logger.error("Error retrieving daySales:", error);
    res.status(500).json({ error: "Internal server error" });
  }
})

router.post("/weekSales", async (req, res) => {
  try {
    const { business_number, base_date, week_offset } = req.body;
    const db = await connectToDatabase();
    const off_collection = db.collection("sales_offline_info");
    const on_collection = db.collection("sales_online_info");

    let base_dt = new Date(base_date.substring(0, 4), base_date.substring(4, 6) - 1, base_date.substring(6, 8));
    base_dt = new Date(base_dt.setDate(base_dt.getDate() + (week_offset * 7)));

    // 기준일 주
    let base = new Date(base_dt);
    const week_base_end = base.getFullYear() + String(base.getMonth() + 1).padStart(2, "0") + String(base.getDate()).padStart(2, "0");
    base = new Date(base.setDate(base.getDate() - 7));
    const week_base_start = base.getFullYear() + String(base.getMonth() + 1).padStart(2, "0") + String(base.getDate()).padStart(2, "0");

    const result_base = await getSalesData(business_number, week_base_start, week_base_end);

    // 1주일 전
    base = new Date(base_dt);
    let week_7dayDate = new Date(base.setDate(base.getDate() - 7));
    const week_7day_end = week_7dayDate.getFullYear() + String(week_7dayDate.getMonth() + 1).padStart(2, "0") + String(week_7dayDate.getDate()).padStart(2, "0");
    week_7dayDate = new Date(base.setDate(base.getDate() - 7));
    const week_7day_start = week_7dayDate.getFullYear() + String(week_7dayDate.getMonth() + 1).padStart(2, "0") + String(week_7dayDate.getDate()).padStart(2, "0");

    const result_7day = await getSalesData(business_number, week_7day_start, week_7day_end);

    // 1년전
    base = new Date(base_dt);
    let week_prevYearDate = new Date(base.setFullYear(base.getFullYear() - 1));
    const week_prevYear_end = week_prevYearDate.getFullYear() + String(week_prevYearDate.getMonth() + 1).padStart(2, "0") + String(week_prevYearDate.getDate()).padStart(2, "0");
    week_prevYearDate = new Date(base.setDate(base.getDate() - 7));
    const week_prevYear_start = week_prevYearDate.getFullYear() + String(week_prevYearDate.getMonth() + 1).padStart(2, "0") + String(week_prevYearDate.getDate()).padStart(2, "0");

    const result_prevYear = await getSalesData(business_number, week_prevYear_start, week_prevYear_end);

    const results = {
      result_base: result_base,
      result_7day: result_7day,
      result_prevYear: result_prevYear
    }

    logger.info(
      `/weekSales retrieved for business number: ${business_number}
       ${week_base_start} ~ ${week_base_end} : ${result_base.length}
       ${week_7day_start} ~ ${week_7day_end} : ${result_7day.length}
       ${week_prevYear_start} ~ ${week_prevYear_end} : ${result_prevYear.length}`
    );
    res.json(results);
  } catch (error) {
    logger.error("Error retrieving weekSales:", error);
    res.status(500).json({ error: "Internal server error" });
  }
})

router.post("/monthSales", async (req, res) => {
  try {
    const { business_number, from_date, to_date } = req.body;
    let start_date = new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, "0") + "01";
    let end_date = new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, "0") + "31";

    if (from_date != null && /^\d{4}\d{2}$/.test(from_date)) {
      start_date = from_date + "01";
    }

    if (to_date != null && /^\d{4}\d{2}$/.test(to_date)) {
      end_date = to_date + "31";
    }

    const db = await connectToDatabase("chart_data");
    const off_collection = db.collection("sales_offline_info");
    const on_collection = db.collection("sales_online_info");

    const off_sum_base = await off_collection.find({ business_number: business_number, sale_date: {
      $gte: start_date,
      $lte: end_date
    }}).toArray();
    const on_sum_base = await on_collection.find({ business_number: business_number, sale_date: {
      $gte: start_date,
      $lte: end_date
    }}).toArray();

    const sumList = off_sum_base.concat(on_sum_base);

    const result = sumList.reduce((acc, sales) => {
      const obj = acc.find(x => sales.sale_date.startsWith(x.sale_month));

      if (obj) {
        obj.sum_amt += Number(sales.sale_amt);
      }else{
        acc.push({
          sale_month: sales.sale_date.substring(0, 6),
          sum_amt: Number(sales.sale_amt)
        })
      }

      return acc;
    }, []);

    const start_dt = new Date(start_date.substring(0, 4), start_date.substring(4, 6) - 1, 1);
    const end_dt = new Date(end_date.substring(0, 4), end_date.substring(4, 6) - 1, 1);

    for (let dt = start_dt; dt <= end_dt; dt.setMonth(dt.getMonth() + 1)) {
      const date = dt.getFullYear() + String(dt.getMonth() + 1).padStart(2, "0");

      if (result.find(x => x.sale_month === date)) {
        continue;
      }

      result.push({
        sale_date: date,
        sum_amt: 0
      });
    }

    logger.info(
      `/monthSales retrieved for business number: ${business_number} ${from_date}~${end_date} : ${result.length}`
    );
    res.json(result);
  } catch (error) {
    logger.error("Error retrieving monthSales:", error);
    res.status(500).json({ error: "Internal server error" });
  }
})

router.post("/totalSales", async (req, res) => {
  try {
    const { business_number } = req.body;
    const db = await connectToDatabase();
    const off_collection = db.collection("sales_offline_info");
    const on_collection = db.collection("sales_online_info");

    const off_sum = await off_collection.find({ business_number }).toArray();
    const on_sum = await on_collection.find({ business_number }).toArray();

    const results = off_sum.concat(on_sum);

    logger.info(
      `/totalSales retrieved for business number: ${business_number} ${results.length}`
    );
    res.json(results);
  } catch (error) {
    logger.error("Error retrieving totalSales:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/dailySalesDetail", async (req, res) => {
  try {
    const { business_number, base_date } = req.body;
    const db = await connectToDatabase("chart_data");
    const off_collection = db.collection("sales_offline_info");
    const on_collection = db.collection("sales_online_info");

    const off_sum_base = await off_collection.find({ business_number: business_number, sale_date: {
      $eq: base_date
    }}).toArray();
    const on_sum_base = await on_collection.find({ business_number: business_number, sale_date: {
      $eq: base_date
    }}).toArray();

    const sumList = off_sum_base.concat(on_sum_base);

    const day_sum = sumList.reduce((acc, sales) => {
      if (sales.gender == "1") {
        ++acc.male;
      }else{
        ++acc.female;
      }

      ++acc[`age_${sales.age}`].cnt;
      acc[`age_${sales.age}`].amt += sales.sale_amt;

      ++acc[`time_${sales.sale_time}`].cnt;
      acc[`time_${sales.sale_time}`].amt += sales.sale_amt;

      const obj = acc.platform.find(x => x.platform_cd == sales.platform_cd);
      if (obj) {
        ++obj.cnt;
        obj.sum_amt += Number(sales.sale_amt);
      }else{
        acc.platform.push({ platform_cd: sales.platform_cd, platform_nm: sales.platform_nm, cnt: 1, sum_amt: Number(sales.sale_amt) });
      }

      return acc;
    }, {male: 0, female: 0, age_00: {cnt: 0, amt: 0}, age_10: {cnt: 0, amt: 0}, age_20: {cnt: 0, amt: 0}, age_30: {cnt: 0, amt: 0}, age_40: {cnt: 0, amt: 0}, age_50: {cnt: 0, amt: 0}, age_60: {cnt: 0, amt: 0}, age_70: {cnt: 0, amt: 0}, age_80: {cnt: 0, amt: 0}, age_90: {cnt: 0, amt: 0},
        time_00: {cnt: 0, amt: 0}, time_01: {cnt: 0, amt: 0}, time_02: {cnt: 0, amt: 0}, time_03: {cnt: 0, amt: 0}, time_04: {cnt: 0, amt: 0}, time_05: {cnt: 0, amt: 0}, time_06: {cnt: 0, amt: 0}, time_07: {cnt: 0, amt: 0}, time_08: {cnt: 0, amt: 0}, time_09: {cnt: 0, amt: 0}, time_10: {cnt: 0, amt: 0}, time_11: {cnt: 0, amt: 0}, time_12: {cnt: 0, amt: 0}, time_13: {cnt: 0, amt: 0}, time_14: {cnt: 0, amt: 0}, time_15: {cnt: 0, amt: 0}, time_16: {cnt: 0, amt: 0}, time_17: {cnt: 0, amt: 0}, time_18: {cnt: 0, amt: 0}, time_19: {cnt: 0, amt: 0}, time_20: {cnt: 0, amt: 0}, time_21: {cnt: 0, amt: 0}, time_22: {cnt: 0, amt: 0}, time_23: {cnt: 0, amt: 0},
        platform:[]});

    logger.info(
      `/dailySalesDetail retrieved for business number: ${business_number} ${base_date} : ${sumList.length}`
    );
    res.json(day_sum);
  } catch (error) {
    logger.error("Error retrieving totalSales:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
