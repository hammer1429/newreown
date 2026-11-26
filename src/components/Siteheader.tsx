"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

type SiteheaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
  favoriteCount: number;
  favoriteError?: string;
};

const navigationItems = [
  { label: "동네마켓", href: "/market" },
  { label: "채팅", href: "/chatlobby" },
  { label: "안전거래", href: "/safe-deal" },
  { label: "커뮤니티", href: "/community" },
];

export default function Siteheader({
  search,
  onSearchChange,
  favoriteCount,
  favoriteError,
}: SiteheaderProps) {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-20 border-b border-[#e9ede7] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4 sm:px-8">
        <Link
          aria-label="reown 홈"
          className="order-1 flex items-center gap-2 text-2xl font-extrabold tracking-tight"
          href="/"
        >
          <span className="grid size-8 place-items-center rounded-xl rounded-bl-sm bg-[#3c7653] text-xl italic text-white">
            r
          </span>
          <span>reown</span>
        </Link>

        {status === "authenticated" ? (
          <div className="order-2 ml-auto flex items-center gap-3 md:order-4 md:ml-0">
            <span className="hidden text-xs font-semibold text-[#647064] sm:inline">
              {session.user?.name}님
            </span>
            <Link
              className="text-sm font-bold text-[#3c7653] transition hover:text-[#28583d]"
              href="/mypage"
            >
              마이페이지
            </Link>
            <button
              className="rounded-lg bg-[#3c7653] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#28583d]"
              onClick={() => signOut({ redirectTo: "/" })}
              type="button"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <Link
            className="order-2 ml-auto rounded-lg bg-[#3c7653] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#28583d] md:order-4 md:ml-0"
            href="/login"
          >
            로그인
          </Link>
        )}

        <label className="order-3 flex h-10 w-full items-center gap-2 rounded-lg border border-[#e6ebe4] bg-[#f8faf7] px-3 text-[#7b8579] transition focus-within:border-[#9db99e] focus-within:bg-white md:order-3 md:ml-auto md:w-64 lg:w-72">
          <svg
            aria-hidden="true"
            className="size-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            aria-label="상품 검색"
            className="min-w-0 flex-1 bg-transparent text-sm text-[#263229] outline-none placeholder:text-[#9aa198]"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="어떤 물건을 찾으세요?"
            type="search"
            value={search}
          />
        </label>

        <nav
          aria-label="주요 메뉴"
          className="order-4 flex w-full items-center gap-6 overflow-x-auto whitespace-nowrap text-sm font-semibold text-[#647064] md:order-2 md:w-auto"
        >
          {navigationItems.map((item, index) => (
            <Link
              className={`py-1 transition hover:text-[#315d3d] ${
                index === 0 ? "text-[#315d3d]" : ""
              }`}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
          <Link
            aria-label={`찜한 상품 ${favoriteCount}개`}
            className="inline-flex items-center gap-1 py-1 transition hover:text-[#315d3d]"
            href="/favorite"
          >
            <svg
              aria-hidden="true"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              viewBox="0 0 24 24"
            >
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
            </svg>
            찜하기
            <span className="rounded-full bg-[#edf3e9] px-2 py-0.5 text-xs font-bold text-[#3c7653]">
              {favoriteCount}
            </span>
          </Link>
        </nav>
      </div>
      {favoriteError ? (
        <p className="border-t border-amber-100 bg-amber-50 px-5 py-2 text-center text-xs text-amber-800" role="alert">
          {favoriteError}
        </p>
      ) : null}
    </header>
  );
}
