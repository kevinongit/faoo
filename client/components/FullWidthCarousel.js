import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function FullWidthCarousel({ banners }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="w-full h-[12vh] overflow-hidden relative">
      {" "}
      {/* 높이를 12vh로 조정 */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{
          width: `${100 * banners.length}%`,
          transform: `translateX(-${(100 / banners.length) * currentIndex}%)`,
        }}
      >
        {banners.map((banner, index) => (
          <Card
            key={index}
            className="flex-shrink-0 shadow-none"
            style={{ width: `${100 / banners.length}%` }}
          >
            <CardContent className="flex h-[12vh] p-2">
              {" "}
              {/* 패딩을 줄이고 높이 조정 */}
              <div className="w-2/3 flex flex-col justify-center pl-2 pr-2">
                <p className="text-xs text-gray-500 mb-1">{banner.subtitle}</p>{" "}
                {/* 폰트 크기 축소 */}
                <h3 className="text-sm font-semibold leading-tight">
                  {banner.title}
                </h3>{" "}
                {/* 폰트 크기 축소 및 줄 간격 조정 */}
              </div>
              <div className="w-1/3 relative">
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  style={{ objectFit: "scale-down" }}
                  className="rounded-md" /* 모서리 둥글기 축소 */
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="absolute bottom-1 left-0 right-0 flex justify-center">
        {" "}
        {/* 인디케이터 위치 조정 */}
        {banners.map((_, index) => (
          <span
            key={index}
            className={`h-1 w-1 mx-0.5 rounded-full ${
              index === currentIndex ? "bg-blue-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
