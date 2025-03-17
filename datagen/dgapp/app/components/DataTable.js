"use client";

import "./DataTable.css";

// 고정된 필드와 한글 헤더 매핑 정의
const FIXED_FIELDS = {
  merchant: [
    { key: "merchant_name", header: "상호명" },
    { key: "biz_number", header: "사업자 번호" },
    { key: "merchant_address", header: "주소" },
    { key: "smb_sector", header: "업종" },
    { key: "deposit_bank", header: "입금 은행" },
    { key: "account_number", header: "계좌 번호" },
  ],
  approval: [
    { key: "approval_datetime", header: "승인 날짜" },
    { key: "approval_number", header: "승인 번호" },
    { key: "total_amount", header: "총 금액" },
    { key: "fee", header: "수수료" }, // 추가
    { key: "net_amount", header: "실수령액" }, // 추가
    { key: "card_type", header: "카드사" },
    { key: "transaction_type", header: "거래 유형" },
  ],
  acquisition: [
    { key: "acquisition_date", header: "매입 날짜" },
    { key: "total_amount", header: "총 금액" },
    { key: "total_fee", header: "총 수수료" }, // 추가
    { key: "net_amount", header: "실수령액" }, // 추가
    { key: "card_company", header: "카드사" },
  ],
  deposit: [
    { key: "deposit_date", header: "입금 날짜" },
    { key: "deposit_amount", header: "입금 금액" },
    { key: "fee", header: "수수료" }, // 추가
    { key: "bank", header: "은행명" },
    { key: "account_number", header: "계좌 번호" },
  ],
  baemin: [
    { key: "date", header: "판매 날짜" },
    { key: "total_sales_amount", header: "총 판매 금액" },
    { key: "total_fee", header: "총 수수료" }, // 추가
    { key: "settlement_amount", header: "정산 금액" },
    { key: "payment_due_date", header: "지급 기한" },
    { key: "payment_status", header: "지급 상태" },
  ],
  coupangeats: [
    { key: "date", header: "판매 날짜" },
    { key: "total_sales_amount", header: "총 판매 금액" },
    { key: "total_fee", header: "총 수수료" }, // 추가
    { key: "settlement_amount", header: "정산 금액" },
    { key: "payment_due_date", header: "지급 기한" },
    { key: "payment_status", header: "지급 상태" },
  ],
  yogiyo: [
    { key: "date", header: "판매 날짜" },
    { key: "total_sales_amount", header: "총 판매 금액" },
    { key: "total_fee", header: "총 수수료" }, // 추가
    { key: "settlement_amount", header: "정산 금액" },
    { key: "payment_due_date", header: "지급 기한" },
    { key: "payment_status", header: "지급 상태" },
  ],
  cash: [
    { key: "date", header: "발행 날짜" },
    { key: "total_cash_amount", header: "총 현금 금액" },
    { key: "total_issued_amount", header: "발행된 금액" },
    { key: "issued_count", header: "발행 건수" },
  ],
  tax: [
    { key: "date", header: "발행 날짜" },
    { key: "total_issued_amount", header: "총 발행 금액" },
    { key: "issued_count", header: "발행 건수" },
  ],
};

// 금액 필드 정의
const amountFields = [
  "supply_value",
  "vat",
  "total_amount",
  "deposit_amount",
  "fee", // 추가
  "net_amount", // 추가
  "total_sales_amount",
  "settlement_amount",
  "total_cash_amount",
  "total_issued_amount",
  "total_fee", // 추가
];

// 금액 포맷팅 함수
const formatValue = (value, header) => {
  if (amountFields.includes(header) && !isNaN(parseInt(value))) {
    return `${parseInt(value).toLocaleString("ko-KR")}원`;
  }
  return value !== undefined && value !== null ? String(value) : "N/A";
};

export default function DataTable({ data, title }) {
  if (!data || data.length === 0) return null;

  // sectionKey 계산 개선
  const sectionKey = title
    .toLowerCase()
    .replace("(mongo)", "")
    .trim()
    .split(" ")[0];

  console.log(`DataTable - title: ${title}, sectionKey: ${sectionKey}`); // 디버깅 로그

  const fields =
    FIXED_FIELDS[sectionKey] ||
    Object.keys(data[0]).map((key) => ({
      key,
      header: key.replace(/_/g, " "),
    }));

  // 데이터 변환: 고정된 필드만 추출
  const normalizedData = data.map((row) => {
    const newRow = {};
    fields.forEach(({ key }) => {
      newRow[key] = row[key];
    });
    return newRow;
  });

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2 text-gray-800">{title}</h3>
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border data-table">
          <thead className="bg-gray-100">
            <tr>
              {fields.map(({ key, header }) => (
                <th
                  key={key}
                  className="px-6 py-3 border text-left text-sm font-semibold text-gray-700"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {normalizedData.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {fields.map(({ key }) => (
                  <td
                    key={key}
                    className={`px-6 py-3 border text-sm text-gray-600 ${
                      amountFields.includes(key) ? "text-right" : ""
                    }`}
                  >
                    {formatValue(row[key], key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
