const express = require("express");
const router = express.Router();
const SimplePnl = require("../models/SimplePnl");

//   /simple-pnl/*

// 월별 데이터 저장/업데이트
router.post("/save", async (req, res) => {
  try {
    const { business_number, year_month, inputs } = req.body;

    const result = await SimplePnl.findOneAndUpdate(
      { business_number, year_month },
      {
        business_number,
        year_month,
        inputs,
        updated_at: new Date(),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 특정 월 데이터 조회
router.post("/get", async (req, res) => {
  try {
    const { business_number, year_month } = req.body;

    const result = await SimplePnl.findOne({
      business_number,
      year_month,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 사업자번호별 전체 데이터 조회
router.post("/getAll", async (req, res) => {
  try {
    const { business_number } = req.body;

    const results = await SimplePnl.find({
      business_number,
    }).sort({ year_month: -1 }); // 최신 데이터부터 정렬

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;
