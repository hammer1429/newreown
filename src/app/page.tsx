"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Siteheader from "../components/Siteheader";
import LobbyNotices from "../components/LobbyNotices";
import {
  formatPrice,
  sortProducts,
  type Product,
  type ProductSortOption,
} from "../lib/products";
import { useFavorites } from "../lib/use-favorites";

type SortOption = Exclude<ProductSortOption, "낮은 가격순">;

const allRegionsLabel = "전체지역";
const sortOptions: SortOption[] = ["추천", "최신순", "인기순"];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedRegion, setSelectedRegion] = useState(allRegionsLabel);
  const [activeSort, setActiveSort] = useState<SortOption>("추천");
  const {
    favorites,
    toggleFavorite,
    error: favoriteError,
  } = useFavorites();

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("failed");
        }
        const data = (await response.json()) as { products?: Product[] };
        if (active && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      } catch {
        if (active) {
          setProducts([]);
        }
      } finally {
        if (active) {
          setLoaded(true);
        }
      }
    }

    void loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => ["전체", ...new Set(products.map((product) => product.category))],
    [products],
  );
  const regions = useMemo(
    () => [...new Set(products.map((product) => product.location))],
    [products],
  );

  const visibleProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const filtered = products.filter((product) => {
      const matchesCategory =
        selectedCategory === "전체" || product.category === selectedCategory;
      const matchesRegion =
        selectedRegion === allRegionsLabel ||
        product.location === selectedRegion;
      const matchesSearch =
        !keyword ||
        `${product.title} ${product.category} ${product.location}`
          .toLowerCase()
          .includes(keyword);
      return matchesCategory && matchesRegion && matchesSearch;
    });

    return sortProducts(filtered, activeSort);
  }, [activeSort, products, search, selectedCategory, selectedRegion]);

  const featuredProduct = products[0];

  return (
    <div className="min-h-screen bg-[#f8f9f6] text-[#263229]">
      <Siteheader
        favoriteCount={favorites.length}
        favoriteError={favoriteError}
        onSearchChange={setSearch}
        search={search}
      />

      <main id="top" className="mx-auto max-w-7xl px-5 sm:px-8">
        <LobbyNotices />
        <section className="relative mt-7 overflow-hidden rounded-3xl bg-[#edf3e9] px-7 py-10 sm:px-12 sm:py-14 lg:flex lg:min-h-96 lg:items-center">
          <div className="relative z-10 max-w-xl">
            <span className="mb-4 inline-flex items-center gap-2 text-xs font-bold tracking-wide text-[#3c7653]">
              <span className="size-2 rounded-full bg-[#75a77c]" />
              우리 동네 취향 거래
            </span>
            <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-[#26392b] sm:text-5xl">
              잘 쓰던 물건,
              <br />
              <span className="text-[#3c7653]">새 주인을 만나도록.</span>
            </h1>
            <p className="mt-4 text-sm leading-7 text-[#738071] sm:text-base">
              가까운 이웃과 나누는 기분 좋은 거래,
              <br className="sm:hidden" /> reown에서 시작해요.
            </p>
            <a
              className="mt-6 inline-flex items-center gap-4 rounded-lg bg-[#3c7653] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#28583d]"
              href="#market"
            >
              지금 구경하기 <span aria-hidden="true">↗</span>
            </a>
            <p className="mt-6 text-xs text-[#7d887b]">
              <strong className="text-[#3c7653]">2,400+</strong>명의 이웃이 함께하고 있어요
            </p>
          </div>
          <div className="relative mx-auto mt-10 grid size-64 place-items-center rounded-full border border-[#cbd9c5] bg-[#e5eddf] lg:absolute lg:top-1/2 lg:right-24 lg:mt-0 lg:-translate-y-1/2">
            <div className="grid size-48 place-items-center rounded-full border border-dashed border-[#b8cbb2]">
              {featuredProduct ? (
                <Link
                  aria-label={featuredProduct.title}
                  className="grid size-36 rotate-3 place-items-center rounded-2xl border border-white bg-white text-7xl shadow-xl transition hover:scale-[1.02]"
                  href={`/market/${featuredProduct.id}`}
                  style={{ background: featuredProduct.background }}
                >
                  {featuredProduct.icon}
                </Link>
              ) : (
                <div
                  aria-label="등록된 상품 없음"
                  className="grid size-36 rotate-3 place-items-center rounded-2xl border border-white bg-white text-6xl shadow-xl"
                  role="img"
                >
                  {loaded ? "📦" : "…"}
                </div>
              )}
            </div>
            <span className="absolute -top-2 right-0 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#596653] shadow-md">
              ✦ 좋은 물건의 새로운 시작
            </span>
            <span className="absolute bottom-5 -left-5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#596653] shadow-md">
              ♡ 마음에 쏙
            </span>
          </div>
        </section>

        <section className="py-12" id="categories">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-[10px] font-bold tracking-[0.18em] text-[#97a095]">
                EXPLORE BY CATEGORY
              </p>
              <h2 className="text-xl font-bold tracking-tight">무엇을 찾고 있나요?</h2>
            </div>
            <label className="flex items-center gap-2 rounded-lg border border-[#e6ebe4] bg-white px-3 py-2 text-xs font-semibold text-[#647064]">
              <span aria-hidden="true">⌖</span>
              <span className="sr-only">지역 선택</span>
              <select
                className="bg-transparent outline-none"
                onChange={(event) => setSelectedRegion(event.target.value)}
                value={selectedRegion}
              >
                <option value={allRegionsLabel}>{allRegionsLabel}</option>
                {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {categories.map((category, index) => (
              <button
                aria-pressed={selectedCategory === category}
                className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border px-2 text-center text-xs font-semibold transition hover:-translate-y-0.5 ${
                  selectedCategory === category
                    ? "border-[#b6ccb6] bg-[#f0f5ee] text-[#28583d]"
                    : "border-[#ecefea] bg-white text-[#737d70] hover:border-[#cbd9cb]"
                }`}
                key={category}
                onClick={() => setSelectedCategory(category)}
                type="button"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-[#eff4ed] text-xl">
                  {["✳", "⌁", "⌂", "♧", "◉", "♬"][index] ?? "✳"}
                </span>
                {category === "전체" ? "전체보기" : category}
              </button>
            ))}
          </div>
        </section>

        <section className="pb-14" id="market">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-[10px] font-bold tracking-[0.18em] text-[#97a095]">
                YOUR NEIGHBORHOOD FINDS
              </p>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                지금 우리 동네 매물{" "}
                <span className="ml-1 text-sm font-medium text-[#a5ada2]">
                  {visibleProducts.length}
                </span>
              </h2>
            </div>
            <span className="text-xs text-[#9aa198]">
              {selectedRegion === allRegionsLabel ? "모든 지역" : selectedRegion}
            </span>
          </div>

          <div className="my-5 flex items-center justify-between border-b border-[#e9ede7] pb-3">
            <div aria-label="매물 정렬" className="flex gap-5" role="tablist">
              {sortOptions.map((option) => (
                <button
                  aria-selected={activeSort === option}
                  className={`text-sm ${
                    activeSort === option
                      ? "font-bold text-[#315d3d]"
                      : "text-[#9ba197]"
                  }`}
                  key={option}
                  onClick={() => setActiveSort(option)}
                  role="tab"
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
            <span className="hidden text-xs text-[#a0a69d] sm:inline">
              가까운 이웃의 매물을 보여드려요
            </span>
          </div>

          {!loaded ? (
            <div className="flex min-h-64 items-center justify-center rounded-2xl border border-[#e9ede7] bg-white text-sm text-[#939b91]">
              상품을 불러오는 중이에요...
            </div>
          ) : visibleProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {visibleProducts.map((product) => {
                const isFavorite = favorites.includes(product.id);

                return (
                  <article
                    className="overflow-hidden rounded-xl border border-[#ecefea] bg-white transition hover:-translate-y-1 hover:shadow-lg"
                    key={product.id}
                  >
                    <Link
                      aria-label={`${product.title} 상세 보기`}
                      className={`relative block aspect-[1.2] overflow-hidden sm:aspect-[1.34] ${
                        product.images?.[0]
                          ? ""
                          : "grid place-items-center text-6xl sm:text-7xl"
                      }`}
                      href={`/market/${product.id}`}
                      style={
                        product.images?.[0]
                          ? undefined
                          : { background: product.background }
                      }
                    >
                      {product.images?.[0] ? (
                        <img
                          alt={product.title}
                          className={`h-full w-full object-cover ${product.status === "sold" ? "brightness-75" : ""}`}
                          src={product.images[0]}
                        />
                      ) : (
                        product.icon
                      )}
                      {product.status === "sold" ? (
                        <span className="absolute left-3 top-3 rounded-full bg-[#263229]/85 px-2.5 py-1 text-[10px] font-bold text-white">
                          품절
                        </span>
                      ) : null}
                      <button
                        aria-label={isFavorite ? "찜 취소" : "찜하기"}
                        aria-pressed={isFavorite}
                        className={`absolute right-3 bottom-3 grid size-9 place-items-center rounded-full border bg-white/95 text-xl ${
                          isFavorite
                            ? "border-rose-200 text-rose-500"
                            : "border-[#e6e9e3] text-[#626b61]"
                        }`}
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleFavorite(product.id);
                        }}
                        type="button"
                      >
                        {isFavorite ? "♥" : "♡"}
                      </button>
                    </Link>
                    <div className="p-3 sm:p-4">
                      <span className="text-[10px] text-[#9ca398]">
                        {product.category}
                      </span>
                      <h3 className="mt-1 truncate text-sm font-semibold text-[#384037]">
                        <Link
                          className="hover:text-[#315d3d] hover:underline"
                          href={`/market/${product.id}`}
                        >
                          {product.title}
                        </Link>
                      </h3>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <strong className="text-sm font-extrabold">
                          {formatPrice(product.price)}
                        </strong>
                        <button
                          aria-pressed={isFavorite}
                          className={`rounded-md px-2 py-1.5 text-[10px] font-bold ${
                            isFavorite
                              ? "bg-rose-50 text-rose-600"
                              : "bg-[#f3f5f1] text-[#485248] hover:bg-[#e9eee8]"
                          }`}
                          onClick={() => toggleFavorite(product.id)}
                          type="button"
                        >
                          {isFavorite ? "♥ 찜함" : "♡ 찜"}
                        </button>
                      </div>
                      <div className="mt-3 flex justify-between border-t border-[#f0f1ee] pt-2 text-[10px] text-[#a0a69d]">
                        <span>{product.location} · {product.time}</span>
                        <span className={isFavorite ? "font-bold text-rose-500" : ""}>
                          {isFavorite ? "♥" : "♡"} {product.likes + Number(isFavorite)}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center text-center text-[#939b91]">
              <span aria-hidden="true" className="mb-3 text-4xl">⌕</span>
              <strong className="text-sm text-[#465044]">
                {products.length === 0
                  ? "등록된 상품이 없어요"
                  : "찾으시는 매물이 없어요"}
              </strong>
              <p className="mt-2 text-xs">
                {products.length === 0
                  ? "MongoDB에 상품 데이터가 등록되면 여기에 표시됩니다."
                  : "검색어나 필터를 바꿔 다시 찾아보세요."}
              </p>
              {products.length > 0 ? (
                <button
                  className="mt-4 rounded-lg border border-[#dce6da] bg-white px-4 py-2 text-xs font-bold text-[#3c7653]"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("전체");
                    setSelectedRegion(allRegionsLabel);
                  }}
                  type="button"
                >
                  전체 매물 보기
                </button>
              ) : null}
            </div>
          )}
          <Link
            className="mx-auto mt-7 flex h-11 w-full max-w-sm items-center justify-center gap-2 rounded-lg border border-[#dce6da] bg-white text-sm font-bold text-[#3c7653] transition hover:border-[#b6ccb6] hover:bg-[#f5f8f3]"
            href="/market"
          >
            상품 목록 더보기 <span aria-hidden="true">→</span>
          </Link>
        </section>

        <section
          className="mb-14 flex items-center gap-4 rounded-2xl bg-[#eff4ed] p-5 sm:p-8"
          id="safe-trade"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#7da17d] text-xl font-bold text-white">
            ✓
          </span>
          <div>
            <p className="text-[10px] font-bold tracking-widest text-[#97a095]">
              TRADE WITH PEACE OF MIND
            </p>
            <h2 className="mt-1 font-bold">처음 거래도 안심할 수 있도록</h2>
            <p className="mt-1 text-xs text-[#858d82]">
              가까운 이웃과 만나 안전하고 기분 좋은 거래를 시작해요.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e9ede7] bg-white px-5 py-6 text-xs text-[#9aa097] sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <span className="font-extrabold text-[#263229]">reown</span>
          <span>가까운 이웃과 함께하는 지속 가능한 거래</span>
          <span>© 2026 reown. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
