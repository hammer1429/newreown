"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function SignupPage() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [notice, setNotice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const passwordConfirmation = String(
      formData.get("passwordConfirmation") ?? "",
    );

    if (password !== passwordConfirmation) {
      setNotice("비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, passwordConfirmation }),
      });
      const responseData = (await response.json()) as { error?: string };

      if (!response.ok) {
        setNotice(responseData.error ?? "회원가입을 완료하지 못했어요.");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setNotice("회원가입은 완료됐지만 자동 로그인에 실패했어요. 로그인해 주세요.");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setNotice("회원가입 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
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
            JOIN OUR NEIGHBORHOOD
          </span>
          <h1 className="text-5xl leading-tight font-extrabold tracking-tight text-[#26392b] xl:text-6xl">
            동네의 좋은 물건,
            <br />
            <span className="text-[#3c7653]">좋은 이웃과 만나보세요.</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-[#738071]">
            reown에서 가까운 이웃과 나누는
            <br />
            기분 좋은 거래를 시작해요.
          </p>
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

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div className="mb-6">
            <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#7da17d]">
              CREATE YOUR ACCOUNT
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#263229]">
              reown 회원가입
            </h2>
            <p className="mt-2 text-sm text-[#858d82]">
              간단한 정보를 입력하고 이웃과 거래를 시작해 보세요.
            </p>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label
                className="text-sm font-semibold text-[#424b41]"
                htmlFor="signup-name"
              >
                이름
              </label>
              <input
                autoComplete="name"
                className="h-11 rounded-lg border border-[#e2e8df] bg-white px-4 text-sm text-[#263229] outline-none transition placeholder:text-[#a5ada2] focus:border-[#78a27c] focus:ring-3 focus:ring-[#78a27c]/15"
                id="signup-name"
                name="name"
                placeholder="이름을 입력해 주세요"
                required
              />
            </div>

            <div className="grid gap-2">
              <label
                className="text-sm font-semibold text-[#424b41]"
                htmlFor="signup-email"
              >
                이메일
              </label>
              <input
                autoComplete="email"
                className="h-11 rounded-lg border border-[#e2e8df] bg-white px-4 text-sm text-[#263229] outline-none transition placeholder:text-[#a5ada2] focus:border-[#78a27c] focus:ring-3 focus:ring-[#78a27c]/15"
                id="signup-email"
                name="email"
                placeholder="name@example.com"
                required
                type="email"
              />
            </div>

            <div className="grid gap-2">
              <label
                className="text-sm font-semibold text-[#424b41]"
                htmlFor="signup-password"
              >
                비밀번호
              </label>
              <div className="relative">
                <input
                  autoComplete="new-password"
                  className="h-11 w-full rounded-lg border border-[#e2e8df] bg-white px-4 pr-20 text-sm text-[#263229] outline-none transition placeholder:text-[#a5ada2] focus:border-[#78a27c] focus:ring-3 focus:ring-[#78a27c]/15"
                  id="signup-password"
                  minLength={8}
                  name="password"
                  placeholder="8자 이상 입력해 주세요"
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

            <div className="grid gap-2">
              <label
                className="text-sm font-semibold text-[#424b41]"
                htmlFor="signup-password-confirmation"
              >
                비밀번호 확인
              </label>
              <input
                autoComplete="new-password"
                className="h-11 rounded-lg border border-[#e2e8df] bg-white px-4 text-sm text-[#263229] outline-none transition placeholder:text-[#a5ada2] focus:border-[#78a27c] focus:ring-3 focus:ring-[#78a27c]/15"
                id="signup-password-confirmation"
                minLength={8}
                name="passwordConfirmation"
                placeholder="비밀번호를 다시 입력해 주세요"
                required
                type={isPasswordVisible ? "text" : "password"}
              />
            </div>

            <button
              className="mt-2 h-12 rounded-lg bg-[#3c7653] text-sm font-bold text-white transition hover:bg-[#28583d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3c7653] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "가입 중..." : "회원가입"}
            </button>
            <p
              aria-live="polite"
              className="min-h-5 text-center text-xs text-[#a15c42]"
            >
              {notice}
            </p>
          </form>

          <div className="mt-5 border-t border-[#edf0eb] pt-5 text-center text-sm text-[#737d70]">
            이미 계정이 있으신가요?{" "}
            <Link
              className="font-bold text-[#3c7653] hover:underline"
              href="/login"
            >
              로그인
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] text-[#a0a69d] lg:hidden">
          © 2026 reown. All rights reserved.
        </p>
      </section>
    </main>
  );
}
