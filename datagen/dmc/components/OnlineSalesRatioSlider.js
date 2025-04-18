import { useState, useEffect } from "react";

export default function OnlineSalesRatioSlider({
  smartStoreRatio,
  coupangRatio,
  gmarketRatio,
  onChange,
}) {
  const [leftValue, setLeftValue] = useState(50);
  const [rightValue, setRightValue] = useState(90);

  useEffect(() => {
    // 초기값 설정
    setLeftValue(parseInt(smartStoreRatio));
    setRightValue(parseInt(smartStoreRatio) + parseInt(coupangRatio));
  }, [smartStoreRatio, coupangRatio]);

  const handleLeftChange = (e) => {
    const newLeftValue = parseInt(e.target.value);
    if (newLeftValue < rightValue) {
      setLeftValue(newLeftValue);
      const newSmartStoreRatio = newLeftValue;
      const newCoupangRatio = rightValue - newLeftValue;
      const newGmarketRatio = 100 - rightValue;
      onChange(newSmartStoreRatio, newCoupangRatio, newGmarketRatio);
    }
  };

  const handleRightChange = (e) => {
    const newRightValue = parseInt(e.target.value);
    if (newRightValue > leftValue) {
      setRightValue(newRightValue);
      const newSmartStoreRatio = leftValue;
      const newCoupangRatio = newRightValue - leftValue;
      const newGmarketRatio = 100 - newRightValue;
      onChange(newSmartStoreRatio, newCoupangRatio, newGmarketRatio);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-medium">
        <span className="text-blue-600">스마트스토어: {smartStoreRatio}%</span>
        <span className="text-green-600">쿠팡: {coupangRatio}%</span>
        <span className="text-purple-600">G마켓: {gmarketRatio}%</span>
      </div>
      <div className="relative h-8">
        <input
          type="range"
          min="0"
          max="100"
          value={leftValue}
          onChange={handleLeftChange}
          className="absolute w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, 
              #3b82f6 ${leftValue}%, 
              #10b981 ${leftValue}% ${rightValue}%, 
              #8b5cf6 ${rightValue}% 100%)`,
          }}
        />
        <input
          type="range"
          min="0"
          max="100"
          value={rightValue}
          onChange={handleRightChange}
          className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}
