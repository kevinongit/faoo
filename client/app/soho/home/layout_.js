"use client";
import BackHeader from "@/components/BackHeader";

export default function SohoHomeLayout({ children }) {
  return (
    <>
      <BackHeader title="SOHO 홈" />
      <main className="pt-20 min-h-screen bg-gray-50">{children}</main>
    </>
  );
}
