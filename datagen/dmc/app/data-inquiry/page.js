"use client";

import {useState, useEffect} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "../../components/ui/card";
import {Button} from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../components/ui/select";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../../components/ui/tabs";
import {DGSV4_URL} from "../constants/api";
import DataTable from "../../components/DataTable";
import {useStore} from "../store";
import Navigation from "../components/Navigation";
import {Loader2, ChevronLeft, ChevronRight} from "lucide-react";
async function fetchMonthlySales(businessNumber, year, month) {
  try {
    const response = await fetch(
      `${DGSV4_URL}/get-monthly-sales?business_number=${businessNumber}&year=${year}&month=${month}`
    );
    const responseData = await response.json();
    console.log("Fetched monthly sales:", responseData);

    if (responseData.status === "success" && responseData.data) {
      // API 응답 구조 확인 및 처리
      const data = responseData.data;

      // 월별 데이터와 일별 데이터를 모두 반환
      return {
        // 월별 데이터 추출
        monthly: {
          business_number: data.business_number,
          year: data.year,
          month: data.month,
          total_sales: data.revenue || 0,
          online_sales: data.daily_sales
            ? data.daily_sales.reduce((sum, day) => sum + (day.platform_total || 0), 0)
            : 0,
          offline_sales: data.daily_sales
            ? data.daily_sales.reduce(
                (sum, day) => sum + (day.card_total || 0) + (day.cash_total || 0),
                0
              )
            : 0,
          transaction_count: data.daily_sales ? data.daily_sales.length : 0,
          average_sales:
            data.revenue && data.daily_sales
              ? Math.round(data.revenue / data.daily_sales.length)
              : 0,
          platform_sales: data.daily_sales
            ? {
                baemin: data.daily_sales.reduce(
                  (sum, day) => sum + (day.platform_detail?.baemin?.sales || 0),
                  0
                ),
                coupang: data.daily_sales.reduce(
                  (sum, day) => sum + (day.platform_detail?.coupangeats?.sales || 0),
                  0
                ),
                yogiyo: data.daily_sales.reduce(
                  (sum, day) => sum + (day.platform_detail?.yogiyo?.sales || 0),
                  0
                )
              }
            : {baemin: 0, coupang: 0, yogiyo: 0}
        },
        // 일별 데이터 그대로 저장
        daily: data.daily_sales || []
      };
    } else if (responseData.status === "error") {
      console.error("API error:", responseData.message);
      return null;
    } else {
      return responseData;
    }
  } catch (error) {
    console.error("Error fetching monthly sales:", error);
    return null;
  }
}

async function fetchDailySales(businessNumber, year, month) {
  try {
    const response = await fetch(
      `${DGSV4_URL}/get-daily-sales?business_number=${businessNumber}&year=${year}&month=${month}`
    );
    const responseData = await response.json();
    console.log("Fetched daily sales:", responseData);

    if (responseData.status === "success" && responseData.data) {
      return responseData.data;
    } else if (responseData.status === "error") {
      console.error("API error:", responseData.message);
      return null;
    } else {
      return responseData;
    }
  } catch (error) {
    console.error("Error fetching daily sales:", error);
    return null;
  }
}

async function fetchCardTransactions(businessNumber, date) {
  try {
    const response = await fetch(
      `${DGSV4_URL}/get-card-transactions?business_number=${businessNumber}&date=${date}`
    );
    const responseData = await response.json();
    console.log("Fetched card transactions:", responseData);

    if (responseData.status === "success" && responseData.data) {
      return responseData.data;
    } else if (responseData.status === "error") {
      console.error("API error:", responseData.message);
      return null;
    } else {
      return responseData;
    }
  } catch (error) {
    console.error("Error fetching card transactions:", error);
    return null;
  }
}

async function fetchBaeminTransactions(businessNumber, date) {
  try {
    const response = await fetch(
      `${DGSV4_URL}/get-baemin-transactions?business_number=${businessNumber}&date=${date}`
    );
    const responseData = await response.json();
    console.log("Fetched baemin transactions:", responseData);

    if (responseData.status === "success" && responseData.data) {
      return responseData.data;
    } else if (responseData.status === "error") {
      console.error("API error:", responseData.message);
      return null;
    } else {
      return responseData;
    }
  } catch (error) {
    console.error("Error fetching baemin transactions:", error);
    return null;
  }
}

async function fetchCoupangTransactions(businessNumber, date) {
  try {
    const response = await fetch(
      `${DGSV4_URL}/get-coupang-transactions?business_number=${businessNumber}&date=${date}`
    );
    const responseData = await response.json();
    console.log("Fetched coupang transactions:", responseData);

    if (responseData.status === "success" && responseData.data) {
      return responseData.data;
    } else if (responseData.status === "error") {
      console.error("API error:", responseData.message);
      return null;
    } else {
      return responseData;
    }
  } catch (error) {
    console.error("Error fetching coupang transactions:", error);
    return null;
  }
}

async function fetchYogiyoTransactions(businessNumber, date) {
  try {
    const response = await fetch(
      `${DGSV4_URL}/get-yogiyo-transactions?business_number=${businessNumber}&date=${date}`
    );
    const responseData = await response.json();
    console.log("Fetched yogiyo transactions:", responseData);

    if (responseData.status === "success" && responseData.data) {
      // 요기요 데이터 구조 처리
      const transactions = responseData.data.transactions || [];

      // 요기요 daily_sales_data 구조에 맞게 데이터 변환
      const formattedTransactions = transactions.map((transaction) => {
        // 요기요 데이터가 yogiyo.daily_sales_data 구조에 있는 경우
        if (transaction.yogiyo && transaction.yogiyo.daily_sales_data) {
          const yogiyoData = transaction.yogiyo.daily_sales_data;
          return {
            order_time: yogiyoData.transaction_time || yogiyoData.order_time || "",
            order_number: yogiyoData.order_number || yogiyoData.receipt_number || "",
            payment_method: yogiyoData.payment_method || "카드",
            delivery_fee: yogiyoData.delivery_fee || 0,
            discount_amount: yogiyoData.discount_amount || 0,
            total_amount: yogiyoData.total_amount || 0
          };
        }
        // 기존 형식의 데이터인 경우
        return {
          order_time: transaction.order_time || "",
          order_number: transaction.order_number || "",
          payment_method: transaction.payment_method || "",
          delivery_fee: transaction.delivery_fee || 0,
          discount_amount: transaction.discount_amount || 0,
          total_amount: transaction.total_amount || 0
        };
      });

      // 매출 통계 계산
      const total_sales = formattedTransactions.reduce((sum, t) => sum + t.total_amount, 0);
      const sales_stats = {
        order_count: formattedTransactions.length,
        total_sales: total_sales,
        avg_order_value:
          formattedTransactions.length > 0 ? total_sales / formattedTransactions.length : 0
      };

      return {
        transactions: formattedTransactions,
        sales_stats: sales_stats
      };
    } else if (responseData.status === "error") {
      console.error("API error:", responseData.message);
      return null;
    } else {
      return responseData;
    }
  } catch (error) {
    console.error("Error fetching yogiyo transactions:", error);
    return null;
  }
}

async function fetchCashTransactions(businessNumber, date) {
  try {
    const response = await fetch(
      `${DGSV4_URL}/get-cash-transactions?business_number=${businessNumber}&date=${date}`
    );
    const responseData = await response.json();
    console.log("Fetched cash transactions:", responseData);

    if (responseData.status === "success" && responseData.data) {
      return responseData.data;
    } else if (responseData.status === "error") {
      console.error("API error:", responseData.message);
      return null;
    } else {
      return responseData;
    }
  } catch (error) {
    console.error("Error fetching cash transactions:", error);
    return null;
  }
}

async function fetchUserInfo(businessNumber) {
  try {
    const response = await fetch(`${DGSV4_URL}/get-user-info?business_number=${businessNumber}`);
    const responseData = await response.json();
    console.log("Fetched user info:", responseData);

    // API가 { status: 'success', data: user } 형식으로 응답하는지 확인
    if (responseData.status === "success" && responseData.data) {
      return responseData.data;
    } else if (responseData.status === "error") {
      console.error("API error:", responseData.message);
      return null;
    } else {
      // 직접 응답 데이터를 반환하는 경우 (API 형식이 다른 경우)
      return responseData;
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
}

// async function fetchSubData(businessNumber, subData, page = 1, limit = 20) {
//   try {
//     const response = await fetch(
//       `${DGSV4_URL}/data-fetch-${subData}?business_number=${businessNumber}&page=${page}&limit=${limit}`
//     );
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error(`Error fetching ${subData} data:`, error);
//     return null;
//   }
// }

// 카드 거래 내역 모달 컴포넌트
function CardTransactionsModal({isOpen, onClose, transactions, loading, date}) {
  if (!isOpen) return null;

  // 모달 바깥 클릭 시 닫기 기능
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold">{date} 카드 거래 내역</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            ✕
          </button>
        </div>

        <div className="p-4 overflow-auto max-h-[calc(80vh-4rem)] text-sm">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            </div>
          ) : !transactions ? (
            <div className="text-center text-gray-500 py-8">
              거래 내역을 불러오는 중 오류가 발생했습니다.
            </div>
          ) : transactions.transactions && transactions.transactions.length > 0 ? (
            <div>
              <div className="mb-4 grid grid-cols-3 gap-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">승인 건수</p>
                  <p className="text-lg font-semibold">
                    {transactions.sales_stats?.approval_count || 0}건
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">입력 건수</p>
                  <p className="text-lg font-semibold">
                    {transactions.sales_stats?.acquisition_count || 0}건
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">입금 건수</p>
                  <p className="text-lg font-semibold">
                    {transactions.sales_stats?.deposit_count || 0}건
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">
                        승인 시간
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">
                        카드사
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">
                        승인번호
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">
                        거래 유형
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                        공급가액
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                        부가세
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                        총 금액
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.transactions.map((transaction, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                          {transaction.approval_datetime}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                          {transaction.card_type}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                          {transaction.approval_number}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                          {transaction.transaction_type === "offline" ? "오프라인" : "온라인"}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                          {transaction.supply_value.toLocaleString()}원
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                          {transaction.vat.toLocaleString()}원
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right font-semibold">
                          {transaction.total_amount.toLocaleString()}원
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 dark:bg-gray-700 font-bold">
                      <td
                        className="border border-gray-200 dark:border-gray-600 px-4 py-2"
                        colSpan="4">
                        총계
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                        {transactions.transactions
                          .reduce((sum, transaction) => sum + transaction.supply_value, 0)
                          .toLocaleString()}
                        원
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                        {transactions.transactions
                          .reduce((sum, transaction) => sum + transaction.vat, 0)
                          .toLocaleString()}
                        원
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                        {transactions.transactions
                          .reduce((sum, transaction) => sum + transaction.total_amount, 0)
                          .toLocaleString()}
                        원
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              해당 날짜의 카드 거래 내역이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 배달 플랫폼 거래 내역 모달 컴포넌트 (배민, 쿠팡이츠, 요기요 공통)
function DeliveryTransactionsModal({isOpen, onClose, transactions, loading, date, platform}) {
  if (!isOpen) return null;

  // 플랫폼별 한글 이름
  const platformName =
    {
      baemin: "배민",
      coupangeats: "쿠팡이츠",
      yogiyo: "요기요"
    }[platform] || platform;
    
  // 모달 바깥 클릭 시 닫기 기능
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {date} {platformName} 주문 내역
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            ✕
          </button>
        </div>

        <div className="p-4 overflow-auto max-h-[calc(80vh-4rem)] text-sm">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            </div>
          ) : !transactions ? (
            <div className="text-center text-gray-500 py-8">
              주문 내역을 불러오는 중 오류가 발생했습니다.
            </div>
          ) : transactions.transactions && transactions.transactions.length > 0 ? (
            <div>
              <div className="mb-4 grid grid-cols-3 gap-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">주문 건수</p>
                  <p className="text-lg font-semibold">
                    {transactions.sales_stats?.order_count || 0}건
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">총 매출액</p>
                  <p className="text-lg font-semibold">
                    {(transactions.sales_stats?.total_sales || 0).toLocaleString()}원
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">평균 주문금액</p>
                  <p className="text-lg font-semibold">
                    {Math.round(transactions.sales_stats?.avg_order_value || 0).toLocaleString()}원
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">
                        주문 시간
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">
                        주문번호
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">
                        결제방법
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                        배달비
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                        총 금액
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.transactions.map((transaction, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                          {transaction.order_time}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                          {transaction.order_number}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                          {transaction.payment_method}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                          {(transaction.delivery_fee || 0).toLocaleString()}원
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right font-semibold">
                          {(transaction.total_amount || 0).toLocaleString()}원
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 dark:bg-gray-700 font-bold">
                      <td
                        className="border border-gray-200 dark:border-gray-600 px-4 py-2"
                        colSpan="3">
                        총계
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                        {transactions.transactions
                          .reduce((sum, transaction) => sum + (transaction.delivery_fee || 0), 0)
                          .toLocaleString()}
                        원
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                        {transactions.transactions
                          .reduce((sum, transaction) => sum + (transaction.total_amount || 0), 0)
                          .toLocaleString()}
                        원
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              해당 날짜의 {platformName} 주문 내역이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 현금 거래 내역 모달 컴포넌트
function CashTransactionsModal({isOpen, onClose, transactions, loading, date}) {
  if (!isOpen) return null;

  // 모달 바깥 클릭 시 닫기 기능
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold">{date} 현금 거래 내역</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            ✕
          </button>
        </div>

        <div className="p-4 overflow-auto max-h-[calc(80vh-4rem)]">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            </div>
          ) : !transactions ? (
            <div className="text-center text-gray-500 py-8">
              거래 내역을 불러오는 중 오류가 발생했습니다.
            </div>
          ) : transactions.transactions && transactions.transactions.length > 0 ? (
            <div>
              <div className="mb-4 grid grid-cols-4 gap-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">거래 건수</p>
                  <p className="text-lg font-semibold">
                    {transactions.sales_stats?.transaction_count || 0}건
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">총 매출액</p>
                  <p className="text-lg font-semibold">
                    {(transactions.sales_stats?.total_sales || 0).toLocaleString()}원
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">영수증 발급</p>
                  <p className="text-lg font-semibold">
                    {(transactions.sales_stats?.issued_count || 0)}건
                  </p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">평균 거래금액</p>
                  <p className="text-lg font-semibold">
                    {Math.round(transactions.sales_stats?.avg_transaction || 0).toLocaleString()}원
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">
                        거래 시간
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">
                        영수증번호
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">
                        고객 정보
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left">
                        상태
                      </th>
                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                        총 금액
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.transactions.map((transaction, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                          {transaction.transaction_time}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                          {transaction.receipt_number}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                          {transaction.customer_id || '-'}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                          {transaction.status === 'issued' ? '발급완료' : transaction.status || '-'}
                        </td>
                        <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right font-semibold">
                          {transaction.total_amount.toLocaleString()}원
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 dark:bg-gray-700 font-bold">
                      <td
                        className="border border-gray-200 dark:border-gray-600 px-4 py-2"
                        colSpan="4">
                        총계
                      </td>
                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                        {transactions.transactions
                          .reduce((sum, transaction) => sum + transaction.total_amount, 0)
                          .toLocaleString()}
                        원
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              해당 날짜의 현금 거래 내역이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DataInquiryPage() {
  const {users, fetchUsers} = useStore();
  const [selectedUser, setSelectedUser] = useState("");
  const [overviewData, setOverviewData] = useState(null);
  const [subData, setSubData] = useState({});
  const [currentPage, setCurrentPage] = useState({});
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [userInfoLoading, setUserInfoLoading] = useState(false);

  // 월별 매출 정보 관련 상태
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [monthlySales, setMonthlySales] = useState(null);
  const [monthlySalesLoading, setMonthlySalesLoading] = useState(false);
  const [showMonthlyData, setShowMonthlyData] = useState(false);

  // 일별 매출 데이터 관련 상태
  const [dailySales, setDailySales] = useState([]);
  const [dailySalesLoading, setDailySalesLoading] = useState(false);

  // 거래 내역 모달 관련 상태
  const [showCardModal, setShowCardModal] = useState(false);
  const [cardTransactions, setCardTransactions] = useState(null);
  const [cardTransactionsLoading, setCardTransactionsLoading] = useState(false);

  // 배민 거래 내역 모달 관련 상태
  const [showBaeminModal, setShowBaeminModal] = useState(false);
  const [baeminTransactions, setBaeminTransactions] = useState(null);
  const [baeminTransactionsLoading, setBaeminTransactionsLoading] = useState(false);

  // 쿠팡이츠 거래 내역 모달 관련 상태
  const [showCoupangModal, setShowCoupangModal] = useState(false);
  const [coupangTransactions, setCoupangTransactions] = useState(null);
  const [coupangTransactionsLoading, setCoupangTransactionsLoading] = useState(false);

  // 요기요 거래 내역 모달 관련 상태
  const [showYogiyoModal, setShowYogiyoModal] = useState(false);
  const [yogiyoTransactions, setYogiyoTransactions] = useState(null);
  const [yogiyoTransactionsLoading, setYogiyoTransactionsLoading] = useState(false);

  // 현금 거래 내역 모달 관련 상태
  const [showCashModal, setShowCashModal] = useState(false);
  const [cashTransactions, setCashTransactions] = useState(null);
  const [cashTransactionsLoading, setCashTransactionsLoading] = useState(false);

  // 선택한 날짜 저장
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUserSelect = async (businessNumber) => {
    setSelectedUser(businessNumber);
    setOverviewData(null);
    setSubData({});
    setCurrentPage({});
    setUserInfo(null);
    
    // 매출정보 영역 초기화 및 숨기기
    setDailySales([]);
    setDailySalesLoading(false);
    setSelectedDate(""); // 선택된 날짜 초기화
    setShowMonthlyData(false); // 매출정보 영역 숨기기
    
    // 모달 상태 초기화
    setShowCardModal(false);
    setShowCashModal(false);
    setShowBaeminModal(false);
    setShowCoupangModal(false);
    setShowYogiyoModal(false);

    if (businessNumber) {
      setUserInfoLoading(true);
      try {
        const info = await fetchUserInfo(businessNumber);
        setUserInfo(info);
      } catch (error) {
        console.error("Error fetching user info:", error);
      } finally {
        setUserInfoLoading(false);
      }
    }
  };

  // 이전 월로 이동하는 함수
  const handlePrevMonth = () => {
    setMonthlySalesLoading(true);
    setDailySalesLoading(true);
    let newYear = selectedYear;
    let newMonth = selectedMonth - 1;

    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }

    setSelectedYear(newYear);
    setSelectedMonth(newMonth);

    // 월별 매출 정보 가져오기 (일별 데이터도 함께 가져옴)
    fetchMonthlySales(selectedUser, newYear, newMonth).then((data) => {
      if (data) {
        setMonthlySales(data.monthly);
        setDailySales(data.daily || []);
      } else {
        setMonthlySales(null);
        setDailySales([]);
      }
      setMonthlySalesLoading(false);
      setDailySalesLoading(false);
    });
  };

  // 다음 월로 이동하는 함수
  const handleNextMonth = () => {
    setMonthlySalesLoading(true);
    setDailySalesLoading(true);
    let newYear = selectedYear;
    let newMonth = selectedMonth + 1;

    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }

    setSelectedYear(newYear);
    setSelectedMonth(newMonth);

    // 월별 매출 정보 가져오기 (일별 데이터도 함께 가져옴)
    fetchMonthlySales(selectedUser, newYear, newMonth).then((data) => {
      if (data) {
        setMonthlySales(data.monthly);
        setDailySales(data.daily || []);
      } else {
        setMonthlySales(null);
        setDailySales([]);
      }
      setMonthlySalesLoading(false);
      setDailySalesLoading(false);
    });
  };

  const handleInquiry = async () => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      // Initialize sub-data for each category
      const categories = [
        "baemin",
        "coupangeats",
        "yogiyo",
        "card_sales",
        "cash_receipts",
        "tax_invoices"
      ];
      const initialSubData = {};
      const initialPages = {};

      setSubData(initialSubData);
      setCurrentPage(initialPages);

      // 월별 매출 정보와 일별 매출 데이터 함께 가져오기
      setMonthlySalesLoading(true);
      setDailySalesLoading(true);
      const salesData = await fetchMonthlySales(selectedUser, selectedYear, selectedMonth);

      if (salesData) {
        setMonthlySales(salesData.monthly);
        setDailySales(salesData.daily || []);
      } else {
        setMonthlySales(null);
        setDailySales([]);
      }

      setShowMonthlyData(true);
      setMonthlySalesLoading(false);
      setDailySalesLoading(false);
    } catch (error) {
      console.error("Error during data inquiry:", error);
    }
    setLoading(false);
  };

  // 카드 거래 내역 조회 함수
  const handleCardClick = async (date) => {
    if (!selectedUser || !date) return;

    setSelectedDate(date);
    setCardTransactionsLoading(true);
    setShowCardModal(true);

    try {
      const transactions = await fetchCardTransactions(selectedUser, date);
      setCardTransactions(transactions);
    } catch (error) {
      console.error("Error fetching card transactions:", error);
      setCardTransactions(null);
    } finally {
      setCardTransactionsLoading(false);
    }
  };

  // 배민 거래 내역 조회 함수
  const handleBaeminClick = async (date) => {
    if (!selectedUser || !date) return;

    setSelectedDate(date);
    setBaeminTransactionsLoading(true);
    setShowBaeminModal(true);

    try {
      const transactions = await fetchBaeminTransactions(selectedUser, date);
      setBaeminTransactions(transactions);
    } catch (error) {
      console.error("Error fetching baemin transactions:", error);
      setBaeminTransactions(null);
    } finally {
      setBaeminTransactionsLoading(false);
    }
  };

  // 쿠팡이츠 거래 내역 조회 함수
  const handleCoupangClick = async (date) => {
    if (!selectedUser || !date) return;

    setSelectedDate(date);
    setCoupangTransactionsLoading(true);
    setShowCoupangModal(true);

    try {
      const transactions = await fetchCoupangTransactions(selectedUser, date);
      setCoupangTransactions(transactions);
    } catch (error) {
      console.error("Error fetching coupang transactions:", error);
      setCoupangTransactions(null);
    } finally {
      setCoupangTransactionsLoading(false);
    }
  };

  // 요기요 거래 내역 조회 함수
  const handleYogiyoClick = async (date) => {
    if (!selectedUser || !date) return;

    setSelectedDate(date);
    setYogiyoTransactionsLoading(true);
    setShowYogiyoModal(true);

    try {
      const transactions = await fetchYogiyoTransactions(selectedUser, date);
      setYogiyoTransactions(transactions);
    } catch (error) {
      console.error("Error fetching yogiyo transactions:", error);
      setYogiyoTransactions(null);
    } finally {
      setYogiyoTransactionsLoading(false);
    }
  };

  // 현금 거래 내역 조회 함수
  const handleCashClick = async (date) => {
    if (!selectedUser || !date) return;

    setSelectedDate(date);
    setCashTransactionsLoading(true);
    setShowCashModal(true);

    try {
      const transactions = await fetchCashTransactions(selectedUser, date);
      setCashTransactions(transactions);
    } catch (error) {
      console.error("Error fetching cash transactions:", error);
      setCashTransactions(null);
    } finally {
      setCashTransactionsLoading(false);
    }
  };

  // 모달 닫기 함수
  const closeCardModal = () => {
    setShowCardModal(false);
    setCardTransactions(null);
    setSelectedDate("");
  };

  const closeBaeminModal = () => {
    setShowBaeminModal(false);
    setBaeminTransactions(null);
    setSelectedDate("");
  };

  const closeCoupangModal = () => {
    setShowCoupangModal(false);
    setCoupangTransactions(null);
    setSelectedDate("");
  };

  const closeYogiyoModal = () => {
    setShowYogiyoModal(false);
    setYogiyoTransactions(null);
    setSelectedDate("");
  };

  const closeCashModal = () => {
    setShowCashModal(false);
    setCashTransactions(null);
    setSelectedDate("");
  };

  const handleLoadMore = async (category) => {
    if (!selectedUser) return;

    const nextPage = (currentPage[category] || 1) + 1;
    const newData = await fetchSubData(selectedUser, category, nextPage);

    if (newData) {
      setSubData((prev) => ({
        ...prev,
        [category]: [...(prev[category] || []), ...newData]
      }));
      setCurrentPage((prev) => ({
        ...prev,
        [category]: nextPage
      }));
    }
  };

  const renderDataTable = (data, category) => {
    if (!data || data.length === 0) {
      return <div className="text-gray-500 text-center py-4">데이터가 없습니다.</div>;
    }

    return (
      <div className="space-y-4">
        <DataTable
          data={data}
          title={category}
        />
        <div className="flex justify-center">
          <Button
            onClick={() => handleLoadMore(category)}
            className="mt-4"
            disabled={loading}>
            더 보기
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Business Selection Section */}
          <div className="mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-medium whitespace-nowrap">데이터 조회</h3>
                <div className="flex w-4/5">
                  <Select
                    value={selectedUser}
                    onValueChange={(value) => {
                      console.log("Select onChange:", value);
                      handleUserSelect(value);
                    }}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="사업장을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {users &&
                        users.map((user) => (
                          <SelectItem
                            key={user.bid}
                            value={user.business_number}>
                            {user.merchant_name} ({user.business_number})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => handleInquiry()}
                  disabled={!selectedUser || loading}>
                  {loading ? "조회 중..." : "조회"}
                </Button>
              </div>

              {/* User Info Section */}
              {userInfoLoading ? (
                <div className="mt-6 flex justify-center items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                  <span>사용자 정보를 불러오는 중...</span>
                </div>
              ) : userInfo ? (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="text-md font-medium mb-3 border-b pb-2">사용자 정보</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 text-center">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">회사명</p>
                      <p className="font-medium">{userInfo.company || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">사업자번호</p>
                      <p className="font-medium">{userInfo.business_number || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">업종</p>
                      <p className="font-medium">{userInfo.smb_sector || "-"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">지역</p>
                      <p className="font-medium">{userInfo.zone_nm || "-"}</p>
                    </div>
                  </div>
                </div>
              ) : selectedUser ? (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center text-gray-500">
                  사용자 정보를 불러올 수 없습니다.
                </div>
              ) : null}

              {/* 월별 매출 정보 섹션 */}
              {showMonthlyData && (
                <div className="mt-6">
                  {monthlySalesLoading ? (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                      <span>매출 정보를 불러오는 중...</span>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <button
                          onClick={handlePrevMonth}
                          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <h4 className="text-lg font-medium">
                          {selectedYear}년 {selectedMonth}월 매출 정보
                        </h4>
                        <button
                          onClick={handleNextMonth}
                          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </div>

                      {monthlySales ? (
                        <div className="space-y-6">
                          {/* 일별 매출 테이블 */}
                          <div className="mt-6">
                            {dailySalesLoading ? (
                              <div className="flex justify-center items-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                                <span>일별 매출 데이터를 불러오는 중...</span>
                              </div>
                            ) : dailySales && dailySales.length > 0 ? (
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                  <thead className="text-sm">
                                    <tr className="bg-gray-100 dark:bg-gray-700">
                                      <th
                                        className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-left"
                                        rowSpan="2">
                                        날짜
                                      </th>
                                      <th
                                        className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right"
                                        rowSpan="2">
                                        카드
                                      </th>
                                      <th
                                        className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-center"
                                        colSpan="3">
                                        플랫폼
                                      </th>
                                      <th
                                        className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right"
                                        rowSpan="2">
                                        현금
                                      </th>
                                      <th
                                        className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right"
                                        rowSpan="2">
                                        합계
                                      </th>
                                    </tr>
                                    <tr className="bg-gray-100 dark:bg-gray-700">
                                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                                        배민
                                      </th>
                                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                                        쿠팡
                                      </th>
                                      <th className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                                        요기요
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {dailySales.map((day) => {
                                      // 날짜 파싱 (예: "2025-04-01")
                                      const dayDate = day.date ? day.date.split("-") : [];
                                      const dayNumber =
                                        dayDate.length === 3 ? parseInt(dayDate[2]) : 0;

                                      return (
                                        <tr
                                          key={day.date || Math.random()}
                                          className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                                            {day.date
                                              ? day.date
                                              : `${selectedYear}년 ${selectedMonth}월 ${dayNumber}일`}
                                          </td>
                                          <td
                                            className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right cursor-pointer hover:text-blue-600 hover:underline"
                                            onClick={() => handleCardClick(day.date)}
                                            title="카드 거래 내역 보기">
                                            {(
                                              day.card_total ||
                                              day.card_sales ||
                                              0
                                            ).toLocaleString()}
                                            원
                                          </td>
                                          <td
                                            className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right cursor-pointer hover:text-blue-600 hover:underline"
                                            onClick={() => handleBaeminClick(day.date)}
                                            title="배민 거래 내역 보기">
                                            {(
                                              day.platform_detail?.baemin?.sales ||
                                              day.baemin_sales ||
                                              0
                                            ).toLocaleString()}
                                            원
                                          </td>
                                          <td
                                            className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right cursor-pointer hover:text-blue-600 hover:underline"
                                            onClick={() => handleCoupangClick(day.date)}
                                            title="쿠팡이츠 거래 내역 보기">
                                            {(
                                              day.platform_detail?.coupangeats?.sales ||
                                              day.coupang_sales ||
                                              0
                                            ).toLocaleString()}
                                            원
                                          </td>
                                          <td
                                            className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right cursor-pointer hover:text-blue-600 hover:underline"
                                            onClick={() => handleYogiyoClick(day.date)}
                                            title="요기요 거래 내역 보기">
                                            {(
                                              day.platform_detail?.yogiyo?.sales ||
                                              day.yogiyo_sales ||
                                              0
                                            ).toLocaleString()}
                                            원
                                          </td>
                                          <td
                                            className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right cursor-pointer hover:text-blue-600 hover:underline"
                                            onClick={() => handleCashClick(day.date)}
                                            title="현금 거래 내역 보기">
                                            {(
                                              day.cash_total ||
                                              day.cash_sales ||
                                              0
                                            ).toLocaleString()}
                                            원
                                          </td>
                                          <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right font-bold">
                                            {(day.total || day.total_sales || 0).toLocaleString()}원
                                          </td>
                                        </tr>
                                      );
                                    })}
                                    {/* 합계 행 */}
                                    <tr className="bg-gray-100 dark:bg-gray-700 font-bold">
                                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-2">
                                        월 합계
                                      </td>
                                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                                        {dailySales
                                          .reduce(
                                            (sum, day) =>
                                              sum + (day.card_total || day.card_sales || 0),
                                            0
                                          )
                                          .toLocaleString()}
                                        원
                                      </td>
                                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                                        {dailySales
                                          .reduce(
                                            (sum, day) =>
                                              sum +
                                              (day.platform_detail?.baemin?.sales ||
                                                day.baemin_sales ||
                                                0),
                                            0
                                          )
                                          .toLocaleString()}
                                        원
                                      </td>
                                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                                        {dailySales
                                          .reduce(
                                            (sum, day) =>
                                              sum +
                                              (day.platform_detail?.coupangeats?.sales ||
                                                day.coupang_sales ||
                                                0),
                                            0
                                          )
                                          .toLocaleString()}
                                        원
                                      </td>
                                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                                        {dailySales
                                          .reduce(
                                            (sum, day) =>
                                              sum +
                                              (day.platform_detail?.yogiyo?.sales ||
                                                day.yogiyo_sales ||
                                                0),
                                            0
                                          )
                                          .toLocaleString()}
                                        원
                                      </td>
                                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                                        {dailySales
                                          .reduce(
                                            (sum, day) =>
                                              sum + (day.cash_total || day.cash_sales || 0),
                                            0
                                          )
                                          .toLocaleString()}
                                        원
                                      </td>
                                      <td className="border border-gray-200 dark:border-gray-600 px-4 py-2 text-right">
                                        {dailySales
                                          .reduce(
                                            (sum, day) => sum + (day.total || day.total_sales || 0),
                                            0
                                          )
                                          .toLocaleString()}
                                        원
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="text-center text-gray-500 py-4 bg-white dark:bg-gray-800 rounded-lg">
                                해당 월의 일별 매출 데이터가 없습니다.
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          해당 월의 매출 정보가 없습니다.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 카드 거래 내역 모달 */}
      <CardTransactionsModal
        isOpen={showCardModal}
        onClose={closeCardModal}
        transactions={cardTransactions}
        loading={cardTransactionsLoading}
        date={selectedDate}
      />

      {/* 배민 거래 내역 모달 */}
      <DeliveryTransactionsModal
        isOpen={showBaeminModal}
        onClose={closeBaeminModal}
        transactions={baeminTransactions}
        loading={baeminTransactionsLoading}
        date={selectedDate}
        platform="배민"
      />

      {/* 쿠팡이츠 거래 내역 모달 */}
      <DeliveryTransactionsModal
        isOpen={showCoupangModal}
        onClose={closeCoupangModal}
        transactions={coupangTransactions}
        loading={coupangTransactionsLoading}
        date={selectedDate}
        platform="쿠팡이츠"
      />

      {/* 요기요 거래 내역 모달 */}
      <DeliveryTransactionsModal
        isOpen={showYogiyoModal}
        onClose={closeYogiyoModal}
        transactions={yogiyoTransactions}
        loading={yogiyoTransactionsLoading}
        date={selectedDate}
        platform="요기요"
      />

      {/* 현금 거래 내역 모달 */}
      <CashTransactionsModal
        isOpen={showCashModal}
        onClose={closeCashModal}
        transactions={cashTransactions}
        loading={cashTransactionsLoading}
        date={selectedDate}
      />
    </div>
  );
}
