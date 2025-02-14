const mongoose = require("mongoose");

const salesInvoiceSchema = new mongoose.Schema({
  business_number: { type: String, required: true, index: true }, // 사업자번호
  issue_date: Date, // 작성일자
  supply_value: Number, // 공급가액
  tax_amount: Number, // 세액
  total_amount: Number, // 합계금액
  item_name: String, // 품목
  specification: String, // 규격
  quantity: Number, // 수량
  unit_price: Number, // 단가
  supplier_business_number: String, // 공급자 사업자등록번호
  supplier_name: String, // 공급자 상호
  receiver_business_number: String, // 공급받는자 사업자등록번호
  receiver_name: String, // 공급받는자 상호
});

const vatReportSchema = new mongoose.Schema({
  business_number: { type: String, required: true, index: true }, // 사업자번호
  tax_period: String, // 과세기간
  report_date: Date, // 신고일자
  report_type: String, // 신고구분
  tax_base: Number, // 과세표준
  sales_tax: Number, // 매출세액
  purchase_tax: Number, // 매입세액
  payment_tax: Number, // 납부세액
  report_status: String, // 신고상태
});

const vatDataSchema = new mongoose.Schema({
  business_number: { type: String, required: true, index: true }, // 사업자번호
  transaction_partner: String, // 거래처명
  partner_business_number: String, // 사업자번호
  supply_value: Number, // 공급가액
  tax_amount: Number, // 세액
  transaction_type: String, // 거래구분
  invoice_type: String, // 세금계산서 종류
  issue_date: Date, // 발행일자
  report_status: String, // 신고구분
});

const vatSummarySchema = new mongoose.Schema({
  business_number: { type: String, required: true, index: true }, // 사업자번호
  transaction_type: String, // 구분
  business_count: Number, // 사업자 수
  regular_taxable_supply: Number, // 일반과세자 공급가액
  regular_taxable_tax: Number, // 일반과세자 세액
  tax_exempt_supply: Number, // 면세사업자 공급가액
  total_amount: Number, // 총 합계금액
  invoice_amount: Number, // 세금계산서 발급금액
  credit_card_amount: Number, // 신용카드 매출전표 발행금액
  cash_receipt_amount: Number, // 현금영수증 발행금액
  others: Number, // 기타
});

module.exports = {
  SalesInvoice: mongoose.model("SalesInvoice", salesInvoiceSchema),
  VATReport: mongoose.model("VATReport", vatReportSchema),
  VATData: mongoose.model("VATData", vatDataSchema),
  VATSummary: mongoose.model("VATSummary", vatSummarySchema),
};
