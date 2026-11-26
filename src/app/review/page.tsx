"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";

type Review = {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  location: string;
  product: string;
  text: string;
  helpful: number;
};

const receivedReviews: Review[] = [
  {
    id: 1,
    name: "민지",
    avatar: "민",
    rating: 5,
    date: "2026.11.24",
    location: "성수동",
    product: "소파테이블",
    text: "약속 시간도 잘 지키시고 설명보다 훨씬 깔끔한 상태였어요. 직접 보고 거래할 수 있어서 안심됐습니다.",
    helpful: 8,
  },
  {
    id: 2,
    name: "지훈",
    avatar: "지",
    rating: 5,
    date: "2026.11.18",
    location: "망원동",
    product: "캠핑 랜턴",
    text: "답변도 빠르고 거래 장소 설명을 자세히 알려주셨어요. 친절하게 사용법까지 알려주셔서 감사했습니다.",
    helpful: 5,
  },
  {
    id: 3,
    name: "수아",
    avatar: "수",
    rating: 4,
    date: "2026.11.10",
    location: "연남동",
    product: "미니 선풍기",
    text: "전체적으로 편하게 거래했어요. 약속 장소를 잘 찾아주고 조용하고 빠르게 거래를 마쳤습니다.",
    helpful: 3,
  },
  {
    id: 4,
    name: "현우",
    avatar: "현",
    rating: 5,
    date: "2026.10.29",
    location: "합정동",
    product: "원목 의자",
    text: "사진과 실제 상태가 동일했고 의자를 잘 포장해 주셨어요. 다음에도 이웃끼리 편하게 거래하고 싶어요.",
    helpful: 7,
  },
];

const writtenReviews: Review[] = [
  {
    id: 11,
    name: "다은",
    avatar: "다",
    rating: 5,
    date: "2026.11.21",
    location: "성수동",
    product: "책장",
    text: "판매자분이 상태를 꼼꼼하게 설명해 주셔서 만족스럽게 구매했습니다.",
    helpful: 2,
  },
  {
    id: 12,
    name: "도현",
    avatar: "도",
    rating: 4,
    date: "2026.11.02",
    location: "망원동",
    product: "러닝화",
    text: "약속 장소가 가까워서 좋았고, 제품 상태도 사진과 비슷했습니다.",
    helpful: 1,
  },
];

function Stars({ rating, size = "text-sm" }: { rating: number; size?: string }) {
  return (
    <span aria-label={`${rating}점 만점에 ${rating}점`} className={`tracking-[0.08em] text-[#d6a84b] ${size}`}>
      {"★★★★★".split("").map((star, index) => (
        <span className={index >= rating ? "text-[#dfe4dc]" : ""} key={index}>{star}</span>
      ))}
    </span>
  );
}

export default function ReviewPage() {
  const [activeTab, setActiveTab] = useState<"received" | "written">("received");
  const [activeFilter, setActiveFilter] = useState("전체");
  const [showForm, setShowForm] = useState(false);
  const [draftRating, setDraftRating] = useState(5);
  const [draftText, setDraftText] = useState("");
  const [notice, setNotice] = useState("");
  const [helpfulIds, setHelpfulIds] = useState<number[]>([]);

  const sourceReviews = activeTab === "received" ? receivedReviews : writtenReviews;
  const visibleReviews = useMemo(() => {
    if (activeFilter === "높은 평점") {
      return [...sourceReviews].sort((a, b) => b.rating - a.rating);
    }
    if (activeFilter === "최신순") {
      return [...sourceReviews].sort((a, b) => b.date.localeCompare(a.date));
    }
    return sourceReviews;
  }, [activeFilter, sourceReviews]);

  function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("후기 저장 기능이 아직 연결되지 않았어요. 작성한 내용은 저장되지 않았습니다.");
  }

  function toggleHelpful(id: number) {
    setHelpfulIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  const ratingRows = [
    { rating: 5, percent: 78, count: 12 },
    { rating: 4, percent: 18, count: 3 },
    { rating: 3, percent: 4, count: 1 },
    { rating: 2, percent: 0, count: 0 },
    { rating: 1, percent: 0, count: 0 },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9f6] text-[#263229]">
      <header className="sticky top-0 z-20 border-b border-[#e9ede7] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
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
          <nav className="flex items-center gap-4 text-sm font-semibold text-[#647064]">
            <Link className="hidden transition hover:text-[#315d3d] sm:inline" href="/market">
              동네마켓
            </Link>
            <Link className="text-[#315d3d]" href="/review">
              거래 후기
            </Link>
            <Link
              className="inline-flex h-9 items-center rounded-lg border border-[#dce6da] px-3.5 text-xs font-bold text-[#3c7653] transition hover:bg-[#f0f5ee]"
              href="/login"
            >
              로그인
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 text-[10px] font-bold tracking-[0.18em] text-[#97a095]">
              NEIGHBORHOOD REVIEWS
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#26392b] sm:text-4xl">
              거래 후기
            </h1>
            <p className="mt-2 text-sm text-[#738071]">
              서로의 거래 경험을 나누고 더 믿음직한 이웃이 되어요.
            </p>
          </div>
          <button
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#3c7653] px-5 text-sm font-bold text-white transition hover:bg-[#28583d]"
            onClick={() => setShowForm((current) => !current)}
            type="button"
          >
            <span aria-hidden="true" className="text-lg">＋</span>
            후기 작성
          </button>
        </section>

        {notice ? (
          <p aria-live="polite" className="mb-5 rounded-xl border border-[#dfe8da] bg-[#eef4eb] px-4 py-3 text-sm font-semibold text-[#4d704f]">
            ✓ {notice}
          </p>
        ) : null}

        {showForm ? (
          <section className="mb-8 rounded-2xl border border-[#e3e9df] bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-[0.16em] text-[#97a095]">WRITE A REVIEW</p>
                <h2 className="mt-1 text-lg font-bold">거래 후기를 남겨주세요</h2>
              </div>
              <button
                aria-label="후기 작성 닫기"
                className="grid size-9 place-items-center rounded-full bg-[#f2f5f0] text-[#7b8579]"
                onClick={() => setShowForm(false)}
                type="button"
              >
                ×
              </button>
            </div>
            <form onSubmit={submitReview}>
              <fieldset>
                <legend className="mb-2 text-sm font-semibold">거래 만족도</legend>
                <div className="flex gap-1" aria-label="거래 만족도 선택">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      aria-label={`${rating}점`}
                      aria-pressed={draftRating === rating}
                      className={`text-3xl transition ${draftRating >= rating ? "text-[#d6a84b]" : "text-[#dfe4dc]"}`}
                      key={rating}
                      onClick={() => setDraftRating(rating)}
                      type="button"
                    >
                      ★
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="mt-5 block text-sm font-semibold" htmlFor="review-text">
                후기 내용
              </label>
              <textarea
                className="mt-2 min-h-28 w-full resize-y rounded-lg border border-[#e2e8df] bg-[#fbfcfa] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[#a5ada2] focus:border-[#78a27c] focus:ring-3 focus:ring-[#78a27c]/15"
                id="review-text"
                onChange={(event) => setDraftText(event.target.value)}
                placeholder="거래 상대나 거래 과정은 어떠셨나요?"
                required
                value={draftText}
              />
              <div className="mt-4 flex justify-end">
                <button
                  className="h-10 rounded-lg bg-[#3c7653] px-5 text-sm font-bold text-white transition hover:bg-[#28583d]"
                  type="submit"
                >
                  후기 등록
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="lg:block">
            <div className="rounded-2xl border border-[#e7ece5] bg-white p-5 shadow-sm">
              <div className="text-center">
                <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#eff4ed] text-xl font-extrabold text-[#3c7653]">
                  재
                </div>
                <h2 className="mt-3 font-bold">재현 이웃</h2>
                <p className="mt-1 text-xs text-[#929b90]">성수동 · 거래 24회</p>
              </div>
              <div className="mt-5 border-t border-[#edf0eb] pt-5 text-center">
                <p className="text-4xl font-extrabold tracking-tight">4.8</p>
                <div className="mt-1"><Stars rating={5} size="text-base" /></div>
                <p className="mt-2 text-xs text-[#9aa198]">전체 후기 16개</p>
              </div>
              <div className="mt-5 grid gap-2">
                {ratingRows.map((row) => (
                  <div className="grid grid-cols-[32px_1fr_22px] items-center gap-2 text-[11px]" key={row.rating}>
                    <span className="text-[#7c8679]">{row.rating}점</span>
                    <div className="h-1.5 overflow-hidden rounded-full bg-[#edf1eb]">
                      <div className="h-full rounded-full bg-[#d6a84b]" style={{ width: `${row.percent}%` }} />
                    </div>
                    <span className="text-right text-[#a0a69d]">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#e5eae2]">
              <div className="flex gap-6">
                <button
                  aria-selected={activeTab === "received"}
                  className={`border-b-2 pb-3 text-sm font-bold ${activeTab === "received" ? "border-[#3c7653] text-[#315d3d]" : "border-transparent text-[#929b90]"}`}
                  onClick={() => setActiveTab("received")}
                  role="tab"
                  type="button"
                >
                  받은 후기 <span className="ml-1 text-xs">{receivedReviews.length}</span>
                </button>
                <button
                  aria-selected={activeTab === "written"}
                  className={`border-b-2 pb-3 text-sm font-bold ${activeTab === "written" ? "border-[#3c7653] text-[#315d3d]" : "border-transparent text-[#929b90]"}`}
                  onClick={() => setActiveTab("written")}
                  role="tab"
                  type="button"
                >
                  작성한 후기 <span className="ml-1 text-xs">{writtenReviews.length}</span>
                </button>
              </div>
              <label className="mb-2 flex items-center gap-1 text-xs text-[#7d877a]">
                <span className="sr-only">후기 정렬</span>
                <select
                  className="rounded-md bg-transparent py-1 pr-1 outline-none"
                  onChange={(event) => setActiveFilter(event.target.value)}
                  value={activeFilter}
                >
                  <option>전체</option>
                  <option>최신순</option>
                  <option>높은 평점</option>
                </select>
              </label>
            </div>

            {visibleReviews.length ? (
              <div className="grid gap-3">
                {visibleReviews.map((review) => {
                  const helpful = helpfulIds.includes(review.id);
                  return (
                    <article className="rounded-2xl border border-[#e7ece5] bg-white p-5 transition hover:border-[#d6e1d3] sm:p-6" key={review.id}>
                      <div className="flex items-start gap-3">
                        <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#edf3e9] text-sm font-extrabold text-[#57765a]">
                          {review.avatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold">{review.name}</h3>
                              <span className="text-xs text-[#a0a69d]">{review.location}</span>
                            </div>
                            <time className="text-xs text-[#a0a69d]">{review.date}</time>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <Stars rating={review.rating} />
                            <span className="text-xs font-semibold text-[#d09b3f]">{review.rating}.0</span>
                          </div>
                          <p className="mt-4 text-sm leading-7 text-[#667164]">{review.text}</p>
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0f2ee] pt-3">
                            <span className="rounded-md bg-[#f4f6f2] px-2.5 py-1 text-[11px] font-semibold text-[#7b8678]">
                              거래 상품 · {review.product}
                            </span>
                            {activeTab === "received" ? (
                              <button
                                aria-pressed={helpful}
                                className={`text-xs font-semibold transition ${helpful ? "text-[#3c7653]" : "text-[#9aa198] hover:text-[#61715f]"}`}
                                onClick={() => toggleHelpful(review.id)}
                                type="button"
                              >
                                ♡ 도움됐어요 {review.helpful + Number(helpful)}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#dce4d9] bg-white px-6 text-center">
                <span aria-hidden="true" className="mb-3 text-4xl">♡</span>
                <strong className="text-sm">아직 표시할 후기가 없어요</strong>
                <p className="mt-2 text-xs text-[#939b91]">거래가 끝나면 서로의 후기를 남길 수 있어요.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-[#e9ede7] bg-white px-5 py-6 text-xs text-[#9aa097] sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <span className="font-extrabold text-[#263229]">reown</span>
          <span>가까운 이웃과 함께하는 지속 가능한 거래</span>
          <span>© 2026 reown. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}