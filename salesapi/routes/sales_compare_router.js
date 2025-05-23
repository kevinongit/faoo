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
// MongoDB 클라이언트 연결 함수
async function connectToDB() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  return client;
}

/**
 * @swagger
 * /compareapi/salesRanking:
 *   post:
 *     tags:
 *       - sales_compare_router.js
 *     summary: 매출 순위 조회
 *     description: 사업자 번호와 월을 받아 해당 지역구 및 업종 내 매출 순위를 계산합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_number
 *               - month
 *             properties:
 *               business_number:
 *                 type: string
 *                 example: "1001010001"
 *                 description: 사업자 번호
 *               month:
 *                 type: string
 *                 example: "202504"
 *                 description: 기준 월 (YYYYMM)
 *     responses:
 *       200:
 *         description: 순위 및 통계 결과
 */
router.post("/salesRanking", async (req, res) => {
  try {
    const results = {};
    const { business_number, month } = req.body;

    const client = await connectToDB();
    const user_collection = client.db("fidb").collection("users");
    const off_collection = client
      .db("chart_data")
      .collection("sales_offline_info");
    const on_collection = client
      .db("chart_data")
      .collection("sales_online_info");
    const user_info = await user_collection.findOne({
      business_number: business_number,
    });

    // 지난달 1일부터 해당 지역구의 동일업종의 모든 매출데이터를 가져와서 집계를 별도처리
    const off_array = await off_collection
      .find({
        smb_sector: user_info.smb_sector,
        zone_nm: user_info.zone_nm,
        sale_date: {
          $gte: month + "01",
          $lte: month + "31",
        },
      })
      .toArray();

    const on_array = await on_collection
      .find({
        smb_sector: user_info.smb_sector,
        zone_nm: user_info.zone_nm,
        sale_date: {
          $gte: month + "01",
          $lte: month + "31",
        },
      })
      .toArray();

    const all_array = off_array.concat(on_array);

    const all_info = all_array.reduce((acc, cur) => {
      const sum_info = acc.find(
        (x) => x.business_number == cur.business_number
      );

      if (sum_info) {
        sum_info.sum_amt += Number(cur.sale_amt);
      } else {
        acc.push({
          business_number: cur.business_number,
          sum_amt: Number(cur.sale_amt),
        });
      }

      return acc;
    }, []);

    const sumList = all_info.map((x) => x.sum_amt);
    const user_sum_amt =
      all_info.find((x) => x.business_number == user_info.business_number)
        ?.sum_amt || 0;

    const monthRank_info = calculatePercentileRank(sumList, user_sum_amt);

    results.monthInfo = monthRank_info;
    results.monthAmt = user_sum_amt;
    results.smb_sector = user_info.smb_sector;
    results.zone_nm = user_info.zone_nm;
    results.base_date = month;

    logger.info(JSON.stringify(results));

    logger.info(
      `/salesRanking retrieved for business number: ${business_number}`
    );
    res.json(results);
  } catch (error) {
    logger.error("Error retrieving salesRanking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

function calculatePercentileRank(data, targetValue) {
  // 1️⃣ 내림차순 정렬
  const sortedData = [...data].sort((a, b) => b - a);

  // 2️⃣ 상위 몇 %인지 구하기
  const rank = sortedData.indexOf(targetValue) + 1; // 1-based rank
  const percentileRank = (
    (1 - (1 - (rank - 0.5) / sortedData.length)) *
    100
  ).toFixed(0);

  // 3️⃣ 전체 평균값 구하기
  const totalAvg =
    sortedData.reduce((sum, val) => sum + val, 0) / sortedData.length;

  const rateCnt = Math.floor(sortedData.length * 0.1);
  let top10Avg,
    top20Avg,
    top30Avg,
    top40Avg,
    top50Avg,
    top60Avg,
    top70Avg,
    top80Avg,
    top90Avg,
    topOthAvg;
  for (let i = 0; i < 10; i++) {
    logger.info(i * rateCnt + "  ===>   " + rateCnt);
    switch (i) {
      case 0:
        top10Avg =
          sortedData
            .slice(i * rateCnt, (i + 1) * rateCnt)
            .reduce((sum, val) => sum + val, 0) / rateCnt;
        break;
      case 1:
        top20Avg =
          sortedData
            .slice(i * rateCnt, (i + 1) * rateCnt)
            .reduce((sum, val) => sum + val, 0) / rateCnt;
        break;
      case 2:
        top30Avg =
          sortedData
            .slice(i * rateCnt, (i + 1) * rateCnt)
            .reduce((sum, val) => sum + val, 0) / rateCnt;
        break;
      case 3:
        top40Avg =
          sortedData
            .slice(i * rateCnt, (i + 1) * rateCnt)
            .reduce((sum, val) => sum + val, 0) / rateCnt;
        break;
      case 4:
        top50Avg =
          sortedData
            .slice(i * rateCnt, (i + 1) * rateCnt)
            .reduce((sum, val) => sum + val, 0) / rateCnt;
        break;
      case 5:
        top60Avg =
          sortedData
            .slice(i * rateCnt, (i + 1) * rateCnt)
            .reduce((sum, val) => sum + val, 0) / rateCnt;
        break;
      case 6:
        top70Avg =
          sortedData
            .slice(i * rateCnt, (i + 1) * rateCnt)
            .reduce((sum, val) => sum + val, 0) / rateCnt;
        break;
      case 7:
        top80Avg =
          sortedData
            .slice(i * rateCnt, (i + 1) * rateCnt)
            .reduce((sum, val) => sum + val, 0) / rateCnt;
        break;
      case 8:
        top90Avg =
          sortedData
            .slice(i * rateCnt, (i + 1) * rateCnt)
            .reduce((sum, val) => sum + val, 0) / rateCnt;
        break;
      case 9:
        topOthAvg =
          sortedData.slice(i * rateCnt).reduce((sum, val) => sum + val, 0) /
          sortedData.slice(i * rateCnt).length;
        break;
    }
  }

  return {
    percentileRank,
    top10Avg,
    top20Avg,
    top30Avg,
    top40Avg,
    top50Avg,
    top60Avg,
    top70Avg,
    top80Avg,
    top90Avg,
    topOthAvg,
    totalAvg,
  };
}

/**
 * @swagger
 * /compareapi/v2/salesRanking:
 *   post:
 *     tags:
 *       - sales_compare_router.js
 *     summary: 사업장 매출 순위 비교 정보 조회 (v2)
 *     description: 사업자번호와 월 정보를 기반으로 해당 업종의 매출 순위 비교 정보를 제공합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - business_number
 *               - month
 *             properties:
 *               business_number:
 *                 type: string
 *                 description: 사업자번호
 *                 example: "1001010001"
 *               month:
 *                 type: string
 *                 description: 월 정보 (YYYYMM 형식)
 *                 example: "202504"
 *     responses:
 *       200:
 *         description: 업종별 매출 순위 비교 정보
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post("/v2/salesRanking", async (req, res) => {
  try {
    const results = {};
    const { business_number, month } = req.body;

    const client = await connectToDB();
    const user_collection = client.db("fidb").collection("users");
    const user_info = await user_collection.findOne({
      business_number: business_number,
    });

    const comparison_groups_collection = client
      .db("analyzed")
      .collection("comparison_groups");
    const comparison_groups = await comparison_groups_collection.findOne({
      smb_sector: user_info.smb_sector,
    });

    res.json(comparison_groups);
  } catch (error) {
    logger.error("Error retrieving salesRanking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

function calculatePercentileRank(data, targetValue) {
  // 1️⃣ 내림차순 정렬
  const sortedData = [...data].sort((a, b) => b - a);

  // 2️⃣ 상위 몇 %인지 구하기
  const rank = sortedData.indexOf(targetValue) + 1; // 1-based rank
  const percentileRank = (
    (1 - (1 - (rank - 0.5) / sortedData.length)) *
    100
  ).toFixed(0);

  // 3️⃣ 전체 평균값 구하기
  const totalAvg =
    sortedData.reduce((sum, val) => sum + val, 0) / sortedData.length;

  const rateCnt = Math.floor(sortedData.length * 0.1);
  let top10Avg,
    top20Avg,
    top30Avg,
    top40Avg,
    top50Avg,
    top60Avg,
    top70Avg,
    top80Avg,
    top90Avg,
    topOthAvg;
  for (let i = 0; i < 10; i++) {
    logger.info(i * rateCnt + "  ===>   " + rateCnt);
    switch (i) {
      case 0:
        top10Avg =
          sortedData
            .slice(i * rateCnt, (i + 1) * rateCnt)
            .reduce((sum, val) => sum + val, 0) / rateCnt;
        break;
      case 1:
        top20Avg =
          sortedData
            .slice(i * rateCnt, (i + 1) * rateCnt)
            .reduce((sum, val) => sum + val, 0) / rateCnt;
        break;
      case 2:
        top30Avg =
          sortedData
            .slice(i * rateCnt, (i + 1) * rateCnt)
            .reduce((sum, val) => sum + val, 0) / rateCnt;
        break;
      case 3:
        top40Avg =
          sortedData
            .slice(i * rateCnt, (i + 1) * rateCnt)
            .reduce((sum, val) => sum + val, 0) / rateCnt;
        break;
      case 4:
        top50Avg =
          sortedData
            .slice(i * rateCnt, (i + 1) * rateCnt)
            .reduce((sum, val) => sum + val, 0) / rateCnt;
        break;
      case 5:
        top60Avg =
          sortedData
            .slice(i * rateCnt, (i + 1) * rateCnt)
            .reduce((sum, val) => sum + val, 0) / rateCnt;
        break;
      case 6:
        top70Avg =
          sortedData
            .slice(i * rateCnt, (i + 1) * rateCnt)
            .reduce((sum, val) => sum + val, 0) / rateCnt;
        break;
      case 7:
        top80Avg =
          sortedData
            .slice(i * rateCnt, (i + 1) * rateCnt)
            .reduce((sum, val) => sum + val, 0) / rateCnt;
        break;
      case 8:
        top90Avg =
          sortedData
            .slice(i * rateCnt, (i + 1) * rateCnt)
            .reduce((sum, val) => sum + val, 0) / rateCnt;
        break;
      case 9:
        topOthAvg =
          sortedData.slice(i * rateCnt).reduce((sum, val) => sum + val, 0) /
          sortedData.slice(i * rateCnt).length;
        break;
    }
  }

  return {
    percentileRank,
    top10Avg,
    top20Avg,
    top30Avg,
    top40Avg,
    top50Avg,
    top60Avg,
    top70Avg,
    top80Avg,
    top90Avg,
    topOthAvg,
    totalAvg,
  };
}

module.exports = router;
