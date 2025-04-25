"use client";
import Navigation from "../components/Navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Bell, Send, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useStore } from "../store";

export default function Notification() {
  const { users, fetchUsers, bankingAppMappings, loadBankingAppMappings } =
    useStore();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [businessNumber, setBusinessNumber] = useState("");
  const [sender, setSender] = useState("admin");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState([]);

  let templateId = 1;
  const templates = [
    {
      id: templateId++,
      title: "주간 매출 업데이트!",
      content:
        "$BUSINESS_NAME 사장님, 이번 주 매출 리포트가 도착했어요. 지금 확인해보세요!",
      buttonName: "리포트 보기",
      buttonUrl: "soho/home",
    },
    {
      id: templateId++,
      title: "월간 실적 업데이트",
      content:
        "$BUSINESS_NAME 사장님, 이번 달 실적이 정리됐습니다. 자세히 확인해보세요!",
      buttonName: "확인하기",
      buttonUrl: "soho/sales/dashboard",
    },
    {
      id: templateId++,
      title: "매출 상승 축하드려요!",
      content:
        "$BUSINESS_NAME 사장님, 이번 주 매출이 평균보다 높아요. 자세한 내용 여기서!",
      buttonName: "자세히 보기",
      buttonUrl: "soho/home",
    },
    {
      id: templateId++,
      title: "신용정보 새 소식",
      content:
        "$BUSINESS_NAME 사장님, 신용정보가 새로 업데이트됐어요. 확인해보세요!",
      buttonName: "업데이트 확인",
      buttonUrl: "soho/home",
    },
    {
      id: templateId++,
      title: "이벤트 참여 초대",
      content:
        "$BUSINESS_NAME 사장님, 특별 이벤트에 초대합니다! 지금 참여해보세요!",
      buttonName: "참여하기",
      buttonUrl: "soho/home",
    },
    {
      id: templateId++,
      title: "악성 리뷰 감지 알림",
      content:
        "$BUSINESS_NAME 사장님, 악성 리뷰가 감지되었습니다. 확인해보세요!",
      buttonName: "확인하기",
      buttonUrl: "soho/home",
    },
  ];

  useEffect(() => {
    fetchUsers();
    loadBankingAppMappings();
  }, [fetchUsers, loadBankingAppMappings]);

  useEffect(() => {
    const loginToChatServer = async () => {
      try {
        const response = await fetch("http://localhost:5200/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: "admin", password: "admin" }),
        });
        const data = await response.json();
        if (data.token) {
          setToken(data.token);
          console.log("Login successful, token:", data.token);
        } else {
          console.error("Login failed:", data);
        }
      } catch (error) {
        console.error("Error logging into chat server:", error);
      }
    };
    loginToChatServer();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find((t) => t.title === selectedTemplate);
      if (template) {
        const selectedUser = users.find((user) => user.bid === businessNumber);
        const businessName = selectedUser
          ? selectedUser.merchant_name
          : "$BUSINESS_NAME";
        setMessage(template.content.replace("$BUSINESS_NAME", businessName));
      }
    }
  }, [selectedTemplate, businessNumber]);

  const getBankingAppUrl = (businessNumber) => {
    console.log("Getting banking app URL for:", businessNumber);
    const user = users.find((u) => u.bid === businessNumber);
    if (!user) return "soho/";

    // 해당 사업자가 매핑된 뱅킹앱 찾기
    const app1Mapping = bankingAppMappings?.bankingApp1;
    const app2Mapping = bankingAppMappings?.bankingApp2;
    console.log("Banking app mappings:", bankingAppMappings);

    if (app1Mapping === businessNumber) {
      return "bapp1://";
    } else if (app2Mapping === businessNumber) {
      return "bapp2://";
    }

    return "soho/"; // 기본값으로 soho/ 반환
  };

  const sendNotification = async () => {
    if (!token || !businessNumber || !message) {
      alert("모든 필드를 채워주세요.");
      return;
    }
    setLoading(true);
    try {
      const template = templates.find((t) => t.title === selectedTemplate);
      const selectedUser = users.find((user) => user.bid === businessNumber);
      const bankingAppUrl = getBankingAppUrl(businessNumber);

      const payload = {
        to: selectedUser ? selectedUser.bid : businessNumber,
        from: sender,
        user: selectedUser || null,
        templateId: template.id,
        title: template.title,
        content: message,
        link_title: template.buttonName,
        link_uri: bankingAppUrl + template.buttonUrl,
        sdata: {},
      };
      console.log("Sending notification with payload:", payload);
      const response = await fetch("http://localhost:5200/api/k-notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert("알림이 성공적으로 전송되었습니다.");
        // Add the new notification to the list
        setNotifications([
          {
            id: Date.now(),
            title: template.title,
            message: message,
            time: new Date().toLocaleString(),
            read: false,
          },
          ...notifications,
        ]);
      } else {
        throw new Error("Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("알림 전송에 실패했습니다.");
    }
    setLoading(false);
  };

  const resetForm = () => {
    setBusinessNumber("");
    setSelectedTemplate("");
    setMessage("");
  };

  const renderLinkButton = () => {
    const template = templates.find((t) => t.title === selectedTemplate);
    if (!template) return null;
    return (
      <Button
        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white"
        onClick={() => window.open(template.buttonUrl, "_blank")}
      >
        {template.buttonName}
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Navigation />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 알림 전송 폼 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">알림 전송</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    발신자
                  </label>
                  <Select onValueChange={setSender} value={sender} disabled>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="발신자를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    수신자 (사업자)
                  </label>
                  <Select
                    onValueChange={setBusinessNumber}
                    value={businessNumber}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="사업자를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.bid} value={user.bid}>
                          {`${user.merchant_name} (${user.name}, ${user.business_number_dash}, ${user.smb_sector})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    템플릿 유형
                  </label>
                  <Select
                    onValueChange={setSelectedTemplate}
                    value={selectedTemplate}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="템플릿을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.title} value={template.title}>
                          {template.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    메시지
                  </label>
                  <textarea
                    className="w-full p-3 border rounded-md text-gray-600 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="메시지를 입력하세요"
                  />
                  {renderLinkButton()}
                </div>
                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={sendNotification}
                    disabled={loading || !businessNumber || !selectedTemplate}
                    className="w-full bg-primary hover:bg-blue-600 text-white disabled:bg-gray-400"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        전송 중...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        전송
                      </span>
                    )}
                  </Button>
                  <Button
                    onClick={resetForm}
                    disabled={loading}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    <span className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      초기화
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* 알림 목록 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">알림 목록</h2>
              </div>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg ${
                      notification.read
                        ? "bg-gray-50 dark:bg-gray-700"
                        : "bg-indigo-50 dark:bg-indigo-900/30"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        {notification.read ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-indigo-500" />
                        )}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {notification.title}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {notification.time}
                      </span>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>아직 알림이 없습니다.</p>
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
