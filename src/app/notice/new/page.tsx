"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const fieldClassName =
  "h-12 w-full rounded-lg border border-[#e2e8df] bg-white px-4 text-sm text-[#263229] outline-none transition focus:border-[#78a27c] focus:ring-3 focus:ring-[#78a27c]/15";

export default function NewNoticePage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      category: String(formData.get("category") ?? ""),
      title: String(formData.get("title") ?? ""),
      content: String(formData.get("content") ?? ""),
    };

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/notices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || "공지 등록에 실패했습니다.");
      }

      form.reset();
      router.push("/notice");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error && error.message
          ? error.message
          : "공지 등록에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
            href="/notice"
          >
            공지사항으로
          </Link>
        </header>

        <section className="mt-10 rounded-2xl border border-[#e9ede7] bg-white p-6 shadow-sm sm:mt-14 sm:p-10">
          <div className="mb-8">
            <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#7da17d]">
              NEWS & UPDATES
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">
              새 공지 작성
            </h1>
            <p className="mt-3 text-sm text-[#7b8579]">
              제목과 내용을 입력해 공지사항을 작성하세요.
            </p>
          </div>

          <div className="mb-7 rounded-xl bg-[#f2f6ef] p-4 text-xs leading-5 text-[#60715e]">
            작성한 공지는 MongoDB에 저장되며 공지사항 목록에 바로 반영됩니다.
          </div>

          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label
                className="text-sm font-semibold text-[#424b41]"
                htmlFor="notice-category"
              >
                분류
              </label>
              <select
                className={fieldClassName}
                defaultValue="서비스 안내"
                id="notice-category"
                name="category"
                required
              >
                <option>서비스 안내</option>
                <option>안전거래</option>
                <option>커뮤니티</option>
                <option>이벤트</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label
                className="text-sm font-semibold text-[#424b41]"
                htmlFor="notice-title"
              >
                제목
              </label>
              <input
                className={fieldClassName}
                id="notice-title"
                maxLength={100}
                name="title"
                placeholder="공지 제목을 입력해 주세요"
                required
              />
            </div>

            <div className="grid gap-2">
              <label
                className="text-sm font-semibold text-[#424b41]"
                htmlFor="notice-content"
              >
                내용
              </label>
              <textarea
                className="min-h-64 w-full resize-y rounded-lg border border-[#e2e8df] bg-white px-4 py-3 text-sm leading-6 text-[#263229] outline-none transition placeholder:text-[#a5ada2] focus:border-[#78a27c] focus:ring-3 focus:ring-[#78a27c]/15"
                id="notice-content"
                maxLength={5000}
                name="content"
                placeholder="공지 내용을 입력해 주세요."
                required
              />
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#edf0eb] pt-5 sm:flex-row sm:justify-end">
              <Link
                className="inline-flex h-11 items-center justify-center rounded-lg border border-[#dce6da] px-5 text-sm font-semibold text-[#687367] transition hover:bg-[#f8faf7]"
                href="/notice"
              >
                취소
              </Link>
              <button
                className="h-11 rounded-lg bg-[#3c7653] px-6 text-sm font-bold text-white transition hover:bg-[#28583d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3c7653] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "등록 중..." : "공지 등록"}
              </button>
            </div>
            <p
              aria-live="polite"
              className="min-h-5 text-center text-xs text-[#a15c42]"
            >
              {message}
            </p>
          </form>
        </section>

        <footer className="mt-8 border-t border-[#e9ede7] py-6 text-center text-xs text-[#a0a69d]">
          © 2026 reown. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
