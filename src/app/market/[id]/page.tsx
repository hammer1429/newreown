import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProductById } from "@/lib/products-db";
import { formatPrice } from "@/lib/products";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

async function ProductArticle({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const images = product.images ?? [];
  const [mainImage, ...otherImages] = images;

  return (
    <article className="overflow-hidden rounded-3xl border border-[#e7ece5] bg-white shadow-[0_14px_40px_rgba(63,95,71,0.05)]">
      {mainImage ? (
        <div className="bg-[#f3f5f1]">
          <img
            alt={product.title}
            className="aspect-[16/10] w-full object-cover sm:aspect-[16/8]"
            src={mainImage}
          />
          {otherImages.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 border-t border-[#edf0eb] p-3 sm:p-4">
              {otherImages.map((image, index) => (
                <img
                  alt={`${product.title} 사진 ${index + 2}`}
                  className="aspect-square w-full rounded-lg border border-[#e6ebe4] object-cover"
                  key={`${index}-${image.slice(0, 24)}`}
                  src={image}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div
          aria-label={product.title}
          className="grid aspect-[16/10] place-items-center text-8xl sm:aspect-[16/8] sm:text-9xl"
          role="img"
          style={{ background: product.background }}
        >
          {product.icon}
        </div>
      )}

      <div className="p-6 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#edf0eb] pb-6">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-md bg-[#edf3e9] px-2.5 py-1 text-[11px] font-bold text-[#3c7653]">
                {product.category}
              </span>
              <span className="text-xs font-medium text-[#8f998c]">
                {product.location} · {product.time}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#26392b] sm:text-3xl">
              {product.title}
            </h1>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-extrabold text-[#263229] sm:text-3xl">
              {formatPrice(product.price)}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#7d887b]">
              ♡ {product.likes}
            </p>
          </div>
        </div>

        <div className="pt-6">
          <h2 className="text-sm font-bold text-[#566255]">상품 설명</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#5f6b5d] sm:text-base">
            {product.description?.trim()
              ? product.description
              : "등록된 상품 설명이 없습니다."}
          </p>
        </div>

        <dl className="mt-8 grid gap-3 rounded-2xl border border-[#edf1eb] bg-[#fbfcfa] p-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold tracking-wide text-[#97a095]">카테고리</dt>
            <dd className="mt-1 font-semibold text-[#384037]">{product.category}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold tracking-wide text-[#97a095]">거래 지역</dt>
            <dd className="mt-1 font-semibold text-[#384037]">{product.location}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold tracking-wide text-[#97a095]">등록 시점</dt>
            <dd className="mt-1 font-semibold text-[#384037]">{product.time}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold tracking-wide text-[#97a095]">관심</dt>
            <dd className="mt-1 font-semibold text-[#384037]">{product.likes}명</dd>
          </div>
        </dl>

        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-[#edf0eb] pt-6">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#3c7653] px-5 text-sm font-bold text-white transition hover:bg-[#28583d]"
            href="/market"
          >
            목록으로 돌아가기
          </Link>
          <Link
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[#dce6da] px-5 text-sm font-semibold text-[#687367] transition hover:bg-[#f8faf7]"
            href="/"
          >
            홈으로
          </Link>
        </div>
      </div>
    </article>
  );
}

function ProductArticleFallback() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-[#e7ece5] bg-white shadow-[0_14px_40px_rgba(63,95,71,0.05)]">
      <div className="aspect-[16/10] bg-[#edf1eb] sm:aspect-[16/8]" />
      <div className="space-y-4 p-6 sm:p-10">
        <div className="h-6 w-24 rounded bg-[#edf1eb]" />
        <div className="h-8 w-3/4 rounded bg-[#edf1eb]" />
        <div className="h-4 w-full rounded bg-[#f0f3ee]" />
        <div className="h-4 w-11/12 rounded bg-[#f0f3ee]" />
        <div className="h-4 w-4/5 rounded bg-[#f0f3ee]" />
      </div>
    </div>
  );
}

export default function ProductDetailPage(props: ProductDetailPageProps) {
  return (
    <main className="min-h-screen bg-[#f8f9f6] text-[#263229]">
      <header className="mx-auto max-w-4xl px-5 pt-6 sm:px-8">
        <div className="flex items-center justify-between">
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
            동네마켓
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 pb-16 pt-14 sm:px-8 sm:pt-20">
        <Suspense fallback={<ProductArticleFallback />}>
          <ProductArticle params={props.params} />
        </Suspense>
      </div>
    </main>
  );
}