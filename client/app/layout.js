// app/layout.js
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Header />
        <main className="pt-20 min-h-screen bg-gray-50">
          {" "}
          {/* 헤더 높이만큼 padding-top 추가 */}
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
