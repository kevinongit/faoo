"use client";

import { useState, useEffect } from "react";
import { Button } from "./components/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/Select";
import { Input } from "./components/Input";
import Link from "next/link";

export default function NotifyPage({ users = [] }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [businessNumber, setBusinessNumber] = useState("");
  const [sender, setSender] = useState("admin");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [message, setMessage] = useState("");

  let templateId = 1;
  const templates = [
    {
      id: templateId++,
      title: "주간 매출 업데이트!",
      content:
        "$BUSINESS_NAME 사장님, 이번 주 매출 리포트가 도착했어요. 지금 확인해보세요!",
      buttonName: "리포트 보기",
      buttonUrl: "bapp1://sales/dashboard",
    },
    {
      id: templateId++,
      title: "월간 실적 업데이트",
      content:
        "$BUSINESS_NAME 사장님, 이번 달 실적이 정리됐습니다. 자세히 확인해보세요!",
      buttonName: "확인하기",
      buttonUrl: "bapp1://products",
    },
    {
      id: templateId++,
      title: "매출 상승 축하드려요!",
      content:
        "$BUSINESS_NAME 사장님, 이번 주 매출이 평균보다 높아요. 자세한 내용 여기서!",
      buttonName: "자세히 보기",
      buttonUrl: "https://example.com/deeplink/sales-increase",
    },
    {
      id: templateId++,
      title: "신용정보 새 소식",
      content:
        "$BUSINESS_NAME 사장님, 신용정보가 새로 업데이트됐어요. 확인해보세요!",
      buttonName: "업데이트 확인",
      buttonUrl: "https://example.com/deeplink/credit-update",
    },
    {
      id: templateId++,
      title: "이벤트 참여 초대",
      content:
        "$BUSINESS_NAME 사장님, 특별 이벤트에 초대합니다! 지금 참여해보세요!",
      buttonName: "참여하기",
      buttonUrl: "https://example.com/deeplink/event",
    },
  ];

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
        const selectedUser = users.find(
          (user) => user.bid === businessNumber // bid로 변경
        );
        const businessName = selectedUser
          ? selectedUser.merchant_name
          : "$BUSINESS_NAME";
        setMessage(template.content.replace("$BUSINESS_NAME", businessName));
      }
    }
  }, [selectedTemplate, businessNumber, users]);

  const sendNotification = async () => {
    if (!token || !businessNumber || !message) {
      alert("모든 필드를 채워주세요.");
      return;
    }
    setLoading(true);
    try {
      const template = templates.find((t) => t.title === selectedTemplate);
      const selectedUser = users.find(
        (user) => user.bid === businessNumber // bid로 변경
      );

      const payload = {
        to: selectedUser ? selectedUser.bid : businessNumber,
        from: sender,
        user: selectedUser || null,
        templateId: template.id,
        title: template.title,
        content: message,
        link_title: template.buttonName,
        link_uri: template.buttonUrl,
        sdata: {},
      };

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
      <Link href={template.buttonUrl} target="_blank">
        <Button className="mt-2 bg-blue-500 hover:bg-blue-600 text-white">
          {template.buttonName}
        </Button>
      </Link>
    );
  };
  // console.log(users);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">알림 설정</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              발신자
            </label>
            <Select onValueChange={setSender} value={sender} disabled>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="발신자를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">admin</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.bid} value={user.bid}>
                    {`${user.merchant_name} (${user.name}, ${user.business_number_dash}, ${user.smb_sector})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              수신자 (사업자)
            </label>
            <Select onValueChange={setBusinessNumber} value={businessNumber}>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메시지
            </label>
            <textarea
              className="w-full p-3 border rounded-md text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="메시지를 입력하세요"
            />
            {renderLinkButton()}
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <Button
            onClick={sendNotification}
            disabled={loading || !businessNumber || !selectedTemplate}
            className="w-full bg-primary hover:bg-blue-600 text-white disabled:bg-gray-400"
          >
            {loading ? "전송 중..." : "전송"}
          </Button>
          <Button
            onClick={resetForm}
            disabled={loading}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white"
          >
            초기화
          </Button>
        </div>
      </div>
    </div>
  );
}
