// components/GNB.js
import {Home, Gift, Package, Gauge, MoreHorizontal} from "lucide-react";
import Link from "next/link";

const menuItems = [
  {icon: Home, label: "홈", href: "/dashboard"},
  {icon: Gift, label: "혜택", href: "/benefits"},
  {icon: Package, label: "상품", href: "/products"},
  {icon: Gauge, label: "매출", href: "/sales/dashboard"},
  {icon: MoreHorizontal, label: "전체", href: "/menu"}
];

export default function GNB() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-16">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="flex flex-col items-center">
            <item.icon className="h-6 w-6 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
