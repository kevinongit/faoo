// app/layout.js
"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isSoho = pathname.startsWith("/soho/");
  return (
    <html lang="ko">
      <body className={inter.className}>
        {!isSoho ? <Header /> : ""}
        <main
          className={
            !isSoho
              ? "pt-20 min-h-screen bg-gray-50"
              : "pt-16 min-h-screen bg-gray-50"
          }
        >
          {" "}
          {/* 헤더 높이만큼 padding-top 추가 */}
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
