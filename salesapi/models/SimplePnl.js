const mongoose = require("mongoose");

const SimplePnlSchema = new mongoose.Schema({
  business_number: {
    type: String,
    required: true,
  },
  year_month: {
    type: String,
    required: true,
  },
  inputs: {
    costOfSales: Number,
    rent: Number,
    labor: Number,
    utilities: Number,
    otherExpenses: Number,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// business_number와 year_month의 조합이 unique하도록 복합 인덱스 설정
SimplePnlSchema.index({ business_number: 1, year_month: 1 }, { unique: true });

module.exports = mongoose.model("SimplePnl", SimplePnlSchema, "simple_pnl");
