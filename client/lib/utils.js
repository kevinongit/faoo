import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getSectorImage(sector) {
  let sectorImage = "";
  switch (sector) {
    case "cafe":
      sectorImage = "/images/cafe.jpeg";
      break;
    case "bunsik":
      sectorImage = "/images/bunsik.jpeg";
      break;
    case "clothing":
      sectorImage = "/images/clothing.jpeg";
      break;
    case "restaurant":
      sectorImage = "/images/restaurant.jpeg";
      break;
    case "jokbal":
      sectorImage = "/images/jokbal.jpeg";
      break;
    case "pizza":
      sectorImage = "/images/pizza.jpeg";
      break;
    case "chicken":
      sectorImage = "/images/chicken.jpeg";
      break;
    default:
      sectorImage = "/images/default.jpeg";
      break;
  }
  return sectorImage;
}

// 사업자등록번호 포맷팅 (XXX-XX-XXXXX)
export const formatBusinessNumber = (number) => {
  if (!number) return "";
  // 숫자만 추출
  const cleaned = number.toString().replace(/\D/g, "");
  // 10자리가 아닌 경우 원래 값 반환
  if (cleaned.length !== 10) return number;
  // XXX-XX-XXXXX 형식으로 변환
  return cleaned.replace(/^(\d{3})(\d{2})(\d{5})$/, "$1-$2-$3");
};
