import { useState, useEffect, useRef } from "react";

const DeliveryRatioSlider = ({ value, onChange }) => {
  const [leftValue, setLeftValue] = useState(
    parseInt(value?.coupangEatsRatio || 40)
  );
  const [rightValue, setRightValue] = useState(
    parseInt(value?.coupangEatsRatio || 40) + parseInt(value?.baeminRatio || 55)
  );
  const [isDragging, setIsDragging] = useState(null);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (value) {
      setLeftValue(parseInt(value.coupangEatsRatio));
      setRightValue(
        parseInt(value.coupangEatsRatio) + parseInt(value.baeminRatio)
      );
    }
  }, [value]);

  const handleMouseDown = (handle) => {
    setIsDragging(handle);
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !sliderRef.current) return;

    const sliderRect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - sliderRect.left;
    const percentage = Math.round((x / sliderRect.width) * 100);
    const newValue = Math.max(0, Math.min(100, percentage));

    if (isDragging === "left" && newValue < rightValue) {
      setLeftValue(newValue);
      updateRatios(newValue, rightValue);
    } else if (isDragging === "right" && newValue > leftValue) {
      setRightValue(newValue);
      updateRatios(leftValue, newValue);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, leftValue, rightValue]);

  const updateRatios = (left, right) => {
    const coupangEats = left;
    const baemin = right - left;
    const yogiyo = 100 - right;

    onChange({
      coupangEatsRatio: coupangEats.toString(),
      baeminRatio: baemin.toString(),
      yogiyoRatio: yogiyo.toString(),
    });
  };

  return (
    <div className="w-full">
      {/* 비율 표시 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">쿠팡이츠</span>
          <span className="text-lg font-semibold text-[#00A5E5]">
            {leftValue}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">배달의민족</span>
          <span className="text-lg font-semibold text-[#00C73C]">
            {rightValue - leftValue}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">요기요</span>
          <span className="text-lg font-semibold text-[#FF6B00]">
            {100 - rightValue}%
          </span>
        </div>
      </div>

      {/* 슬라이더 컨테이너 */}
      <div
        ref={sliderRef}
        className="relative h-8"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* 배경 트랙 */}
        <div className="absolute h-1.5 bg-gray-100 rounded-full w-full top-3"></div>

        {/* 활성 트랙 */}
        <div
          className="absolute h-1.5 bg-[#00C73C]/20 rounded-full top-3"
          style={{
            left: `${leftValue}%`,
            width: `${rightValue - leftValue}%`,
          }}
        ></div>

        {/* 커스텀 핸들 */}
        <div
          className="absolute w-5 h-5 bg-[#00A5E5] rounded-full -translate-x-1/2 -translate-y-1/2 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
          style={{
            left: `${leftValue}%`,
            top: "50%",
            zIndex: 2,
          }}
          onMouseDown={() => handleMouseDown("left")}
        />
        <div
          className="absolute w-5 h-5 bg-[#FF6B00] rounded-full -translate-x-1/2 -translate-y-1/2 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
          style={{
            left: `${rightValue}%`,
            top: "50%",
            zIndex: 2,
          }}
          onMouseDown={() => handleMouseDown("right")}
        />
      </div>
    </div>
  );
};

export default DeliveryRatioSlider;
