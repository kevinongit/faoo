"use client";
import { IoChevronBack } from "react-icons/io5";
import { useRouter } from "next/navigation";

export default function BackHeader({ title }) {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-10 bg-white h-[50px] flex items-center border-b border-gray-100 shadow-sm">
      <div className="w-full flex items-center justify-between">
        <button
          onClick={handleGoBack}
          className="w-10 h-10 flex items-center justify-center text-gray-600"
        >
          <IoChevronBack className="text-xl" />
        </button>
        <h1 className="font-medium text-gray-900 absolute left-1/2 transform -translate-x-1/2">
          {title}
        </h1>
        <div className="w-10 h-10"></div> {/* 빈 공간으로 균형 맞추기 */}
      </div>
    </header>
  );
}
