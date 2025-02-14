// middleware.js
import { NextResponse } from "next/server";
import { useAuthStore } from "./lib/store/authStore";

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // 공개 경로 정의
  const publicPaths = ["/login", "/signup", "/forgot-password"];
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  // Authorization 헤더에서 Bearer 토큰 확인
  const authHeader = request.headers.get("Authorization");
  const token =
    authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  console.log("middleware.js : ", { token, path });
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // 토큰 유효성 검증
    const isValidToken = await verifyToken(token);

    if (!isValidToken) {
      // 토큰이 유효하지 않으면 갱신 시도
      const newToken = await refreshToken(token);
      if (newToken) {
        const response = NextResponse.next();
        response.headers.set("Authorization", `Bearer ${newToken}`);
        return response;
      } else {
        // 갱신 실패 시 로그인 페이지로 리다이렉트
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    // 토큰이 유효하면 요청 진행
    return NextResponse.next();
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// 토큰 검증 함수 (실제 구현은 사용하는 인증 방식에 따라 다름)
async function verifyToken(token) {
  // JWT 검증 로직 구현
  // 예:
  // const response = await fetch(`${process.env.API_URL}/verify-token`, {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json'
  //   }
  // });
  // return response.ok;
  return true; // 임시 반환값
}

// 토큰 갱신 함수
async function refreshToken(oldToken) {
  try {
    const response = await fetch(`${process.env.API_URL}/refresh-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${oldToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.newToken;
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
  }
  return null;
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
