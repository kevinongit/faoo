'use client';

import Image from 'next/image';
import dayjs from 'dayjs';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Bell, Store, PiggyBank, Calculator, Link } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export default function HomeDashboardPage() {
  const [baseDate, setBaseDate] = useState(dayjs());

  const startOfWeek = baseDate.startOf('week').add(1, 'day');
  const weekDays = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));

  const handlePrevWeek = () => {
    setBaseDate(prev => prev.subtract(7, 'day'));
  };

  const handleNextWeek = () => {
    setBaseDate(prev => prev.add(7, 'day'));
  };

  const today = dayjs().format('YYYY-MM-DD');
  const salesData = {
    // YYYY-MM-DD : 매출금액
    '2025-04-07': 850000 / 10000,
    '2025-04-08': 920000 / 10000,
    '2025-04-09': 1100000 / 10000,
    '2025-04-10': 980000 / 10000,
    '2025-04-11': 1170000 / 10000,
    '2025-04-12': 650000 / 10000,
    '2025-04-13': 400000 / 10000
  };

  const reviewChartData = [
    { name: '11월', value: 4.1 },
    { name: '12월', value: 4.3 },
    { name: '1월', value: 4.2 },
    { name: '2월', value: 4.5 },
    { name: '3월', value: 4.4 },
    { name: '4월', value: 4.5 }
  ];

  return (
    <div className="w-full px-4 py-4 text-sm text-gray-800">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <Image
            src="/images/cafe-thumb.png"
            alt="카페 썸네일"
            width={48}
            height={48}
            className="object-cover w-full h-full"
          />
        </div>
        <div>
          <div className="font-bold">카페 서울</div>
          <div className="text-xs text-gray-500">사업자번호: 123-45-67890</div>
        </div>
        <div className="ml-auto">
          <Bell className="w-[30px] h-[30px] text-gray-700" />
        </div>
      </div>

      {/* 배너 */}
      <div className="bg-[#EEF1FF] rounded-xl px-4 py-3 mb-4 flex items-center justify-between text-xs text-[#4A5CFB] font-medium">
        <div>
          <div>기업스마트뱅킹 이용하기</div>
          <div className="text-[#888] text-[10px] mt-1">
            다양한 매출리포트와 신용관리를 더 스마트 하게!
          </div>
        </div>
        <img src="/images/ibk-comp.png" alt="스마트뱅킹" className="w-8 h-8 ml-2 shrink-0" />
      </div>

      {/* 이번주 매출 현황 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>이번주 매출 현황</span>
          <span>3월 30일 ~ 4월 5일</span>
        </div>
        <div className="text-xl font-bold">₩4,850,000 <span className="text-green-500 text-sm">▲12%</span></div>
        <div className="w-full h-2 mt-2 bg-gray-200 rounded-full">
          <div className="h-full bg-[#4A5CFB] rounded-full" style={{ width: '60%' }}></div>
        </div>
      </div>

      {/* 주간 달력 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-2 text-sm font-bold">
          <button onClick={handlePrevWeek} className="text-gray-600 hover:text-blue-600">
            <ChevronLeft size={20} />
          </button>
          <div className="text-sm text-gray-800">
            {startOfWeek.format("YYYY년 M월")}
          </div>
          <button onClick={handleNextWeek} className="text-gray-600 hover:text-blue-600">
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {['월', '화', '수', '목', '금', '토', '일'].map((label) => (
            <div key={label} className="text-gray-500 font-medium">{label}</div>
          ))}
          {weekDays.map((dateObj) => {
            const formatted = dateObj.format('YYYY-MM-DD');
            const isToday = formatted === today;
            const sales = salesData[formatted];

            return (
              <div key={formatted} className={`py-2 rounded-xl ${isToday ? 'bg-[#EEF1FF]' : 'bg-white'}`}>
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 text-sm font-bold ${isToday ? 'text-[#4A5CFB]' : 'text-gray-700'}`}>
                  {dateObj.date()}
                </div>
                <div className="text-[11px] text-blue-500 font-medium">
                  {sales ? sales.toLocaleString() : '-'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4 text-sm text-center">
        <div className="grid grid-cols-2 divide-x divide-gray-200">
          {/* 이번달 매출 */}
          <div className="pr-4">
            <div className="text-gray-500 mb-1">이번달 매출</div>
            <div className="text-xl font-bold">₩32,450,000</div>
            <div className="text-green-600 text-xs mt-1">↑ 전월대비 8% ↑</div>
          </div>

          {/* 계좌 잔액 */}
          <div className="pl-4">
            <div className="text-gray-500 mb-1">사업용 계좌 잔액</div>
            <div className="text-xl font-bold">₩15,280,000</div>
            <div className="text-xs text-gray-500 mt-1">
              <span className="hover:underline cursor-pointer">사용계좌 설정</span>
              <span className="mx-1 text-gray-400">|</span>
              <span className="hover:underline cursor-pointer">입금계좌변경</span>
            </div>
          </div>
        </div>
      </div>

      {/* 네비게이션 버튼 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
        <div className="grid grid-cols-4 divide-x divide-gray-200 text-xs text-center text-gray-600">
          {[
            { label: "매장홍보", icon: <Store className="w-6 h-6 text-indigo-500" /> },
            { label: "금융", icon: <PiggyBank className="w-6 h-6 text-blue-500" /> },
            { label: "매출관리", icon: <Calculator className="w-6 h-6 text-purple-500" /> },
            { label: "연결관리", icon: <Link className="w-6 h-6 text-red-500" /> }
          ].map(({ label, icon }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-1">
              {icon}
              <div>{label}</div>
            </div>
          ))}
        </div>
      </div>


      {/* 리뷰 모니터링 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">리뷰 모니터링</span>
          <span className="text-xs text-blue-500 underline cursor-pointer">더보기</span>
        </div>
        <div className="flex justify-between text-center text-sm gap-2 mb-4">
          <div className="flex-1">
            <div className="font-bold text-lg">4.5</div>
            <div className="text-xs text-gray-500">평균 평점</div>
          </div>
          <div className="flex-1">
            <div className="font-bold text-lg">89%</div>
            <div className="text-xs text-gray-500">긍정 리뷰</div>
          </div>
          <div className="flex-1">
            <div className="font-bold text-lg">152</div>
            <div className="text-xs text-gray-500">전체 리뷰</div>
          </div>
        </div>

        <div className="mt-2 mb-2">
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={reviewChartData} margin={{ top: 10, right: 5, left: -30, bottom: 0 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} padding={{ left: 10, right: 10 }} />
              <YAxis domain={[3.5, 5]} ticks={[3.5, 4, 4.5, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#4A5CFB" strokeWidth={2} dot={true} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 진행중인 홍보 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold">진행중인 홍보</span>
          <span className="text-xs text-blue-500 underline">더보기</span>
        </div>
        <div className="flex bg-gray-100 rounded-xl p-2 items-center gap-3">
          <Image src="/images/americano.png" width={48} height={48} alt="아메리카노 쿠폰" className="rounded-md" />
          <div className="flex-1">
            <div className="text-sm font-bold">아메리카노 1+1 쿠폰</div>
            <div className="text-xs text-gray-500">사용 245/500장 · D-5</div>
          </div>
          <div className="text-sm text-blue-600 font-bold">49% 소진</div>
        </div>
      </div>

      {/* 금융 현황 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 pb-2 shadow-sm mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-semibold">금융 현황</span>
          <span className="text-xs text-[#4A5CFB] font-medium cursor-pointer">더보기</span>
        </div>
        <ul className="divide-y divide-gray-100">
          {[
            { label: "사업용 계좌 잔액", amount: "₩15,280,000" },
            { label: "대출금 현황", amount: "₩50,000,000" },
            {
              label: "금융자산 관리",
              subLabel: "데이터 연결 필요",
              action: "연결하기 >"
            },
            { label: "노란우산공제", amount: "₩12,800,000" }
          ].map((item, idx) => (
            <li key={idx} className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 rounded-md px-1">
              <div className="text-sm text-gray-600 leading-tight">
                <div>{item.label}</div>
                {item.subLabel && <div className="text-[11px] text-gray-500">{item.subLabel}</div>}
                {item.action && <div className="text-[11px] text-blue-500">{item.action}</div>}
              </div>
              <div className="flex items-center gap-2">
                {item.amount && <div className="text-sm font-bold text-gray-900">{item.amount}</div>}
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
