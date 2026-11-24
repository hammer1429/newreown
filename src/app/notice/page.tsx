import Link from "next/link";
import { Suspense } from "react";
import { getNotices } from "@/lib/notices";

async function NoticeList() {
  const notices = await getNotices();

  return (
    <>
      <div className="mb-6 flex items-center justify-between border-b border-[#edf0eb] pb-4">
        <h2 className="text-sm font-bold text-[#566255]">
          전체 공지 {notices.length}개
        </h2>
        <Link
          className="inline-flex h-9 items-center rounded-lg bg-[#3c7653] px-4 text-xs font-bold text-white transition hover:bg-[#28583d]"
          href="/notice/new"
        >
          새 글 작성
        </Link>
      </div>

      {notices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#dce4d9] bg-[#fbfcfa] px-6 py-14 text-center">
          <p className="text-sm font-semibold text-[#465044]">
            등록된 공지사항이 없습니다.
          </p>
          <p className="mt-2 text-xs text-[#939b91]">
            첫 공지를 작성해 새 소식을 공유해 보세요.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {notices.map((notice, index) => (
            <article
              className="group rounded-2xl border border-[#edf1eb] bg-[#fbfcfa] p-5 transition hover:border-[#d6e3d4] hover:bg-white sm:p-6"
              key={notice.id}
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-md px-2.5 py-1 text-[11px] font-bold ${
                    notice.pinned ? "text-[#3c7653]" : "text-[#8b9488]"
                  } bg-[#edf3e9]`}
                >
                  {notice.pinned ? "중요 공지" : notice.category}
                </span>
                <span
                  aria-hidden="true"
                  className={`grid size-5 place-items-center rounded-full text-[10px] font-bold text-white ${
                    notice.pinned ? "bg-[#3c7653]" : "bg-[#c9d2c6]"
                  }`}
                >
                  {notice.pinned
                    ? "!"
                    : String(notices.length - index).padStart(2, "0")}
                </span>
                <span className="text-xs font-semibold text-[#9aa198]">
                  {notice.pinned ? "중요 공지" : notice.category}
                </span>
                <h2 className="min-w-0 flex-1 truncate text-base font-bold tracking-tight text-[#2f3a31] sm:text-lg">
                  {notice.title}
                </h2>
                <time className="text-xs font-medium text-[#a0a69d]">
                  {notice.date}
                </time>
              </div>

              <div className="pl-0 sm:pl-9">
                <Link
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#7da17d] transition group-hover:text-[#3c7653]"
                  href={`/notice/${notice.id}`}
                >
                  자세히 보기 <span aria-hidden="true">→</span>
                </Link>
                <time className="mt-2 block text-xs font-medium text-[#a0a69d] sm:hidden">
                  {notice.date}
                </time>
                <p className="mt-2 text-sm leading-7 text-[#6f7a6d]">
                  {notice.content}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function NoticeListFallback() {
  return (
    <div className="space-y-4">
      <div className="mb-6 flex items-center justify-between border-b border-[#edf0eb] pb-4">
        <div className="h-5 w-28 animate-pulse rounded bg-[#edf1eb]" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-[#edf1eb]" />
      </div>
      <div className="grid gap-3">
        {[1, 2, 3].map((item) => (
          <div
            className="h-36 animate-pulse rounded-2xl border border-[#edf1eb] bg-[#fbfcfa]"
            key={item}
          />
        ))}
      </div>
    </div>
  );
}

export default function NoticePage() {
  return (
    <main className="min-h-screen bg-[#f8f9f6] text-[#263229]">
      <header className="mx-auto max-w-5xl px-5 pt-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Link
            aria-label="reown 홈"
            className="inline-flex items-center gap-2 text-xl font-extrabold tracking-tight"
            href="/"
          >
            <span className="grid size-8 place-items-center rounded-xl rounded-bl-sm bg-[#3c7653] text-lg italic text-white">
              r
            </span>
            reown
          </Link>
          <div className="flex items-center gap-4">
            <Link
              className="text-sm font-semibold text-[#687367] transition hover:text-[#315d3d]"
              href="/market"
            >
              동네마켓
            </Link>
            <Link
              className="inline-flex h-9 items-center rounded-lg border border-[#dce6da] px-3.5 text-xs font-bold text-[#3c7653] transition hover:bg-[#f0f5ee]"
              href="/login"
            >
              로그인
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <section className="pt-14 pb-8 sm:pt-20 sm:pb-10">
          <p className="mb-3 inline-flex rounded-full bg-[#e9f1e5] px-3 py-1.5 text-xs font-bold tracking-widest text-[#5f7f5a]">
            NEWS & UPDATES
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#26392b] sm:text-5xl">
            공지사항
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#738071] sm:text-base">
            reown의 새로운 소식과 서비스 안내, 이벤트 정보를 확인하세요.
          </p>
        </section>

        <section className="pb-16 sm:pb-20">
          <div className="rounded-3xl border border-[#e7ece5] bg-white p-5 shadow-[0_14px_40px_rgba(63,95,71,0.05)] sm:p-8">
            <Suspense fallback={<NoticeListFallback />}>
              <NoticeList />
            </Suspense>
          </div>
        </section>
      </div>

      <footer className="border-t border-[#e9ede7] bg-white px-5 py-6 text-xs text-[#9aa097] sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <span className="font-extrabold text-[#263229]">reown</span>
          <span>가까운 이웃과 함께하는 지속 가능한 거래</span>
          <span>© 2026 reown. All rights reserved.</span>
        </div>
      </footer>
    </main>
  );
}
