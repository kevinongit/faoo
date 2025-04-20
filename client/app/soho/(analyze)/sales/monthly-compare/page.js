import { Suspense } from "react";
import GNB from "@/components/GNB";
import Loading from "@/components/Loading";
import SalesCompareContent from "./_component/sales-compare-content";
import BackHeader from "@/components/BackHeader";

export default function SaleCompareDashboard() {
  return (
    <>
      <BackHeader title="매출 비교" />
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
        <SalesCompareContent />
      </Suspense>
    </>
  );
}
