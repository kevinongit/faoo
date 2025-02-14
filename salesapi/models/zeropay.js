const mongoose = require("mongoose");

const merchantInfoSchema = new mongoose.Schema({
  business_number: { type: String, required: true, index: true }, // 사업자번호
  merchant_id: String, // 가맹점 ID
  merchant_name: String, // 가맹점명
  representative_name: String, // 대표자명
  business_type: String, // 업종
  business_category: String, // 업태
  store_address: String, // 사업장 주소
  contact: String, // 연락처
  join_date: Date, // 가입일
  account_status: String, // 계정 상태
});

const paymentHistorySchema = new mongoose.Schema({
  business_number: { type: String, required: true, index: true }, // 사업자번호
  transaction_id: String, // 거래번호
  payment_date: Date, // 결제일시
  payment_amount: Number, // 결제금액
  discount_amount: Number, // 할인금액
  actual_payment_amount: Number, // 실제 결제금액
  payment_method: String, // 결제 수단
  customer_info: String, // 결제자 정보
  product_name: String, // 상품명
  transaction_status: String, // 거래 상태
});

const depositScheduleSchema = new mongoose.Schema({
  business_number: { type: String, required: true, index: true }, // 사업자번호
  scheduled_deposit_date: Date, // 입금예정일
  scheduled_deposit_amount: Number, // 입금예정금액
  transaction_count: Number, // 거래건수
  settlement_period: String, // 정산 기간
  fee: Number, // 수수료
  actual_deposit_amount: Number, // 실제 입금액
  deposit_account_info: String, // 입금 계좌 정보
  settlement_status: String, // 정산 상태
});

module.exports = {
  MerchantInfo: mongoose.model("ZeroPayMerchantInfo", merchantInfoSchema),
  PaymentHistory: mongoose.model("ZeroPayPaymentHistory", paymentHistorySchema),
  DepositSchedule: mongoose.model(
    "ZeroPayDepositSchedule",
    depositScheduleSchema
  ),
};
