// components/Header.js
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import api from "@/lib/api";
import { useState } from "react";

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };
  console.log("Header", { user, isAuthenticated });

  return (
    <header className="fixed top-0 w-full bg-white shadow-sm z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/sweet-home" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">IBK 기업</span>
          </Link>

          {/* 네비게이션 메뉴 */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        {user?.username?.[0]}
                      </span>
                      <span className="hidden sm:block">{user?.username}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      프로필 관리
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      disabled={isLoading}
                    >
                      {isLoading ? "로그아웃 중..." : "로그아웃"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="outline"
                  onClick={() => router.push("/sweet-home")}
                  className="hidden sm:block"
                >
                  대시보드
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => router.push("/login")}>
                  로그인
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/signup")}
                >
                  회원가입
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
