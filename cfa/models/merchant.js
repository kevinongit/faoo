const mongoose = require("mongoose");

const merchantSchema = new mongoose.Schema({
  merNo: String,
  merNm: String,
  bizNo: String,
  ceoNm: String,
  merTel: String,
  merZip: String,
  merAdr: String,
  merDtlAdr: String,
  merSts: String,
  merStsNm: String,
  bizSec: String,
  bizSecNm: String,
  indCd: String,
  indNm: String,
});

module.exports = mongoose.model("Merchant", merchantSchema);
