const mongoose = require("mongoose");

const sellerInfoSchema = new mongoose.Schema({
  business_number: { type: String, required: true, index: true }, // 사업자번호
  seller_id: String, // 판매자 ID
  store_name: String, // 스토어명
  representative_name: String, // 대표자명
  business_type: String, // 업종
  business_category: String, // 업태
  store_address: String, // 사업장 주소
  customer_service_contact: String, // 고객센터 연락처
  account_creation_date: Date, // 계정 생성일
  account_status: String, // 계정 상태
});

const vatReportSchema = new mongoose.Schema({
  business_number: { type: String, required: true, index: true }, // 사업자번호
  report_month: String, // 신고 년월
  total_sales: Number, // 총 매출액
  taxable_sales: Number, // 과세 매출액
  tax_exempt_sales: Number, // 면세 매출액
  vat_amount: Number, // 부가세액
  order_count: Number, // 주문 건수
  cancel_return_count: Number, // 취소/반품 건수
  commission: Number, // 수수료
  settlement_amount: Number, // 정산 금액
});

module.exports = {
  SellerInfo: mongoose.model("NaverStoreSellerInfo", sellerInfoSchema),
  VATReport: mongoose.model("NaverStoreVATReport", vatReportSchema),
};
