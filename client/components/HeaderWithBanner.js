import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HeaderWithBanner() {
  const router = useRouter();

  return (
    <div>
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center p-4 bg-white">
        <div className="flex items-center">
          <span className="font-bold text-lg">
            2025년 새해 특별 많이 받으세요
          </span>
        </div>
        <Bell
          className="cursor-pointer"
          onClick={() => router.push("/notifications")}
        />
      </div>

      {/* 이벤트 배너 버튼 */}
      <div className="flex justify-between px-4 py-2">
        <Button
          variant="outline"
          className="bg-blue-500 text-white border-none"
        >
          기념응원
        </Button>
        <Button variant="outline">다른은행</Button>
      </div>
    </div>
  );
}
