"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/hooks/use-toast";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CreateAccount() {
  const [accountType, setAccountType] = useState("");
  const [initialDeposit, setInitialDeposit] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 임시로 성공 메시지를 표시하고 대시보드로 리다이렉트합니다.
    toast({
      title: "계좌 생성 성공",
      description: "새 계좌가 성공적으로 생성되었습니다.",
    });
    router.push("/sweet-home");
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>새 계좌 만들기</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountType">계좌 종류</Label>
                <Select onValueChange={setAccountType} required>
                  <SelectTrigger id="accountType">
                    <SelectValue placeholder="계좌 종류를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">예금 계좌</SelectItem>
                    <SelectItem value="checking">당좌 계좌</SelectItem>
                    <SelectItem value="money-market">머니마켓 계좌</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="initialDeposit">초기 입금액</Label>
                <Input
                  id="initialDeposit"
                  type="number"
                  placeholder="초기 입금액을 입력하세요"
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                계좌 만들기
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
