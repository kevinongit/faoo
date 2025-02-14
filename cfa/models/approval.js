const mongoose = require("mongoose");

const approvalSchema = new mongoose.Schema({
  merNo: String,
  aprNo: String,
  aprDt: String,
  aprTm: String,
  cardNo: String,
  instMm: String,
  aprAmt: Number,
  vat: Number,
  aprSts: String,
  aprStsNm: String,
});

module.exports = mongoose.model("Approval", approvalSchema);
