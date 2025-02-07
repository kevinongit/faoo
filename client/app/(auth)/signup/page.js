// app/(auth)/signup/page.js
"use client";

// app/(auth)/signup/page.js
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/api";
import { useToast } from "@/components/ui/hooks/use-toast";

const schema = z.object({
  userId: z.string().min(4, "아이디는 최소 4자 이상이어야 합니다."),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다."),
  username: z.string().min(2, "이름은 최소 2자 이상이어야 합니다."),
  age: z.number().optional(),
  job: z.string().optional(),
});

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await api.post("/signup", data);
      toast({
        title: "회원가입 성공",
        description: "로그인 페이지로 이동합니다.",
        status: "success",
      });
      router.push("/login");
    } catch (error) {
      console.error("Signup failed:", error);
      let errorMessage = "회원가입에 실패했습니다.";
      if (error.response) {
        // 서버에서 응답한 에러 메시지가 있다면 사용
        errorMessage = error.response.data.message || errorMessage;
      }
      toast({
        title: "회원가입 실패",
        description: errorMessage,
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-purple-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center text-blue-600">
          회원가입
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="userId">아이디</Label>
              <Input {...register("userId")} placeholder="사용자 ID" />
              {errors.userId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.userId.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="password">비밀번호</Label>
              <Input
                {...register("password")}
                type="password"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="username">이름</Label>
              <Input {...register("username")} placeholder="홍길동" />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="age">나이 (선택)</Label>
              <Input
                {...register("age", { valueAsNumber: true })}
                type="number"
              />
              {errors.age && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.age.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="job">직업 (선택)</Label>
              <Input {...register("job")} placeholder="개발자" />
              {errors.job && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.job.message}
                </p>
              )}
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "처리 중..." : "가입 완료"}
          </Button>
        </form>
      </div>
    </div>
  );
}
