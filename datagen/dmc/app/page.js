"use client";
import Navigation from "./components/Navigation";
import { useStore } from "./store";
import { useEffect } from "react";

export default function Home() {
  const { fetchUsers, users } = useStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dashboard Cards */}
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  사용자 정보
                </h3>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <p>총 사용자 수: {users.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  데이터 생성 상태
                </h3>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <p>최근 생성된 데이터를 확인하세요</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  알림
                </h3>
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <p>최근 알림을 확인하세요</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
