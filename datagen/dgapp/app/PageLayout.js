'use client';

import {useState} from "react";
import Navbar from "./components/Navbar";
import SystemFlow from "../components/ui/SystemFlow";

export default function PageLayout({children}) {
  const [showFlow, setShowFlow] = useState(true);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex flex-row h-[calc(100vh-64px)]">
        {/* 좌측: SystemFlow 영역 */}
        {showFlow && (
          <div className="relative w-2/5 border-r border-gray-300">
            <SystemFlow />
            {/* 토글 버튼 (우측 중앙 고정) */}
            <button
              onClick={() => setShowFlow(false)}
              className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 bg-gray-200 hover:bg-gray-300 p-2 rounded-l shadow"
              title="Hide Flow"
            >
              ◀
            </button>
          </div>
        )}

        {/* 좌측이 숨겨졌을 때 보여지는 버튼 */}
        {!showFlow && (
          <div className="relative">
            <button
              onClick={() => setShowFlow(true)}
              className="absolute top-1/2 -left-3 translate-y-[-50%] bg-gray-200 hover:bg-gray-300 p-2 rounded-r shadow z-10"
              title="Show Flow"
            >
              ▶
            </button>
          </div>
        )}

        {/* 우측: children 영역 (비율 자동 조정) */}
        <div className={`transition-all duration-300 ${showFlow ? "w-3/5" : "w-full"} p-4`}>
          {children}
        </div>
      </div>
    </div>
  );
}