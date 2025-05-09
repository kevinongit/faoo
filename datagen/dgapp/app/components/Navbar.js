"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path) => {
    return pathname === path;
  };

  return (
    <nav className="bg-primary text-white p-4 shadow-md">
      <ul className="flex space-x-6 justify-center">
        <li>
          <Link
            href="/"
            className={`px-4 py-2 rounded-md ${
              isActive("/") ? "bg-blue-700" : "hover:bg-blue-600"
            }`}
          >
            시뮬레이션 데이터
          </Link>
        </li>
        <li>
          <Link
            href="/data-inquiry"
            className={`px-4 py-2 rounded-md ${
              isActive("/data-inquiry") ? "bg-blue-700" : "hover:bg-blue-600"
            }`}
          >
            데이터 조회
          </Link>
        </li>
        <li>
          <Link
            href="/notify"
            className={`px-4 py-2 rounded-md ${
              isActive("/notify") ? "bg-blue-700" : "hover:bg-blue-600"
            }`}
          >
            알림
          </Link>
        </li>
      </ul>
    </nav>
  );
}
