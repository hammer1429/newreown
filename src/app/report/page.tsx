"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

const fieldClassName =
  "h-12 w-full rounded-lg border border-[#e2e8df] bg-white px-4 text-sm text-[#263229] outline-none transition focus:border-[#78a27c] focus:ring-3 focus:ring-[#78a27c]/15";

export default function ReportPage() {
  const [notice, setNotice] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("신고 접수 서버가 아직 연결되지 않았습니다. 서버 연결 후 신고를 제출할 수 있어요.");
  }

  return (
    <main className="min-h-screen bg-[#f8f9f6] px-5 py-7 text-[#263229] sm:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between">
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
            href="/market"
          >
            마켓으로
          </Link>
        </header>

        <section className="mt-10 rounded-2xl border border-[#e9ede7] bg-white p-6 shadow-sm sm:mt-14 sm:p-10">
          <div className="mb-8">
            <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#7da17d]">
              COMMUNITY SAFETY
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">
              신고하기
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#7b8579]">
              문제가 있는 상품이나 이용자를 알려주세요.
              <br className="hidden sm:block" />
              보내주신 내용은 안전한 거래 환경을 위해 확인합니다.
            </p>
          </div>

          <div className="mb-7 flex gap-3 rounded-xl bg-[#f2f6ef] p-4 text-sm leading-6 text-[#5d6e5c]">
            <span aria-hidden="true" className="mt-0.5 text-lg">ⓘ</span>
            <p>
              신고 대상과 사유를 구체적으로 적어주세요. 비밀번호나 결제 정보 등
              민감한 개인정보는 입력하지 마세요.
            </p>
          </div>

          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
              <div className="grid gap-2">
                <label
                  className="text-sm font-semibold text-[#424b41]"
                  htmlFor="report-target-type"
                >
                  신고 대상
                </label>
                <select
                  className={fieldClassName}
                  defaultValue=""
                  id="report-target-type"
                  name="targetType"
                  required
                >
                  <option disabled value="">대상을 선택해 주세요</option>
                  <option value="product">상품</option>
                  <option value="user">사용자</option>
                  <option value="post">게시글</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label
                  className="text-sm font-semibold text-[#424b41]"
                  htmlFor="report-reason"
                >
                  신고 사유
                </label>
                <select
                  className={fieldClassName}
                  defaultValue=""
                  id="report-reason"
                  name="reason"
                  required
                >
                  <option disabled value="">사유를 선택해 주세요</option>
                  <option value="fraud">사기 또는 허위 정보</option>
                  <option value="prohibited">거래 금지 품목</option>
                  <option value="harassment">욕설 또는 괴롭힘</option>
                  <option value="privacy">개인정보 노출</option>
                  <option value="other">기타</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <label
                className="text-sm font-semibold text-[#424b41]"
                htmlFor="report-target"
              >
                대상 정보
              </label>
              <input
                className={fieldClassName}
                id="report-target"
                name="target"
                placeholder="상품명, 사용자명 또는 게시글 링크"
                required
              />
            </div>

            <div className="grid gap-2">
              <label
                className="text-sm font-semibold text-[#424b41]"
                htmlFor="report-details"
              >
                상세 내용
              </label>
              <textarea
                className="min-h-36 w-full resize-y rounded-lg border border-[#e2e8df] bg-white px-4 py-3 text-sm leading-6 text-[#263229] outline-none transition placeholder:text-[#a5ada2] focus:border-[#78a27c] focus:ring-3 focus:ring-[#78a27c]/15"
                id="report-details"
                name="details"
                placeholder="문제가 발생한 상황을 자세히 적어주세요."
                required
              />
            </div>

            <button
              className="h-12 rounded-lg bg-[#3c7653] text-sm font-bold text-white transition hover:bg-[#28583d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3c7653]"
              type="submit"
            >
              신고 내용 제출
            </button>
            <p
              aria-live="polite"
              className="min-h-5 text-center text-xs text-[#a15c42]"
            >
              {notice}
            </p>
          </form>
        </section>

        <p className="mt-6 text-center text-xs text-[#a0a69d]">
          © 2026 reown. All rights reserved.
        </p>
      </div>
    </main>
  );
}
