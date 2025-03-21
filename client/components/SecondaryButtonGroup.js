import { Button } from "@/components/ui/button";
import { FileText, Mail, Lock, Settings } from "lucide-react";

export default function SecondaryButtonGroup() {
  return (
    <div className="flex justify-around p-4">
      <button className="flex flex-col items-center">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full shadow-md">
          <FileText className="h-6 w-6 text-gray-600" />
        </div>
        <span className="text-xs mt-2 text-gray-600">지로 납부</span>
      </button>
      <button className="flex flex-col items-center">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full shadow-md">
          <Mail className="h-6 w-6 text-gray-600" />
        </div>
        <span className="text-xs mt-2 text-gray-600">전자함 메일</span>
      </button>
      <button className="flex flex-col items-center">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded-full shadow-md">
          <Lock className="h-6 w-6 text-gray-600" />
        </div>
        <span className="text-xs mt-2 text-gray-600">인증 • 보안</span>
      </button>
      <button className="flex flex-col items-center">
        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md">
          <Settings className="h-6 w-6 text-gray-600" />
        </div>
        <span className="text-xs mt-2 text-gray-600">메뉴설정</span>
      </button>
    </div>
  );
}
