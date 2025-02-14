// app/profile/page.js
"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/lib/store/authStore";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const customer = {
    avatarUrl: "/users/admin.png",
    username: "김철수",

    nickname: "Romeoh",
    lastAccess: "2023년 12월 31일 23:59",
    englishName: "Cheolsu Kim",
    phone: "010-****-5678",
    email: "cheolsu@example.com",
    homeAddress: "서울특별시 강남구 테헤란로 123",
    homePhone: "02-****-4567",
    job: "개발자",
    company: "테크 주식회사",
    workAddress: "서울특별시 서초구 강남대로 456",
    workPhone: "",
    mailReceiveAddress: "직장",
    ...user,
  };

  const InfoItem = ({ label, value, isDimmed = false }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
      <span className="text-gray-500">{label}</span>
      <span className={isDimmed ? "text-gray-400" : ""}>{value || "-"}</span>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 space-y-6">
        <Card className="w-full">
          <CardContent className="flex flex-col items-center p-6 space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={customer.avatarUrl} alt={customer.username} />
              <AvatarFallback>{customer.username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex items-center">
              <h1 className="text-sm">{customer.nickname}</h1>
              <Button variant="ghost" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              마지막 접속: {customer.lastAccess}
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6 mt-10">
          <Card>
            <CardHeader>
              <CardTitle>기본정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <InfoItem label="이름" value={customer.username} />
              <InfoItem label="영문이름" value={customer.englishName} />
              <InfoItem label="휴대폰 번호" value={customer.phone} />
              <InfoItem label="이메일" value={customer.email} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>집정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <InfoItem label="주소" value={customer.homeAddress} />
              <InfoItem label="전화번호" value={customer.homePhone} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>직장정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <InfoItem label="직업" value={customer.job} />
              <InfoItem label="직장명" value={customer.company} />
              <InfoItem label="주소" value={customer.workAddress} />
              <InfoItem
                label="전화번호"
                value={customer.workPhone}
                isDimmed={!customer.workPhone}
              />
              <InfoItem
                label="우편물 수령지"
                value={customer.mailReceiveAddress}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>해외 납세의무자 본인확인서</CardTitle>
            </CardHeader>
            <CardContent>
              <InfoItem label="상태" value="해당사항 없음" isDimmed={true} />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Button className="w-full">수정하기</Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
