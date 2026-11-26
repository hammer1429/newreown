"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Siteheader from "../../components/Siteheader";
import {
  formatPrice,
  type Product,
} from "../../lib/products";
import { useFavorites } from "../../lib/use-favorites";

type StatusFilter = "all" | "selling" | "sold";

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "selling", label: "판매 중" },
  { value: "sold", label: "거래 완료" },
];

export default function FavoritePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const { favorites, toggleFavorite, error } = useFavorites();

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("상품 목록 요청에 실패했습니다.");
        }

        const data = (await response.json()) as { products?: Product[] };
        if (!Array.isArray(data.products)) {
          throw new Error("상품 목록 응답 형식이 올바르지 않습니다.");
        }

        if (active) {
          setProducts(data.products);
        }
      } catch {
        if (active) {
          setLoadError("상품을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
        }
      } finally {
        if (active) {
          setProductsLoaded(true);
        }
      }
    }

    void loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const savedProducts = useMemo(
    () => products.filter((product) => favorites.includes(product.id)),
    [favorites, products],
  );
  const favoriteProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return savedProducts.filter((product) => {
      const matchesStatus =
        statusFilter === "all" || product.status === statusFilter;
      const matchesSearch =
        !keyword ||
        `${product.title} ${product.category} ${product.location}`
          .toLowerCase()
          .includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [savedProducts, search, statusFilter]);
  const savedCount = loadError ? favorites.length : savedProducts.length;

  return (
    <div className="min-h-screen bg-[#f8f9f6] text-[#263229]">
      <Siteheader
        favoriteCount={savedCount}
        favoriteError={error}
        onSearchChange={setSearch}
        search={search}
      />

      <main className="mx-auto max-w-7xl px-5 sm:px-8">
        <section className="py-9 sm:py-12">
          <p className="mb-2 text-[10px] font-bold tracking-[0.18em] text-[#97a095]">
            YOUR FAVORITES
          </p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#26392b] sm:text-4xl">
                찜한 상품
              </h1>
              <p className="mt-2 text-sm text-[#738071]">
                관심 있는 상품을 모아보고 언제든 다시 확인해요.
              </p>
            </div>
            <p className="text-sm font-semibold text-[#7b8579]">
              총 <span className="text-[#3c7653]">{savedCount}</span>개
            </p>
          </div>
        </section>

        {loadError ? (
          <div
            className="mb-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            role="alert"
          >
            {loadError}
          </div>
        ) : null}

        <section className="pb-16">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div aria-label="상품 상태 필터" className="flex gap-2" role="group">
              {statusOptions.map((option) => (
                <button
                  aria-pressed={statusFilter === option.value}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    statusFilter === option.value
                      ? "border-[#3c7653] bg-[#3c7653] text-white"
                      : "border-[#e5eae2] bg-white text-[#677265] hover:border-[#b6ccb6]"
                  }`}
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
            {search ? (
              <button
                className="text-xs font-semibold text-[#3c7653] hover:underline"
                onClick={() => setSearch("")}
                type="button"
              >
                검색 초기화
              </button>
            ) : null}
            {productsLoaded && !loadError ? (
              <p aria-live="polite" className="ml-auto text-xs text-[#8a9387]">
                {favoriteProducts.length}개 표시 중
              </p>
            ) : null}
          </div>

          {!productsLoaded ? (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-[#e9ede7] bg-white text-sm text-[#939b91]">
              찜 목록을 불러오는 중이에요...
            </div>
          ) : loadError ? (
            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-[#e9ede7] bg-white px-6 text-center text-sm text-[#939b91]">
              상품 정보를 불러오지 못해 찜 목록을 표시할 수 없어요.
            </div>
          ) : favoriteProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
              {favoriteProducts.map((product) => (
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
                        className={`h-full w-full object-cover ${
                          product.status === "sold" ? "brightness-75" : ""
                        }`}
                        src={product.images[0]}
                      />
                    ) : (
                      product.icon
                    )}
                    {product.status === "sold" ? (
                      <span className="absolute left-3 top-3 rounded-full bg-[#263229]/85 px-2.5 py-1 text-[10px] font-bold text-white">
                        거래 완료
                      </span>
                    ) : null}
                  </Link>
                  <div className="p-3 sm:p-4">
                    <span className="text-[10px] text-[#9ca398]">
                      {product.category} · {product.location}
                    </span>
                    <h2 className="mt-1 truncate text-sm font-semibold text-[#384037]">
                      <Link
                        className="hover:text-[#315d3d] hover:underline"
                        href={`/market/${product.id}`}
                      >
                        {product.title}
                      </Link>
                    </h2>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <strong className="text-sm font-extrabold">
                        {formatPrice(product.price)}
                      </strong>
                      <button
                        aria-label={`${product.title} 찜 취소`}
                        className="rounded-md bg-rose-50 px-2 py-1.5 text-[10px] font-bold text-rose-600 transition hover:bg-rose-100"
                        onClick={() => toggleFavorite(product.id)}
                        type="button"
                      >
                        ♥ 찜 취소
                      </button>
                    </div>
                    <div className="mt-3 flex justify-between border-t border-[#f0f1ee] pt-2 text-[10px] text-[#a0a69d]">
                      <span>{product.time}</span>
                      <span className="font-semibold text-rose-500">
                        ♥ {product.likes + Number(favorites.includes(product.id))}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-[#dce4d9] bg-white px-6 text-center">
              <span
                aria-hidden="true"
                className="mb-4 grid size-14 place-items-center rounded-2xl bg-[#eff4ed] text-3xl text-[#85a283]"
              >
                ♡
              </span>
              <strong className="text-sm text-[#465044]">
                {savedCount === 0
                  ? "아직 찜한 상품이 없어요"
                  : "조건에 맞는 찜 상품이 없어요"}
              </strong>
              <p className="mt-2 text-xs leading-5 text-[#939b91]">
                {savedCount === 0
                  ? "마켓에서 마음에 드는 상품의 하트를 눌러 모아보세요."
                  : "검색어나 상태 필터를 바꿔 다시 확인해 보세요."}
              </p>
              {savedCount === 0 ? (
                <Link
                  className="mt-5 inline-flex h-10 items-center rounded-lg bg-[#3c7653] px-4 text-xs font-bold text-white transition hover:bg-[#28583d]"
                  href="/market"
                >
                  마켓 둘러보기
                </Link>
              ) : null}
            </div>
          )}
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