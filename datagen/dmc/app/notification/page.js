"use client";
import Navigation from "../components/Navigation";

export default function Notification() {
  // This would typically come from your backend or state management
  const notifications = [
    {
      id: 1,
      title: "데이터 생성 완료",
      message: "사업자번호 123-45-67890에 대한 데이터가 생성되었습니다.",
      time: "2024-03-20 14:30",
      read: false,
    },
    {
      id: 2,
      title: "데이터 비교 완료",
      message: "서울시 강남구의 IT업종 데이터 비교가 완료되었습니다.",
      time: "2024-03-20 13:15",
      read: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-xl font-semibold mb-4">알림</h2>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg ${
                      notification.read
                        ? "bg-gray-50 dark:bg-gray-700"
                        : "bg-indigo-50 dark:bg-indigo-900"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {notification.message}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {notification.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
