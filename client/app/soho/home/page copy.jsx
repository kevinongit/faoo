"use client";

import {
  FaBell,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaStore,
  FaPiggyBank,
  FaCalculator,
  FaLink,
  FaArrowUp,
} from "react-icons/fa";

export default function NewHome() {
  return (
    <div className="bg-[#F3F5FC] min-h-screen">
      <div className="w-full max-w-[480px] md:max-w-full lg:max-w-full xl:max-w-full mx-auto pb-16 md:px-4 lg:px-8 xl:px-16">
        <header className="pt-4 pb-2 bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4 px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                <img
                  src="/images/cafe-profile.jpg"
                  alt="프로필"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="font-medium text-gray-900">카페 서울</h1>
                <p className="text-xs text-gray-500">
                  사업자번호: 123-45-67890
                </p>
              </div>
            </div>
            <button className="w-10 h-10 flex items-center justify-center text-gray-600">
              <FaBell className="text-xl" />
            </button>
          </div>
        </header>
        <section className="space-y-4 px-4">
          <div className="bg-[#E4F2FF] p-4 relative rounded-lg">
            <button className="absolute top-2 right-2 text-blue-600 hover:text-blue-800">
              <FaTimes />
            </button>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-blue-600 font-medium mb-2">
                  기업스마트뱅킹 이용하기
                </h3>
                <p className="text-blue-500 text-sm">
                  다양한 매출리포트와 신용관리를 더 스마트하게 !!
                </p>
              </div>
              <div className="flex-shrink-0 mr-5">
                <img
                  src="/images/ibk-comp.png"
                  className="w-12 h-12 rounded-lg"
                  alt="App icon"
                />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[30px] p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">이번주 매출 현황</h3>
              <p className="text-sm text-gray-500">3월 30일 ~ 4월 5일</p>
            </div>
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-lg font-bold">₩4,850,000</span>
                  <span className="text-xs text-green-500 mb-1">
                    <i className="fas fa-arrow-up"></i> 12%
                  </span>
                </div>
                <div className="bg-gray-100 h-2 rounded-full">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="bg-white rounded-[30px] p-4 shadow-sm"
            id="new-calendar"
          >
            <div className="flex items-center justify-between mb-4 relative">
              <button className="w-8 h-8 flex items-center justify-center text-gray-400 bg-white border border-gray-300 rounded-full shadow-sm hover:text-gray-600 hover:bg-gray-50 transition-colors">
                <FaChevronLeft className="text-sm" />
              </button>
              <h3 className="font-medium">2024년 4월</h3>
              <button className="w-8 h-8 flex items-center justify-center text-gray-400 bg-white border border-gray-300 rounded-full shadow-sm hover:text-gray-600 hover:bg-gray-50 transition-colors">
                <FaChevronRight className="text-sm" />
              </button>
            </div>
            <div
              className="grid grid-cols-7 gap-1 relative"
              style={{ borderRadius: "30px", padding: "12px" }}
            >
              <div className="text-center text-xs text-gray-500 font-medium">
                일
              </div>
              <div className="text-center text-xs text-gray-500 font-medium">
                월
              </div>
              <div className="text-center text-xs text-gray-500 font-medium">
                화
              </div>
              <div className="text-center text-xs text-gray-500 font-medium">
                수
              </div>
              <div className="text-center text-xs text-gray-500 font-medium">
                목
              </div>
              <div className="text-center text-xs text-gray-500 font-medium">
                금
              </div>
              <div className="text-center text-xs text-gray-500 font-medium">
                토
              </div>
              {[
                { day: "30", value: "65" },
                { day: "31", value: "80" },
                { day: "1", value: "95" },
                { day: "2", value: "120" },
                { day: "3", value: "85" },
                { day: "4", value: "75" },
                { day: "5", value: "90", isSelected: true },
              ].map((date, index) => (
                <div
                  key={index}
                  className={`text-center p-1 ${
                    date.isSelected ? "bg-indigo-100 rounded" : ""
                  }`}
                >
                  {date.day}
                  <div
                    className={`text-xs ${
                      date.isSelected ? "text-indigo-600" : "text-blue-500"
                    }`}
                  >
                    {date.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-4 rounded-[30px] shadow-sm">
            <div className="flex justify-between divide-x divide-gray-200 -mx-4">
              <div className="pl-4 pr-4">
                <p className="text-sm text-gray-500 mb-1">이번달 매출</p>
                <p className="text-lg font-bold">₩32,450,000</p>
                <div className="text-xs text-green-500 mt-1">
                  <FaArrowUp className="text-green-500" />{" "}
                  <span className="text-green-500">전월대비 8%↑</span>
                </div>
              </div>
              <div className="pl-4 pr-4">
                <p className="text-sm text-gray-500 mb-1">사업용 계좌 잔액</p>
                <p className="text-lg font-bold">₩15,280,000</p>
                <div className="text-xs text-gray-500 mt-1">
                  <div className="flex gap-2">
                    <span className="text-xs text-gray-500">사용계좌 설정</span>
                    <span className="text-xs text-gray-500">|</span>
                    <span className="text-xs text-gray-500">입금계좌변경</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-[30px] shadow-sm">
            <div className="w-full">
              <div className="grid grid-cols-4 gap-3 divide-x divide-gray-200">
                {[
                  {
                    Icon: FaStore,
                    color: "text-indigo-500",
                    text: "매장홍보",
                  },
                  { Icon: FaPiggyBank, color: "text-blue-500", text: "금융" },
                  {
                    Icon: FaCalculator,
                    color: "text-purple-500",
                    text: "매출관리",
                  },
                  { Icon: FaLink, color: "text-red-500", text: "연결관리" },
                ].map((item, index) => (
                  <a key={index} href="#" className="text-center">
                    <item.Icon className={`${item.color} text-xl mb-2`} />
                    <p className="text-xs">{item.text}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-[30px] p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">리뷰 모니터링</h3>
              <a href="#" className="text-indigo-500 text-sm">
                더보기
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
