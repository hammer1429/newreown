import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import SignOutButton from "@/components/SignOutButton";

const activityLinks = [
  {
    href: "/favorite",
    icon: "♡",
    title: "찜한 상품",
    description: "관심 있는 상품을 모아보고 관리해요.",
    action: "찜목록 보기",
  },
  {
    href: "/review",
    icon: "✦",
    title: "거래 후기",
    description: "이웃과 나눈 거래 경험을 확인해요.",
    action: "후기 페이지",
  },
  {
    href: "/chatlobby",
    icon: "▤",
    title: "채팅",
    description: "이웃과 나눈 대화를 확인해요.",
    action: "대화 목록",
  },
];

export default function MyPage() {
  return (
    <Suspense fallback={<MyPageFallback />}>
      <AuthenticatedMyPage />
    </Suspense>
  );
}

function MyPageFallback() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f8f9f6] px-5 text-sm text-[#738071]">
      <p role="status">마이페이지를 불러오는 중이에요...</p>
    </main>
  );
}

async function AuthenticatedMyPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=%2Fmypage");
  }

  const name = session.user.name?.trim() || "reown 이웃";
  const initial = Array.from(name)[0] ?? "이";

  return (
    <main className="min-h-screen bg-[#f8f9f6] text-[#263229]">
      <header className="border-b border-[#e9ede7] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
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
          <div className="flex items-center gap-3">
            <Link
              className="text-sm font-semibold text-[#687367] transition hover:text-[#315d3d]"
              href="/market"
            >
              마켓
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <section className="py-9 sm:py-12">
          <p className="mb-2 text-[10px] font-bold tracking-[0.18em] text-[#97a095]">
            MY REOWN
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#26392b] sm:text-4xl">
            마이페이지
          </h1>
          <p className="mt-2 text-sm text-[#738071]">
            내 계정 정보와 reown 활동을 한곳에서 확인해요.
          </p>
        </section>

        <section
          aria-label="내 계정 정보"
          className="rounded-2xl border border-[#e7ece5] bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid size-16 place-items-center rounded-2xl bg-[#edf3e9] text-2xl font-extrabold text-[#3c7653]">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#8a9387]">반가워요</p>
              <h2 className="mt-1 truncate text-xl font-extrabold text-[#2f3d33]">
                {name}님
              </h2>
              <p className="mt-1 truncate text-sm text-[#7b8579]">
                {session.user.email ?? "이메일 정보 없음"}
              </p>
            </div>
            <span className="rounded-full bg-[#eff4ed] px-3 py-1.5 text-xs font-bold text-[#4c7650]">
              reown 회원
            </span>
          </div>
        </section>

        <section className="py-9 sm:py-11">
          <div className="mb-5">
            <p className="mb-1 text-[10px] font-bold tracking-[0.18em] text-[#97a095]">
              MY ACTIVITY
            </p>
            <h2 className="text-xl font-extrabold tracking-tight">내 활동</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activityLinks.map((item) => (
              <Link
                className="group rounded-2xl border border-[#e7ece5] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#cbd9c5] hover:shadow-md"
                href={item.href}
                key={item.href}
              >
                <span
                  aria-hidden="true"
                  className="grid size-11 place-items-center rounded-xl bg-[#eff4ed] text-xl text-[#3c7653]"
                >
                  {item.icon}
                </span>
                <h3 className="mt-4 font-bold text-[#344236]">{item.title}</h3>
                <p className="mt-1 min-h-10 text-sm leading-5 text-[#7b8579]">
                  {item.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#3c7653]">
                  {item.action} <span aria-hidden="true">→</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#edf3e9] p-5 sm:p-7">
          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] text-[#82947d]">
              NEIGHBORHOOD MARKET
            </p>
            <h2 className="mt-1 font-bold text-[#344236]">
              새로운 이웃과 거래를 시작해 보세요
            </h2>
            <p className="mt-1 text-sm text-[#738071]">
              동네마켓에서 필요한 물건을 찾거나 상품을 등록할 수 있어요.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex h-10 items-center rounded-lg border border-[#d1dfcd] bg-white px-4 text-sm font-bold text-[#3c7653] transition hover:bg-[#f5f8f3]"
              href="/market"
            >
              마켓 둘러보기
            </Link>
            <Link
              className="inline-flex h-10 items-center rounded-lg bg-[#3c7653] px-4 text-sm font-bold text-white transition hover:bg-[#28583d]"
              href="/market/new"
            >
              상품 등록하기
            </Link>
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