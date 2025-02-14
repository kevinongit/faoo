const express = require("express");
const router = express.Router();
const Purchase = require("../models/purchase");
const verifyToken = require("../middleware/auth");
const logger = require("../utils/logger");

router.post("/page", verifyToken, async (req, res, next) => {
  try {
    const { pageNo = 1, numOfRows = 10 } = req.body;
    const skip = (pageNo - 1) * numOfRows;

    const list = await Purchase.find().skip(skip).limit(numOfRows);
    const totCnt = await Purchase.countDocuments();

    logger.info(`Purchase data retrieved. Total count: ${totCnt}`);

    res.json({
      dataHeader: {
        resultCode: "00",
        resultMessage: "정상",
      },
      dataBody: {
        list,
        totCnt,
        pageNo,
        numOfRows,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
