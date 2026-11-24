import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getNoticeById } from "@/lib/notices";
import DeleteNoticeButton from "./DeleteNoticeButton";

type NoticeDetailPageProps = {
  params: Promise<{ id: string }>;
};

async function NoticeArticle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notice = await getNoticeById(id);

  if (!notice) {
    notFound();
  }

  return (
    <article className="rounded-3xl border border-[#e7ece5] bg-white p-6 shadow-[0_14px_40px_rgba(63,95,71,0.05)] sm:p-10">
      <div className="border-b border-[#edf0eb] pb-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-md bg-[#edf3e9] px-2.5 py-1 text-[11px] font-bold text-[#3c7653]">
            {notice.pinned ? "중요 공지" : notice.category}
          </span>
          <time className="text-xs font-medium text-[#a0a69d]">
            {notice.date}
          </time>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#26392b] sm:text-3xl">
          {notice.title}
        </h1>
      </div>

      <div className="pt-6">
        <p className="whitespace-pre-wrap text-sm leading-7 text-[#5f6b5d] sm:text-base">
          {notice.content}
        </p>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-[#edf0eb] pt-6">
        <Link
          className="inline-flex h-11 items-center justify-center rounded-lg border border-[#dce6da] px-5 text-sm font-semibold text-[#687367] transition hover:bg-[#f8faf7]"
          href="/notice"
        >
          공지 목록 보기
        </Link>
        <DeleteNoticeButton noticeId={notice.id} />
      </div>
    </article>
  );
}

function NoticeArticleFallback() {
  return (
    <div className="animate-pulse rounded-3xl border border-[#e7ece5] bg-white p-6 shadow-[0_14px_40px_rgba(63,95,71,0.05)] sm:p-10">
      <div className="border-b border-[#edf0eb] pb-6">
        <div className="mb-3 h-6 w-24 rounded bg-[#edf1eb]" />
        <div className="h-8 w-3/4 rounded bg-[#edf1eb]" />
      </div>
      <div className="space-y-3 pt-6">
        <div className="h-4 w-full rounded bg-[#f0f3ee]" />
        <div className="h-4 w-11/12 rounded bg-[#f0f3ee]" />
        <div className="h-4 w-4/5 rounded bg-[#f0f3ee]" />
      </div>
    </div>
  );
}

export default function NoticeDetailPage(props: NoticeDetailPageProps) {
  return (
    <main className="min-h-screen bg-[#f8f9f6] text-[#263229]">
      <header className="mx-auto max-w-4xl px-5 pt-6 sm:px-8">
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
          <Link
            className="text-sm font-semibold text-[#687367] transition hover:text-[#315d3d]"
            href="/notice"
          >
            목록으로
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 pb-16 pt-14 sm:px-8 sm:pt-20">
        <Suspense fallback={<NoticeArticleFallback />}>
          <NoticeArticle params={props.params} />
        </Suspense>
      </div>
    </main>
  );
}