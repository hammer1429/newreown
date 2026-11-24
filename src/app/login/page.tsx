"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [notice, setNotice] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("로그인 서버가 아직 연결되지 않았습니다. 인증 API 연결 후 이용할 수 있어요.");
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#edf3e9] px-12 py-10 lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div
          aria-hidden="true"
          className="absolute -top-32 -right-36 size-[30rem] rounded-full border border-[#d6e2d0]"
        />
        <div
          aria-hidden="true"
          className="absolute -right-16 bottom-[-11rem] size-[34rem] rounded-full border border-dashed border-[#cbd9c5]"
        />
        <Link
          aria-label="reown 홈"
          className="relative z-10 inline-flex w-fit items-center gap-2 text-2xl font-extrabold tracking-tight text-[#263229]"
          href="/"
        >
          <span className="grid size-9 place-items-center rounded-xl rounded-bl-sm bg-[#3c7653] text-xl italic text-white">
            r
          </span>
          reown
        </Link>

        <div className="relative z-10 max-w-lg pb-16">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#3c7653]">
            <span className="size-2 rounded-full bg-[#75a77c]" />
            우리 동네 취향 거래
          </span>
          <h1 className="text-5xl leading-tight font-extrabold tracking-tight text-[#26392b] xl:text-6xl">
            잘 쓰던 물건,
            <br />
            <span className="text-[#3c7653]">새 주인을 만나도록.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-[#738071]">
            가까운 이웃과 나누는 기분 좋은 거래,
            <br />
            reown에서 시작해요.
          </p>
          <div className="mt-10 flex items-center gap-3 text-sm text-[#738071]">
            <span className="flex -space-x-2" aria-hidden="true">
              <span className="grid size-8 place-items-center rounded-full border-2 border-[#edf3e9] bg-[#d6e2d4] text-xs">민</span>
              <span className="grid size-8 place-items-center rounded-full border-2 border-[#edf3e9] bg-[#ead4c6] text-xs">서</span>
              <span className="grid size-8 place-items-center rounded-full border-2 border-[#edf3e9] bg-[#dcd9e8] text-xs">지</span>
            </span>
            <span><strong className="text-[#3c7653]">2,400+</strong>명의 이웃이 함께하고 있어요</span>
          </div>
        </div>

        <p className="relative z-10 text-xs text-[#8a9387]">
          © 2026 reown. 가까운 이웃과 함께하는 지속 가능한 거래.
        </p>
      </section>

      <section className="flex min-h-screen flex-col px-6 py-7 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between lg:justify-end">
          <Link
            aria-label="reown 홈"
            className="inline-flex items-center gap-2 text-xl font-extrabold tracking-tight text-[#263229] lg:hidden"
            href="/"
          >
            <span className="grid size-8 place-items-center rounded-xl rounded-bl-sm bg-[#3c7653] text-lg italic text-white">
              r
            </span>
            reown
          </Link>
          <Link
            className="text-sm font-semibold text-[#687367] transition hover:text-[#315d3d]"
            href="/"
          >
            메인으로
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <div className="mb-8">
            <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#7da17d]">
              WELCOME BACK
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#263229]">
              다시 만나 반가워요
            </h2>
            <p className="mt-2 text-sm text-[#858d82]">
              이메일과 비밀번호를 입력해 로그인해 주세요.
            </p>
          </div>

          <form className="grid gap-5" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label
                className="text-sm font-semibold text-[#424b41]"
                htmlFor="email"
              >
                이메일
              </label>
              <input
                autoComplete="email"
                className="h-12 rounded-lg border border-[#e2e8df] bg-white px-4 text-sm text-[#263229] outline-none transition placeholder:text-[#a5ada2] focus:border-[#78a27c] focus:ring-3 focus:ring-[#78a27c]/15"
                id="email"
                name="email"
                placeholder="name@example.com"
                required
                type="email"
              />
            </div>

            <div className="grid gap-2">
              <label
                className="text-sm font-semibold text-[#424b41]"
                htmlFor="password"
              >
                비밀번호
              </label>
              <div className="relative">
                <input
                  autoComplete="current-password"
                  className="h-12 w-full rounded-lg border border-[#e2e8df] bg-white px-4 pr-20 text-sm text-[#263229] outline-none transition placeholder:text-[#a5ada2] focus:border-[#78a27c] focus:ring-3 focus:ring-[#78a27c]/15"
                  id="password"
                  name="password"
                  placeholder="비밀번호를 입력해 주세요"
                  required
                  type={isPasswordVisible ? "text" : "password"}
                />
                <button
                  aria-label={isPasswordVisible ? "비밀번호 숨기기" : "비밀번호 표시"}
                  aria-pressed={isPasswordVisible}
                  className="absolute inset-y-0 right-3 text-xs font-semibold text-[#7d887b] hover:text-[#315d3d]"
                  onClick={() => setIsPasswordVisible((visible) => !visible)}
                  type="button"
                >
                  {isPasswordVisible ? "숨기기" : "표시"}
                </button>
              </div>
            </div>

            <button
              className="mt-1 h-12 rounded-lg bg-[#3c7653] text-sm font-bold text-white transition hover:bg-[#28583d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3c7653]"
              type="submit"
            >
              로그인
            </button>
            <p aria-live="polite" className="min-h-5 text-center text-xs text-[#a15c42]">
              {notice}
            </p>
          </form>

          <div className="mt-7 border-t border-[#edf0eb] pt-6 text-center">
            <p className="text-sm text-[#737d70]">
              아직 회원이 아니신가요?{" "}
              <Link
                className="font-bold text-[#3c7653] hover:underline"
                href="/login/new"
              >
                회원가입
              </Link>
            </p>
            <p className="text-xs leading-5 text-[#92998f]">
              로그인에 문제가 있나요? 계정 정보를 확인한 뒤 다시 시도해 주세요.
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#a0a69d] lg:hidden">
          © 2026 reown. All rights reserved.
        </p>
      </section>
    </main>
  );
}
