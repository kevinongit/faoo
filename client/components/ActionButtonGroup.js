import { Button } from "@/components/ui/button";
import { Store, PieChart, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ActionButtonGroup() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap justify-around p-4">
      <button
        onClick={() => router.push("/soho/home")}
        className="flex flex-col items-center m-2"
      >
        <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full shadow-md">
          <Store className="w-6 h-6 text-gray-600" />
        </div>
        <span className="mt-2 text-xs text-gray-600">소상공인</span>
      </button>
      <button
        onClick={() => router.push("/simple-pnl")}
        className="flex flex-col items-center m-2"
      >
        <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full shadow-md">
          <CreditCard className="w-6 h-6 text-gray-600" />
        </div>
        <span className="mt-2 text-xs text-gray-600">간편 손익계산</span>
      </button>
      <button
        onClick={() => router.push("/simple-pnl-lv2")}
        className="flex flex-col items-center m-2"
      >
        <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full shadow-md">
          <CreditCard className="w-6 h-6 text-gray-600" />
        </div>
        <span className="mt-2 text-xs text-gray-600">간편 손익계산 Lv2</span>
      </button>
      <button
        onClick={() => router.push("/my-soho-idea")}
        className="flex flex-col items-center m-2"
      >
        <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full shadow-md">
          <PieChart className="w-6 h-6 text-gray-600" />
        </div>
        <span className="mt-2 text-xs text-gray-600">나의 아이디어</span>
      </button>
    </div>
  );
}
