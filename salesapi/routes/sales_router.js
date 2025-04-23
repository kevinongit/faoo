/**
 * @swagger
 * tags:
 *   name: sales_router.js
 *   description: 매출 관련 API
 */

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

  const off_sum_base = await off_collection
    .find({
      business_number: business_number,
      sale_date: {
        $gt: start_date,
        $lte: end_date,
      },
    })
    .toArray();
  const on_sum_base = await on_collection
    .find({
      business_number: business_number,
      sale_date: {
        $gt: start_date,
        $lte: end_date,
      },
    })
    .toArray();

  const sumList = off_sum_base.concat(on_sum_base);

  const start_dt = new Date(
    start_date.substring(0, 4),
    start_date.substring(4, 6) - 1,
    start_date.substring(6, 8)
  );
  const end_dt = new Date(
    end_date.substring(0, 4),
    end_date.substring(4, 6) - 1,
    end_date.substring(6, 8)
  );

  const result = sumList.reduce((acc, sales) => {
    const obj = acc.find((x) => x.sale_date == sales.sale_date);

    if (obj) {
      obj.sum_amt += Number(sales.sale_amt);
    } else {
      acc.push({
        sale_date: sales.sale_date,
        sum_amt: Number(sales.sale_amt),
      });
    }

    return acc;
  }, []);

  start_dt.setDate(start_dt.getDate() + 1);

  for (let dt = start_dt; dt <= end_dt; dt.setDate(dt.getDate() + 1)) {
    const date =
      dt.getFullYear() +
      String(dt.getMonth() + 1).padStart(2, "0") +
      String(dt.getDate()).padStart(2, "0");

    if (result.find((x) => x.sale_date === date)) {
      continue;
    }

    result.push({
      sale_date: date,
      sum_amt: null,
    });
  }

  return result;
}

/**
 * @swagger
 * /sales/last7daySales:
 *   post:
 *     tags:
 *       - sales_router.js
 *     summary: 최근 7일간 매출 조회
 *     description: 사업자 번호와 기준 날짜를 기준으로 최근 7일간 오프라인 및 온라인 매출을 조회합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_number
 *               - base_date
 *             properties:
 *               business_number:
 *                 type: string
 *                 example: "1001010001"
 *                 description: 사업자 번호
 *               base_date:
 *                 type: string
 *                 example: "20250423"
 *                 description: 기준 날짜 (YYYYMMDD)
 *     responses:
 *       200:
 *         description: 최근 7일 매출 데이터 배열
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result_7day:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sale_date:
 *                         type: string
 *                         description: 판매 날짜 (YYYYMMDD)
 *                       sum_amt:
 *                         type: number
 *                         nullable: true
 *                         description: 매출 합계
 */
router.post("/last7daySales", async (req, res) => {
  try {
    const { business_number, base_date } = req.body;
    const end_dt = new Date(
      base_date.substring(0, 4),
      base_date.substring(4, 6) - 1,
      base_date.substring(6, 8)
    );
    const end_date =
      end_dt.getFullYear() +
      String(end_dt.getMonth() + 1).padStart(2, "0") +
      String(end_dt.getDate()).padStart(2, "0");
    end_dt.setDate(end_dt.getDate() - 7);
    const start_date =
      end_dt.getFullYear() +
      String(end_dt.getMonth() + 1).padStart(2, "0") +
      String(end_dt.getDate()).padStart(2, "0");

    const result_7day = await getSalesData(
      business_number,
      start_date,
      end_date
    );

    const results = {
      result_7day: result_7day,
    };

    logger.info(
      `/last7daySales retrieved for business number: ${business_number} ${start_date}~${end_date} : ${result_7day.length}`
    );
    res.json(results);
  } catch (error) {
    logger.error("Error retrieving last7daySales:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /sales/daySales:
 *   post:
 *     tags:
 *       - sales_router.js
 *     summary: 특정 날짜 매출 조회
 *     description: 사업자 번호와 날짜를 기준으로 해당 날짜의 오프라인 및 온라인 매출 내역을 모두 조회합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_number
 *               - base_date
 *             properties:
 *               business_number:
 *                 type: string
 *                 example: "1001010001"
 *                 description: 사업자 번호
 *               base_date:
 *                 type: string
 *                 example: "20250423"
 *                 description: 조회 날짜 (YYYYMMDD)
 *     responses:
 *       200:
 *         description: 해당 날짜 매출 내역 배열
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result_day:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: 개별 판매 레코드
 */
router.post("/daySales", async (req, res) => {
  try {
    const { business_number, base_date } = req.body;
    const db = await connectToDatabase();
    const off_collection = db.collection("sales_offline_info");
    const on_collection = db.collection("sales_online_info");

    const off_sum_base = await off_collection
      .find({
        business_number: business_number,
        sale_date: {
          $eq: base_date,
        },
      })
      .toArray();
    const on_sum_base = await on_collection
      .find({
        business_number: business_number,
        sale_date: {
          $eq: base_date,
        },
      })
      .toArray();

    const result_day = off_sum_base.concat(on_sum_base);

    const results = {
      result_day: result_day,
    };

    logger.info(
      `/daySales retrieved for business number: ${business_number} ${base_date} : ${result_day.length}`
    );
    res.json(results);
  } catch (error) {
    logger.error("Error retrieving daySales:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * @swagger
 * /sales/weekSales:
 *   post:
 *     tags:
 *       - sales_router.js
 *     summary: 주간 매출 비교 조회
 *     description: 기준 날짜와 주 오프셋을 받아 해당 주, 1주 전, 1년 전 동일 주의 매출 데이터를 모두 조회합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_number
 *               - base_date
 *               - week_offset
 *             properties:
 *               business_number:
 *                 type: string
 *                 example: "1001010001"
 *               base_date:
 *                 type: string
 *                 example: "20250423"
 *               week_offset:
 *                 type: integer
 *                 description: 기준 주 오프셋 (0: 기준 주, 1: 다음 주, -1: 이전 주 등)
 *     responses:
 *       200:
 *         description: 기준, 1주 전, 1년 전 주간 매출 데이터
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result_base:
 *                   type: array
 *                 result_7day:
 *                   type: array
 *                 result_prevYear:
 *                   type: array
 */
router.post("/weekSales", async (req, res) => {
  try {
    const { business_number, base_date, week_offset } = req.body;
    const db = await connectToDatabase();
    const off_collection = db.collection("sales_offline_info");
    const on_collection = db.collection("sales_online_info");

    let base_dt = new Date(
      base_date.substring(0, 4),
      base_date.substring(4, 6) - 1,
      base_date.substring(6, 8)
    );
    base_dt = new Date(base_dt.setDate(base_dt.getDate() + week_offset * 7));

    // 기준일 주
    let base = new Date(base_dt);
    const week_base_end =
      base.getFullYear() +
      String(base.getMonth() + 1).padStart(2, "0") +
      String(base.getDate()).padStart(2, "0");
    base = new Date(base.setDate(base.getDate() - 7));
    const week_base_start =
      base.getFullYear() +
      String(base.getMonth() + 1).padStart(2, "0") +
      String(base.getDate()).padStart(2, "0");

    const result_base = await getSalesData(
      business_number,
      week_base_start,
      week_base_end
    );

    // 1주일 전
    base = new Date(base_dt);
    let week_7dayDate = new Date(base.setDate(base.getDate() - 7));
    const week_7day_end =
      week_7dayDate.getFullYear() +
      String(week_7dayDate.getMonth() + 1).padStart(2, "0") +
      String(week_7dayDate.getDate()).padStart(2, "0");
    week_7dayDate = new Date(base.setDate(base.getDate() - 7));
    const week_7day_start =
      week_7dayDate.getFullYear() +
      String(week_7dayDate.getMonth() + 1).padStart(2, "0") +
      String(week_7dayDate.getDate()).padStart(2, "0");

    const result_7day = await getSalesData(
      business_number,
      week_7day_start,
      week_7day_end
    );

    // 1년전
    base = new Date(base_dt);
    let week_prevYearDate = new Date(base.setFullYear(base.getFullYear() - 1));
    const week_prevYear_end =
      week_prevYearDate.getFullYear() +
      String(week_prevYearDate.getMonth() + 1).padStart(2, "0") +
      String(week_prevYearDate.getDate()).padStart(2, "0");
    week_prevYearDate = new Date(base.setDate(base.getDate() - 7));
    const week_prevYear_start =
      week_prevYearDate.getFullYear() +
      String(week_prevYearDate.getMonth() + 1).padStart(2, "0") +
      String(week_prevYearDate.getDate()).padStart(2, "0");

    const result_prevYear = await getSalesData(
      business_number,
      week_prevYear_start,
      week_prevYear_end
    );

    const results = {
      result_base: result_base,
      result_7day: result_7day,
      result_prevYear: result_prevYear,
    };

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
});

/**
 * @swagger
 * /sales/monthSales:
 *   post:
 *     tags:
 *       - sales_router.js
 *     summary: 월별 매출 데이터 조회
 *     description: 특정 사업자의 월별 매출 데이터(오프라인, 온라인 포함)를 조회합니다.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               business_number:
 *                 type: string
 *                 example: "1001010001"
 *               from_date:
 *                 type: string
 *                 description: 조회 시작 월 (YYYYMM)
 *                 example: "202501"
 *               to_date:
 *                 type: string
 *                 description: 조회 종료 월 (YYYYMM)
 *                 example: "202512"
 *     responses:
 *       200:
 *         description: 월별 매출 데이터 배열
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sale_month:
 *                     type: string
 *                   sum_amt:
 *                     type: number
 *                   off_amt:
 *                     type: number
 *                   on_amt:
 *                     type: number
 */
router.post("/monthSales", async (req, res) => {
  try {
    const { business_number, from_date, to_date } = req.body;
    let start_date =
      new Date().getFullYear() +
      String(new Date().getMonth() + 1).padStart(2, "0") +
      "01";
    let end_date =
      new Date().getFullYear() +
      String(new Date().getMonth() + 1).padStart(2, "0") +
      "31";

    if (from_date != null && /^\d{4}\d{2}$/.test(from_date)) {
      start_date = from_date + "01";
    }

    if (to_date != null && /^\d{4}\d{2}$/.test(to_date)) {
      end_date = to_date + "31";
    }

    const db = await connectToDatabase("chart_data");
    const off_collection = db.collection("sales_offline_info");
    const on_collection = db.collection("sales_online_info");

    const off_sum_base = await off_collection
      .find({
        business_number: business_number,
        sale_date: {
          $gte: start_date,
          $lte: end_date,
        },
      })
      .toArray();
    const on_sum_base = await on_collection
      .find({
        business_number: business_number,
        sale_date: {
          $gte: start_date,
          $lte: end_date,
        },
      })
      .toArray();

    off_sum_base.forEach((x) => (x.source = "offline"));
    on_sum_base.forEach((x) => (x.source = "online"));

    const sumList = off_sum_base.concat(on_sum_base);

    const result = sumList.reduce((acc, sales) => {
      const obj = acc.find((x) => {
        return sales.sale_date.startsWith(x.sale_month);
      });

      if (obj) {
        obj.sum_amt += Number(sales.sale_amt);
        if (sales.source === "offline") obj.off_amt += Number(sales.sale_amt);
        if (sales.source === "online") obj.on_amt += Number(sales.sale_amt);
      } else {
        acc.push({
          sale_month: sales.sale_date.substring(0, 6),
          sum_amt: Number(sales.sale_amt),
          off_amt: sales.source === "offline" ? Number(sales.sale_amt) : 0,
          on_amt: sales.source === "online" ? Number(sales.sale_amt) : 0,
        });
      }

      return acc;
    }, []);

    const start_dt = new Date(
      start_date.substring(0, 4),
      start_date.substring(4, 6) - 1,
      1
    );
    const end_dt = new Date(
      end_date.substring(0, 4),
      end_date.substring(4, 6) - 1,
      1
    );

    for (let dt = start_dt; dt <= end_dt; dt.setMonth(dt.getMonth() + 1)) {
      const date =
        dt.getFullYear() + String(dt.getMonth() + 1).padStart(2, "0");

      if (result.find((x) => x.sale_month === date)) {
        continue;
      }

      result.push({
        sale_month: date,
        sum_amt: 0,
        off_amt: 0,
        on_amt: 0,
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
});

/**
 * @swagger
 * /sales/totalSales:
 *   post:
 *     tags:
 *       - sales_router.js
 *     summary: 총 매출 조회
 *     description: 사업자 번호를 기준으로 전체 기간의 모든 오프라인 및 온라인 매출 레코드를 조회합니다.
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
 *         description: 전체 매출 레코드 배열
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
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

/**
 * @swagger
 * /sales/dailySalesDetail:
 *   post:
 *     tags:
 *       - sales_router.js
 *     summary: 일별 매출 상세 조회
 *     description: 특정 날짜의 매출을 성별, 연령대, 시간대, 플랫폼별로 집계하여 통계 정보를 제공합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_number
 *               - base_date
 *             properties:
 *               business_number:
 *                 type: string
 *                 example: "1001010001"
 *               base_date:
 *                 type: string
 *                 example: "20250423"
 *     responses:
 *       200:
 *         description: 일별 매출 통계 정보 객체
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post("/dailySalesDetail", async (req, res) => {
  try {
    const { business_number, base_date } = req.body;
    const db = await connectToDatabase("chart_data");
    const off_collection = db.collection("sales_offline_info");
    const on_collection = db.collection("sales_online_info");

    const off_sum_base = await off_collection
      .find({
        business_number: business_number,
        sale_date: {
          $eq: base_date,
        },
      })
      .toArray();
    const on_sum_base = await on_collection
      .find({
        business_number: business_number,
        sale_date: {
          $eq: base_date,
        },
      })
      .toArray();

    const sumList = off_sum_base.concat(on_sum_base);

    const day_sum = sumList.reduce(
      (acc, sales) => {
        if (sales.gender == "1") {
          ++acc.male;
        } else {
          ++acc.female;
        }

        ++acc[`age_${sales.age}`].cnt;
        acc[`age_${sales.age}`].amt += sales.sale_amt;

        ++acc[`time_${sales.sale_time}`].cnt;
        acc[`time_${sales.sale_time}`].amt += sales.sale_amt;

        const obj = acc.platform.find(
          (x) => x.platform_cd == sales.platform_cd
        );
        if (obj) {
          ++obj.cnt;
          obj.sum_amt += Number(sales.sale_amt);
        } else {
          acc.platform.push({
            platform_cd: sales.platform_cd,
            platform_nm: sales.platform_nm,
            cnt: 1,
            sum_amt: Number(sales.sale_amt),
          });
        }

        return acc;
      },
      {
        male: 0,
        female: 0,
        age_00: { cnt: 0, amt: 0 },
        age_10: { cnt: 0, amt: 0 },
        age_20: { cnt: 0, amt: 0 },
        age_30: { cnt: 0, amt: 0 },
        age_40: { cnt: 0, amt: 0 },
        age_50: { cnt: 0, amt: 0 },
        age_60: { cnt: 0, amt: 0 },
        age_70: { cnt: 0, amt: 0 },
        age_80: { cnt: 0, amt: 0 },
        age_90: { cnt: 0, amt: 0 },
        time_00: { cnt: 0, amt: 0 },
        time_01: { cnt: 0, amt: 0 },
        time_02: { cnt: 0, amt: 0 },
        time_03: { cnt: 0, amt: 0 },
        time_04: { cnt: 0, amt: 0 },
        time_05: { cnt: 0, amt: 0 },
        time_06: { cnt: 0, amt: 0 },
        time_07: { cnt: 0, amt: 0 },
        time_08: { cnt: 0, amt: 0 },
        time_09: { cnt: 0, amt: 0 },
        time_10: { cnt: 0, amt: 0 },
        time_11: { cnt: 0, amt: 0 },
        time_12: { cnt: 0, amt: 0 },
        time_13: { cnt: 0, amt: 0 },
        time_14: { cnt: 0, amt: 0 },
        time_15: { cnt: 0, amt: 0 },
        time_16: { cnt: 0, amt: 0 },
        time_17: { cnt: 0, amt: 0 },
        time_18: { cnt: 0, amt: 0 },
        time_19: { cnt: 0, amt: 0 },
        time_20: { cnt: 0, amt: 0 },
        time_21: { cnt: 0, amt: 0 },
        time_22: { cnt: 0, amt: 0 },
        time_23: { cnt: 0, amt: 0 },
        platform: [],
      }
    );

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
