const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  merNo: String,
  aprNo: String,
  aprDt: String,
  cardNo: String,
  instMm: String,
  buyAmt: Number,
  vat: Number,
  buySts: String,
  buyStsNm: String,
  buyDt: String,
});

module.exports = mongoose.model("Purchase", purchaseSchema);
