"use client";

import { Suspense } from "react";
import Loading from "@/components/Loading";
import SalesDashboardContent from "./_component/sales-dashboard-content";
import BackHeader from "@/components/BackHeader";

export default function SalesDashboard() {
  return (
    <>
      <BackHeader title="주간 분석" />
      <Suspense
        fallback={
          <div className="container mx-auto p-3 pt-0 pb-20">
            <div className="relative flex items-center justify-center mb-4">
              <Loading
                loading={true}
                size={150}
                color="blue"
                text="데이터를 불러오는 중..."
              />
            </div>
          </div>
        }
      >
        <SalesDashboardContent />
      </Suspense>
    </>
  );
}
