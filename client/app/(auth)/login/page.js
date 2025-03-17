"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/hooks/use-toast";
import { useAuthStore } from "@/lib/store/authStore";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { toast } = useToast();
  const { login, isAuthenticated } = useAuthStore();
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    console.log(`Logging in user ${userId}`);

    try {
      const response = await api.post("/login", { userId, password });
      login(response.data.user, response.data.token);
      toast({
        title: "로그인 성공",
        description: `${response.data.user.username}님 환영합니다!`,
        duration: 1000,
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.message || "서버 연결에 실패했습니다");
      toast({
        variant: "destructive",
        title: "로그인 실패",
        description:
          error.response?.data?.message || "서버 연결에 실패했습니다",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleErrorAcknowledgment = () => {
    setError("");
    setUserId("");
    setPassword("");
  };

  return (
    <div className="flex flex-col items-center  min-h-screen pt-20 bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 bg-white rounded-lg shadow-md"
      >
        <h2 className="mb-6 text-2xl font-bold text-center">로그인</h2>

        <div className="mb-4">
          <Input
            type="text"
            placeholder="사용자 ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            icon={<User className="text-gray-400" />}
            required
          />
        </div>

        <div className="mb-6">
          <Input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="text-gray-400" />}
            required
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            <p>{error}</p>
            <Button
              onClick={handleErrorAcknowledgment}
              variant="link"
              className="mt-2"
            >
              확인 (입력 초기화)
            </Button>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "로그인 중..." : "로그인"}
        </Button>
      </form>
    </div>
  );
}
