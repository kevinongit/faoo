"use client";
import Navigation from "../components/Navigation";
import { useState, useEffect } from "react";
import { Bell, Link2, Trash2 } from "lucide-react";
import { useStore } from "../store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Toaster } from "sonner";

export default function Setting() {
  const { users, fetchUsers } = useStore();
  const [settings, setSettings] = useState({
    notifications: true,
    resourceMappings: {
      bankingApp1: "none",
      bankingApp2: "none",
    },
  });
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResourceMapping = (resource, userId) => {
    setSettings((prev) => ({
      ...prev,
      resourceMappings: {
        ...prev.resourceMappings,
        [resource]: userId,
      },
    }));
  };

  const handleResetData = async () => {
    if (!selectedBusiness) {
      toast.error("초기화할 사업자를 선택해주세요.", {
        description: "사업자를 선택한 후 초기화를 진행해주세요.",
      });
      return;
    }

    const confirmMessage =
      selectedBusiness === "all"
        ? "전체 사업자의 데이터를 초기화 하시겠습니까?"
        : `'${
            users.find((u) => u.business_number === selectedBusiness)
              ?.merchant_name
          }' 사업자의 데이터를 초기화 하시겠습니까?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsResetting(true);
      const response = await fetch("http://localhost:3400/reset-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessNumber: selectedBusiness,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("데이터 초기화 완료", {
          description: data.message || "데이터가 성공적으로 초기화되었습니다.",
        });
        setSelectedBusiness("");
      } else {
        toast.error("데이터 초기화 실패", {
          description: data.message || "데이터 초기화 중 오류가 발생했습니다.",
        });
      }
    } catch (error) {
      console.error("Error resetting data:", error);
      toast.error("서버 연결 오류", {
        description:
          "서버와의 연결 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsResetting(false);
    }
  };

  // 현재 선택된 사용자 ID 목록
  const selectedUserIds = Object.values(settings.resourceMappings).filter(
    (id) => id !== "none"
  );

  // 각 리소스에 대해 사용 가능한 사용자 목록 필터링
  const getAvailableUsers = (currentResource) => {
    return users.filter((user) => {
      // 현재 리소스에서 선택된 사용자는 항상 포함
      if (settings.resourceMappings[currentResource] === user.bid) {
        return true;
      }
      // 다른 리소스에서 선택되지 않은 사용자만 포함
      return !selectedUserIds.includes(user.bid);
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Toaster
        position="bottom-center"
        richColors
        expand={true}
        closeButton={true}
        style={{ zIndex: 9999 }}
        toastOptions={{
          style: {
            background: "white",
            color: "black",
            border: "1px solid #e5e7eb",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            borderRadius: "0.5rem",
            padding: "1rem",
            minWidth: "300px",
          },
          success: {
            style: {
              background: "#f0fdf4",
              border: "1px solid #86efac",
            },
          },
          error: {
            style: {
              background: "#fef2f2",
              border: "1px solid #fecaca",
            },
          },
        }}
      />
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">설정</h2>
              </div>
              <div className="space-y-6">
                {/* Notification Settings */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                      월간 매출 업데이트 알림 자동 전송
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      월간 매출 데이터 생성 시 시스템에서 자동으로 사업장으로
                      카카오톡 알림을 전송합니다.
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

                {/* Resource Mapping */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Link2 className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-medium">리소스 매핑</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        뱅킹앱1
                      </label>
                      <Select
                        value={settings.resourceMappings.bankingApp1}
                        onValueChange={(value) =>
                          handleResourceMapping("bankingApp1", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="사용자 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">선택 안함</SelectItem>
                          {getAvailableUsers("bankingApp1").map((user) => (
                            <SelectItem key={user.bid} value={user.bid}>
                              {user.merchant_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        뱅킹앱2
                      </label>
                      <Select
                        value={settings.resourceMappings.bankingApp2}
                        onValueChange={(value) =>
                          handleResourceMapping("bankingApp2", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="사용자 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">선택 안함</SelectItem>
                          {getAvailableUsers("bankingApp2").map((user) => (
                            <SelectItem key={user.bid} value={user.bid}>
                              {user.merchant_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Data Reset */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Trash2 className="h-5 w-5 text-red-500" />
                    <h3 className="text-lg font-medium">데이터 초기화</h3>
                  </div>
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        사업자 선택
                      </label>
                      <Select
                        value={selectedBusiness}
                        onValueChange={setSelectedBusiness}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="초기화할 사업자를 선택해주세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem
                              key={user.business_number}
                              value={user.business_number}
                            >
                              {user.merchant_name}
                            </SelectItem>
                          ))}
                          <SelectItem value="all">전체 사업자</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <button
                      onClick={handleResetData}
                      disabled={isResetting || !selectedBusiness}
                      className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed h-10"
                    >
                      {isResetting ? "초기화 중..." : "데이터 초기화"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
