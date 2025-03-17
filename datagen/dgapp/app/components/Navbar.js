"use client";

import Link from "next/link";
import { Button } from "./Button";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-primary text-white p-4 shadow-md">
      <ul className="flex space-x-6 justify-center">
        <li>
          <Link href="/" passHref>
            <Button
              className={`px-4 py-2 rounded-md ${
                pathname === "/" ? "bg-blue-700" : "hover:bg-blue-600"
              }`}
            >
              데이터 생성
            </Button>
          </Link>
        </li>
        <li>
          <Link href="/query" passHref>
            <Button
              className={`px-4 py-2 rounded-md ${
                pathname === "/query" ? "bg-blue-700" : "hover:bg-blue-600"
              }`}
            >
              수집데이터 조회
            </Button>
          </Link>
        </li>
        <li>
          <Link href="/notify" passHref>
            <Button
              className={`px-4 py-2 rounded-md ${
                pathname === "/notify" ? "bg-blue-700" : "hover:bg-blue-600"
              }`}
            >
              알림 전송
            </Button>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
