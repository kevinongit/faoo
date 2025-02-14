const mongoose = require("mongoose");

const depositSchema = new mongoose.Schema({
  merNo: String,
  depDt: String,
  depAmt: Number,
  depSts: String,
  depStsNm: String,
  bankCd: String,
  bankNm: String,
  acctNo: String,
});

module.exports = mongoose.model("Deposit", depositSchema);
