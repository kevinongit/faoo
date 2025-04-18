import Image from "next/image";
import { FaBell } from "react-icons/fa";
import { getSectorImage, formatBusinessNumber } from "@/lib/utils";

export default function BusinessHeader({
  business_name,
  business_number,
  sector,
}) {
  const sectorImage = getSectorImage(sector);

  return (
    <header className="sticky top-16 z-10 bg-white pb-2 p-3">
      <div className="w-full px-3 md:px-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
              <Image
                src={sectorImage}
                alt="프로필"
                width={40}
                height={40}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="font-medium text-gray-900">{business_name}</h1>
              <p className="text-xs text-gray-500">
                사업자번호:{" "}
                {business_number ? formatBusinessNumber(business_number) : ""}
              </p>
            </div>
          </div>
          <button className="w-10 h-10 flex items-center justify-center text-gray-600">
            <FaBell className="text-xl" />
          </button>
        </div>
      </div>
    </header>
  );
}
