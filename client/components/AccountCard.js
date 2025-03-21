import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Copy, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AccountCard({ accountType, accountNumber, balance }) {
  const router = useRouter();

  return (
    <Card className="mx-4 my-0 bg-blue-600 text-white rounded-lg min-h-[220px]">
      <CardContent className="p-6 flex flex-col h-full">
        {/* 첫 번째 줄: 계좌 유형 + 더보기 아이콘 */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold">{accountType}</h2>
          <MoreVertical className="h-5 w-5" />
        </div>

        {/* 두 번째 줄: 계좌번호 + 복사 아이콘 (밑줄 제한) */}
        <div className="mb-2">
          <div className="inline-flex items-center border-b border-gray-300 pb-1 space-x-2">
            <p className="text-sm">{accountNumber}</p>
            <Copy
              className="h-4 w-4 cursor-pointer"
              onClick={() => navigator.clipboard.writeText(accountNumber)}
            />
          </div>
        </div>

        {/* 세 번째 줄: 금액 + 리프레시 아이콘 */}
        <div className="flex items-center mb-4 space-x-2">
          <p className="text-2xl font-bold">{balance}</p>
          <RefreshCw
            className="h-5 w-5 cursor-pointer"
            onClick={() => router.push("/refresh-balance")}
          />
        </div>

        {/* 네 번째, 다섯 번째 줄: 모으기, 보내기 버튼 (테두리 추가) */}
        <div className="flex justify-end space-x-2 mb-4">
          <Button
            variant="outline"
            className="bg-blue-600 text-white border border-gray-300 rounded-full px-4 py-1 text-sm"
            onClick={() => router.push("/savings")}
          >
            모으기
          </Button>
          <Button
            variant="outline"
            className="bg-white text-blue-600 border-none rounded-full px-4 py-1 text-sm"
            onClick={() => router.push("/transfer")}
          >
            보내기
          </Button>
        </div>

        {/* 구분선 */}
        <div className="border-t border-gray-300 mb-2"></div>

        {/* 마지막 줄: 최근거래내역 (센터 정렬, 버튼 느낌 줄이기) */}
        <div className="bg-blue-800 py-1 rounded-b-lg">
          <p className="text-xs text-center font-normal">
            최근거래내역이 궁금해요
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
