const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const { MONGO_SALES_URI } = process.env;
const logger = require("../middleware/logger");

// MongoDB 클라이언트 연결 함수
async function connectToDatabase() {
  const client = new MongoClient(MONGO_SALES_URI);
  await client.connect();
  return client.db();
}

router.post("/salesRanking", async (req, res) => {
  try {
    const results = {};
    const { business_number } = req.body;

    const db = await connectToDatabase();
    const business_collection = db.collection("business_info");
    const off_collection = db.collection("sales_offline_info");
    const on_collection = db.collection("sales_online_info");
    const business_info = await business_collection.findOne({ business_number: business_number});

    let now = new Date();
    now.setMonth(now.getMonth() - 1);

    // 지난달 1일부터 해당 지역구의 동일업종의 모든 매출데이터를 가져와서 집계를 별도처리
    let base_date = now.getFullYear() + String(now.getMonth() + 1).padStart(2, "0") + "01";

    const off_array = await off_collection.find({ where_cd: business_info.where_cd, kind_cd: business_info.kind_cd, sale_date: {
      $gte: base_date
    }}).toArray();

    const on_array = await on_collection.find({ where_cd: business_info.where_cd, kind_cd: business_info.kind_cd, sale_date: {
      $gte: base_date
    }}).toArray();

    const all_array = off_array.concat(on_array);

    now = new Date();
    now.setMonth(now.getMonth() - 1);
    const prevMonth = now.getFullYear() + String(now.getMonth() + 1).padStart(2, "0");

    now = new Date();
    now.setDate(now.getDate() - 1);
    const prevDay = now.getFullYear() + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0");

    now.setDate(now.getDate() - 6);
    const prevWeek = now.getFullYear() + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0");

    const all_info = all_array.reduce((acc, cur) => {
      // 전월 집계
      if (cur.sale_date.startsWith(prevMonth)) {
        const sum_info = acc.prevMonth.find(x => x.business_number == cur.business_number);

        if (sum_info) {
          sum_info.sum_amt += Number(cur.sale_amt);
          sum_info.list.push(cur);
        }else{
          acc.prevMonth.push({
            business_number: cur.business_number,
            sum_amt: Number(cur.sale_amt),
            list: [cur]
          })
        }
      }

      // 어제 집계
      if (cur.sale_date == prevDay) {
        const sum_info = acc.prevDay.find(x => x.business_number == cur.business_number);

        if (sum_info) {
          sum_info.sum_amt += Number(cur.sale_amt);
          sum_info.list.push(cur);
        }else{
          acc.prevDay.push({
            business_number: cur.business_number,
            sum_amt: Number(cur.sale_amt),
            list: [cur]
          })
        }
      // 주간 집계
      // }else if (Number(cur.sale_date) >= Number(prevWeek)) {
      //   const sum_info = acc.prevWeek.find(x => x.business_number == cur.business_number);

      //   if (sum_info) {
      //     sum_info.sum_amt += Number(cur.sale_amt);
      //     sum_info.list.push(cur);
      //   }else{
      //     acc.prevWeek.push({
      //       business_number: cur.business_number,
      //       sum_amt: Number(cur.sale_amt),
      //       list: [cur]
      //     })
      //   }
      }

      return acc;
    }, {prevMonth:[], prevWeek:[], prevDay:[]});

    const monthRank = all_info.prevMonth.reduce((acc, cur) => {
      if (cur.business_number == business_info.business_number) {
        acc.sum_amt = cur.sum_amt;
      }

      acc.list.push(cur.sum_amt);

      return acc;
    }, {sum_amt:"0", list:[]});

    // const weekRank = all_info.prevWeek.reduce((acc, cur) => {
    //   if (cur.business_number == business_info.business_number) {
    //     acc.sum_amt = cur.sum_amt;
    //   }

    //   acc.list.push(cur.sum_amt);

    //   return acc;
    // }, {sum_amt:"0", list:[]});

    const dayRank = all_info.prevDay.reduce((acc, cur) => {
      if (cur.business_number == business_info.business_number) {
        acc.sum_amt = cur.sum_amt;
      }

      acc.list.push(cur.sum_amt);

      return acc;
    }, {sum_amt:"0", list:[]});

    const monthRank_info = calculatePercentileRank(monthRank.list, monthRank.sum_amt);
    // const weekRank_info = calculatePercentileRank(weekRank.list, weekRank.sum_amt);
    const dayRank_info = calculatePercentileRank(dayRank.list, dayRank.sum_amt);

    const monthTot = monthRank.list.reduce((acc, cur) => {
      if (cur >= monthRank.sum_amt) {
        acc.monthUpper.push(cur);
      }else{
        acc.monthDown.push(cur);
      }
      return acc;
    },{monthUpper:[], monthDown:[]});

    const dayTot = dayRank.list.reduce((acc, cur) => {
      if (cur >= dayRank.sum_amt) {
        acc.dayUpper.push(cur);
      }else{
        acc.dayDown.push(cur);
      }
      return acc;
    },{dayUpper:[], dayDown:[]});

    results.monthInfo = monthRank_info;
    results.monthAmt = monthRank.sum_amt;
    results.dayInfo = dayRank_info;
    results.dayAmt = dayRank.sum_amt;
    results.where_nm = business_info.where_nm;
    results.kind_nm = business_info.kind_nm;
    results.base_date = base_date;

    logger.info(JSON.stringify(results));

    logger.info(
      `/salesRanking retrieved for business number: ${business_number}`
    );
    res.json(results);
  } catch (error) {
    logger.error("Error retrieving salesRanking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
})

function calculatePercentileRank(data, targetValue) {
  // 1️⃣ 내림차순 정렬
  const sortedData = [...data].sort((a, b) => b - a);

  // 2️⃣ 상위 몇 %인지 구하기
  const rank = sortedData.indexOf(targetValue) + 1; // 1-based rank
  const percentileRank = ((1 - (1 - (rank - 0.5) / sortedData.length)) * 100).toFixed(0);

  // 3️⃣ 전체 평균값 구하기
  const totalAvg = sortedData.reduce((sum, val) => sum + val, 0) / sortedData.length;

  const rateCnt = Math.floor(sortedData.length * 0.1);
  let top10Avg, top20Avg, top30Avg, top40Avg, top50Avg, top60Avg, top70Avg, top80Avg, top90Avg, topOthAvg;
  for (let i=0; i<10; i++) {
    logger.info(i*rateCnt + "  ===>   " + rateCnt);
    switch(i) {
      case 0: top10Avg = sortedData.slice(i*rateCnt, (i+1) * rateCnt).reduce((sum, val) => sum + val, 0) / rateCnt; break;
      case 1: top20Avg = sortedData.slice(i*rateCnt, (i+1) * rateCnt).reduce((sum, val) => sum + val, 0) / rateCnt; break;
      case 2: top30Avg = sortedData.slice(i*rateCnt, (i+1) * rateCnt).reduce((sum, val) => sum + val, 0) / rateCnt; break;
      case 3: top40Avg = sortedData.slice(i*rateCnt, (i+1) * rateCnt).reduce((sum, val) => sum + val, 0) / rateCnt; break;
      case 4: top50Avg = sortedData.slice(i*rateCnt, (i+1) * rateCnt).reduce((sum, val) => sum + val, 0) / rateCnt; break;
      case 5: top60Avg = sortedData.slice(i*rateCnt, (i+1) * rateCnt).reduce((sum, val) => sum + val, 0) / rateCnt; break;
      case 6: top70Avg = sortedData.slice(i*rateCnt, (i+1) * rateCnt).reduce((sum, val) => sum + val, 0) / rateCnt; break;
      case 7: top80Avg = sortedData.slice(i*rateCnt, (i+1) * rateCnt).reduce((sum, val) => sum + val, 0) / rateCnt; break;
      case 8: top90Avg = sortedData.slice(i*rateCnt, (i+1) * rateCnt).reduce((sum, val) => sum + val, 0) / rateCnt; break;
      case 9: topOthAvg = sortedData.slice(i*rateCnt).reduce((sum, val) => sum + val, 0) / sortedData.slice(i*rateCnt).length; break;
    }
  }

  return {
      percentileRank,
      top10Avg, top20Avg, top30Avg, top40Avg, top50Avg, top60Avg, top70Avg, top80Avg, top90Avg, topOthAvg,
      totalAvg
  };
}




module.exports = router;
