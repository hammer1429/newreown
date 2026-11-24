import Link from "next/link";

const safetySteps = [
  {
    number: "01",
    title: "상품 정보를 꼼꼼히 확인해요",
    description:
      "사진과 설명을 살펴보고, 상태나 구성품이 궁금하면 거래 전에 판매자에게 확인해요.",
    icon: "⌕",
  },
  {
    number: "02",
    title: "안전한 장소에서 만나요",
    description:
      "사람이 많은 공공장소에서 만나고, 상품 상태를 직접 확인한 뒤 거래를 진행해요.",
    icon: "⌖",
  },
  {
    number: "03",
    title: "상품 확인 후 결제해요",
    description:
      "직접 확인하기 전에 돈을 먼저 보내거나, 외부 링크를 통한 결제를 요구받으면 주의하세요.",
    icon: "₩",
  },
  {
    number: "04",
    title: "개인정보와 인증 정보를 지켜요",
    description:
      "비밀번호, 인증번호, 카드 정보는 누구에게도 알려주지 말고 의심스러운 링크는 열지 마세요.",
    icon: "♡",
  },
];

export default function SafeDealPage() {
  return (
    <main className="min-h-screen bg-[#f8f9f6] px-5 py-7 text-[#263229] sm:px-8">
      <div className="mx-auto max-w-5xl">
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

        <section className="relative mt-10 overflow-hidden rounded-3xl bg-[#edf3e9] px-6 py-10 sm:mt-14 sm:px-12 sm:py-14">
          <div
            aria-hidden="true"
            className="absolute -right-16 -bottom-36 size-80 rounded-full border border-[#d6e2d0]"
          />
          <div className="relative z-10 max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-bold text-[#3c7653]">
              <span aria-hidden="true">✓</span>
              SAFE TRADING GUIDE
            </span>
            <h1 className="text-3xl leading-tight font-extrabold tracking-tight text-[#26392b] sm:text-5xl">
              안심할 수 있는 거래,
              <br />
              확인에서 시작해요.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#738071] sm:text-base">
              거래 전후에 몇 가지를 확인하는 것만으로도 위험을 줄일 수 있어요.
              아래 안내를 꼭 확인해 주세요.
            </p>
            <Link
              className="mt-6 inline-flex h-11 items-center rounded-lg bg-[#3c7653] px-5 text-sm font-bold text-white transition hover:bg-[#28583d]"
              href="/market"
            >
              마켓 둘러보기
            </Link>
          </div>
        </section>

        <section className="mt-8 flex gap-3 rounded-2xl border border-[#f0dfc0] bg-[#fff9ed] p-5 text-sm leading-6 text-[#765f37]">
          <span aria-hidden="true" className="mt-0.5 text-lg">!</span>
          <div>
            <h2 className="font-bold">reown 안전결제는 아직 제공되지 않습니다</h2>
            <p className="mt-1 text-xs leading-5 text-[#8a7651] sm:text-sm">
              현재 결제·에스크로 기능이 연결되어 있지 않습니다. reown을 통한 안전결제가
              완료된 것처럼 안내하는 외부 링크나 선입금 요청에 유의해 주세요.
            </p>
          </div>
        </section>

        <section className="py-12 sm:py-14">
          <div className="mb-6">
            <p className="mb-1 text-[10px] font-bold tracking-[0.18em] text-[#97a095]">
              BEFORE YOU TRADE
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight">
              안전 거래 체크리스트
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {safetySteps.map((step) => (
              <article
                className="rounded-2xl border border-[#e9ede7] bg-white p-5 sm:p-6"
                key={step.number}
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs font-bold tracking-widest text-[#9aa198]">
                    {step.number}
                  </span>
                  <span
                    aria-hidden="true"
                    className="grid size-10 place-items-center rounded-xl bg-[#eff4ed] text-xl text-[#3c7653]"
                  >
                    {step.icon}
                  </span>
                </div>
                <h3 className="font-bold text-[#384638]">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#7b8579]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-12 rounded-2xl border border-[#e9ede7] bg-white p-5 sm:p-8">
          <p className="mb-1 text-[10px] font-bold tracking-[0.18em] text-[#97a095]">
            FAQ
          </p>
          <h2 className="mb-4 text-xl font-extrabold">자주 묻는 질문</h2>
          <details className="group border-t border-[#edf0eb] py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
              reown에서 안전결제를 이용할 수 있나요?
              <span
                aria-hidden="true"
                className="text-[#8b9488] transition-transform group-open:rotate-180"
              >
                ⌄
              </span>
            </summary>
            <p className="mt-3 text-sm leading-6 text-[#7b8579]">
              현재 결제 및 에스크로 기능은 제공되지 않습니다. 안전결제 기능이 준비되기
              전까지는 외부 결제 링크나 선입금 요청에 응하지 마세요.
            </p>
          </details>
          <details className="group border-t border-[#edf0eb] py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
              의심스러운 상품이나 이용자를 발견하면 어떻게 하나요?
              <span
                aria-hidden="true"
                className="text-[#8b9488] transition-transform group-open:rotate-180"
              >
                ⌄
              </span>
            </summary>
            <p className="mt-3 text-sm leading-6 text-[#7b8579]">
              신고 페이지에 대상과 상황을 남겨 주세요. 현재 신고 접수는 서버 연결 전이며,
              긴급한 피해가 발생한 경우에는 해당 금융기관이나 관계 기관에 직접 문의하세요.
            </p>
          </details>
        </section>

        <section className="mb-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#eaf1e7] p-5 sm:p-7">
          <div>
            <h2 className="font-bold">의심스러운 거래를 발견했나요?</h2>
            <p className="mt-1 text-sm text-[#738071]">
              거래를 진행하지 말고 신고 내용을 남겨 주세요.
            </p>
          </div>
          <Link
            className="inline-flex h-10 items-center rounded-lg border border-[#d1dfcd] bg-white px-4 text-sm font-bold text-[#3c7653] transition hover:bg-[#f5f8f3]"
            href="/report"
          >
            신고하기
          </Link>
        </section>

        <footer className="border-t border-[#e9ede7] py-6 text-center text-xs text-[#a0a69d]">
          © 2026 reown. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
