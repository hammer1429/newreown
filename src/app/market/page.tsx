"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Siteheader from "../../components/Siteheader";
import {
  formatPrice,
  sortProducts,
  type Product,
  type ProductSortOption,
} from "../../lib/products";
import { useFavorites } from "../../lib/use-favorites";

type SortOption = ProductSortOption;

const allRegionsLabel = "전체지역";
const sortOptions: SortOption[] = ["추천", "최신순", "인기순", "낮은 가격순"];

export default function MarketPage() {
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

  function resetFilters() {
    setSearch("");
    setSelectedCategory("전체");
    setSelectedRegion(allRegionsLabel);
    setActiveSort("추천");
  }

  return (
    <div className="min-h-screen bg-[#f8f9f6] text-[#263229]">
      <Siteheader
        favoriteCount={favorites.length}
        favoriteError={favoriteError}
        onSearchChange={setSearch}
        search={search}
      />

      <main id="top" className="mx-auto max-w-7xl px-5 sm:px-8">
        <section className="py-9 sm:py-12">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div id="market-grid">
              <p className="mb-2 text-[10px] font-bold tracking-[0.18em] text-[#97a095]">
                REOWN NEIGHBORHOOD MARKET
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#26392b] sm:text-4xl">
                동네마켓
              </h1>
              <p className="mt-2 text-sm text-[#738071]">
                우리 동네 이웃과 가까운 거리에서 따뜻한 거래를 시작해요.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                className="inline-flex h-10 items-center justify-center rounded-lg bg-[#3c7653] px-4 text-sm font-bold text-white transition hover:bg-[#28583d]"
                href="/market/new"
              >
                상품 등록하기
              </Link>
              <label className="flex h-10 items-center gap-2 rounded-lg border border-[#e6ebe4] bg-white px-3 text-sm text-[#647064]">
                <span aria-hidden="true">⌖</span>
                <span className="sr-only">지역 선택</span>
                <select
                  className="bg-transparent outline-none"
                  onChange={(event) => setSelectedRegion(event.target.value)}
                  value={selectedRegion}
                >
                  <option value={allRegionsLabel}>{allRegionsLabel}</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </section>

        <section
          aria-label="상품 카테고리"
          className="mb-8 flex gap-2 overflow-x-auto pb-2"
          id="categories"
        >
          {categories.map((category) => (
            <button
              aria-pressed={selectedCategory === category}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                selectedCategory === category
                  ? "border-[#3c7653] bg-[#3c7653] text-white"
                  : "border-[#e5eae2] bg-white text-[#677265] hover:border-[#b6ccb6] hover:text-[#315d3d]"
              }`}
              key={category}
              onClick={() => setSelectedCategory(category)}
              type="button"
            >
              {category === "전체" ? "전체 상품" : category}
            </button>
          ))}
        </section>

        <section className="grid gap-8 pb-16 lg:grid-cols-[210px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-2xl border border-[#e9ede7] bg-white p-5">
              <h2 className="font-bold">카테고리</h2>
              <div className="mt-4 grid gap-1">
                {categories.map((category) => (
                  <button
                    aria-pressed={selectedCategory === category}
                    className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                      selectedCategory === category
                        ? "bg-[#eff4ed] font-bold text-[#315d3d]"
                        : "text-[#737d70] hover:bg-[#f7f9f6]"
                    }`}
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    type="button"
                  >
                    {category === "전체" ? "전체 상품" : category}
                  </button>
                ))}
              </div>
              <div className="mt-6 border-t border-[#edf0eb] pt-5">
                <h2 className="font-bold">거래 지역</h2>
                <div className="mt-3 grid gap-1">
                  {[allRegionsLabel, ...regions].map((region) => (
                    <button
                      aria-pressed={selectedRegion === region}
                      className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                        selectedRegion === region
                          ? "bg-[#eff4ed] font-bold text-[#315d3d]"
                          : "text-[#737d70] hover:bg-[#f7f9f6]"
                      }`}
                      key={region}
                      onClick={() => setSelectedRegion(region)}
                      type="button"
                    >
                      {region}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">
                  {selectedRegion === allRegionsLabel
                    ? "우리 동네 매물"
                    : `${selectedRegion} 매물`}
                  <span className="ml-2 text-sm font-medium text-[#9aa198]">
                    {visibleProducts.length}
                  </span>
                </h2>
                {selectedCategory !== "전체" && (
                  <p className="mt-1 text-xs text-[#8a9387]">
                    {selectedCategory} 카테고리
                  </p>
                )}
              </div>
              {(search ||
                selectedCategory !== "전체" ||
                selectedRegion !== allRegionsLabel) && (
                <button
                  className="text-xs font-semibold text-[#3c7653] hover:underline"
                  onClick={resetFilters}
                  type="button"
                >
                  필터 초기화
                </button>
              )}
            </div>

            <div
              aria-label="상품 정렬"
              className="mb-5 flex gap-4 overflow-x-auto border-b border-[#e9ede7] pb-3"
              role="tablist"
            >
              {sortOptions.map((option) => (
                <button
                  aria-selected={activeSort === option}
                  className={`shrink-0 text-sm ${
                    activeSort === option
                      ? "font-bold text-[#315d3d]"
                      : "text-[#9ba197] hover:text-[#526052]"
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

            {!loaded ? (
              <div className="flex min-h-72 items-center justify-center rounded-2xl border border-[#e9ede7] bg-white text-sm text-[#939b91]">
                상품을 불러오는 중이에요...
              </div>
            ) : visibleProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
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
                            onClick={() =>
                              toggleFavorite(product.id)
                            }
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
              <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#dce4d9] bg-white text-center">
                <span aria-hidden="true" className="mb-3 text-4xl text-[#a8b8a5]">
                  ⌕
                </span>
                <strong className="text-sm text-[#465044]">
                  {products.length === 0
                    ? "등록된 상품이 없어요"
                    : "조건에 맞는 매물이 없어요"}
                </strong>
                <p className="mt-2 text-xs text-[#939b91]">
                  {products.length === 0
                    ? "MongoDB에 상품 데이터가 등록되면 여기에 표시됩니다."
                    : "검색어나 필터를 바꿔 다시 찾아보세요."}
                </p>
                {products.length > 0 ? (
                  <button
                    className="mt-4 rounded-lg border border-[#dce6da] px-4 py-2 text-xs font-bold text-[#3c7653] hover:bg-[#f5f8f3]"
                    onClick={resetFilters}
                    type="button"
                  >
                    전체 상품 보기
                  </button>
                ) : null}
              </div>
            )}
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
