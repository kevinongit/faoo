"use client";
import Navigation from "../components/Navigation";
import { useState } from "react";

export default function Setting() {
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    autoRefresh: true,
    refreshInterval: 5,
  });

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-xl font-semibold mb-6">설정</h2>
              <div className="space-y-6">
                {/* Notification Settings */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      알림 받기
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      새로운 데이터 생성 시 알림을 받습니다.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleSettingChange(
                        "notifications",
                        !settings.notifications
                      )
                    }
                    className={`${
                      settings.notifications
                        ? "bg-indigo-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        settings.notifications
                          ? "translate-x-5"
                          : "translate-x-0"
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>

                {/* Dark Mode Settings */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      다크 모드
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      어두운 테마로 전환합니다.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleSettingChange("darkMode", !settings.darkMode)
                    }
                    className={`${
                      settings.darkMode
                        ? "bg-indigo-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        settings.darkMode ? "translate-x-5" : "translate-x-0"
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>

                {/* Auto Refresh Settings */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      자동 새로고침
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      데이터를 자동으로 새로고침합니다.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleSettingChange("autoRefresh", !settings.autoRefresh)
                    }
                    className={`${
                      settings.autoRefresh
                        ? "bg-indigo-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                  >
                    <span
                      className={`${
                        settings.autoRefresh ? "translate-x-5" : "translate-x-0"
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>

                {/* Refresh Interval Settings */}
                {settings.autoRefresh && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      새로고침 간격 (분)
                    </label>
                    <select
                      value={settings.refreshInterval}
                      onChange={(e) =>
                        handleSettingChange(
                          "refreshInterval",
                          parseInt(e.target.value)
                        )
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value={1}>1분</option>
                      <option value={5}>5분</option>
                      <option value={10}>10분</option>
                      <option value={30}>30분</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
