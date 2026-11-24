"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type LobbyNotice = {
  id: string;
  category: string;
  title: string;
  date: string;
  pinned: boolean;
};

export default function LobbyNotices() {
  const [notices, setNotices] = useState<LobbyNotice[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadNotices() {
      try {
        const response = await fetch("/api/notices", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("failed");
        }
        const data = (await response.json()) as { notices?: LobbyNotice[] };
        if (active && Array.isArray(data.notices)) {
          setNotices(data.notices);
        }
      } catch {
        if (active) {
          setNotices([]);
        }
      } finally {
        if (active) {
          setLoaded(true);
        }
      }
    }

    void loadNotices();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setIndex(0);
  }, [notices.length]);

  useEffect(() => {
    if (notices.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % notices.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, [notices.length]);

  if (!loaded || notices.length === 0) {
    return null;
  }

  const notice = notices[index] ?? notices[0];

  return (
    <section
      aria-label="공지사항"
      className="mt-5 rounded-2xl border border-[#dce8da] bg-[#f3f8f1] px-4 py-3 sm:px-5 sm:py-4"
    >
      <div className="flex items-center gap-3">
        <span className="inline-flex shrink-0 rounded-md bg-[#3c7653] px-2.5 py-1 text-[11px] font-bold text-white">
          공지사항
        </span>

        <Link
          className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-white/70 px-3 py-2 transition hover:bg-white"
          href={`/notice/${notice.id}`}
        >
          <span className="inline-flex shrink-0 rounded bg-[#e9f1e5] px-2 py-0.5 text-[10px] font-bold text-[#3c7653]">
            {notice.pinned ? "중요" : notice.category}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#384037]">
            {notice.title}
          </span>
          <time className="shrink-0 text-[11px] text-[#8f998c]">
            {notice.date}
          </time>
        </Link>

        <div className="flex shrink-0 items-center gap-3">
          {notices.length > 1 ? (
            <span className="text-[11px] font-semibold text-[#7a8a77]">
              {index + 1}/{notices.length}
            </span>
          ) : null}
          <Link
            className="text-xs font-bold text-[#3c7653] transition hover:underline"
            href="/notice"
          >
            전체보기 →
          </Link>
        </div>
      </div>
    </section>
  );
}
