"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Suspense,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { Product } from "@/lib/products";

const fieldClassName =
  "h-12 w-full rounded-lg border border-[#e2e8df] bg-white px-4 text-sm text-[#263229] outline-none transition focus:border-[#78a27c] focus:ring-3 focus:ring-[#78a27c]/15";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

type SelectedImage = {
  file: File;
  previewUrl: string;
};

async function uploadImages(files: File[]): Promise<string[]> {
  if (files.length === 0) {
    return [];
  }

  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const response = await fetch("/api/uploads", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
    images?: string[];
  };

  if (!response.ok || !Array.isArray(data.images)) {
    throw new Error(data.message || "이미지 업로드에 실패했습니다.");
  }

  return data.images;
}

function EditProductContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [keptImages, setKeptImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<SelectedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const newImagesRef = useRef<SelectedImage[]>([]);

  useEffect(() => {
    newImagesRef.current = newImages;
  }, [newImages]);

  useEffect(() => {
    return () => {
      newImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    let active = true;

    async function loadProduct() {
      try {
        setIsLoading(true);
        setLoadError("");
        const response = await fetch(`/api/products/${id}`, { cache: "no-store" });
        const data = (await response.json().catch(() => ({}))) as {
          message?: string;
          product?: Product;
        };

        if (!response.ok || !data.product) {
          throw new Error(data.message || "상품 정보를 불러오지 못했습니다.");
        }

        if (!active) return;
        setProduct(data.product);
        setTitle(data.product.title);
        setCategory(data.product.category);
        setLocation(data.product.location);
        setPrice(String(data.product.price));
        setDescription(data.product.description || "");
        setKeptImages(Array.isArray(data.product.images) ? data.product.images : []);
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error && error.message
              ? error.message
              : "상품 정보를 불러오지 못했습니다.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadProduct();
    return () => {
      active = false;
    };
  }, [id]);

  function handleImagesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setMessage("");

    const currentTotal = keptImages.length + newImages.length;
    const remaining = Math.max(0, MAX_IMAGES - currentTotal);
    if (remaining === 0) {
      setMessage(`사진은 최대 ${MAX_IMAGES}장까지 등록할 수 있습니다.`);
      event.target.value = "";
      return;
    }

    const picked = files.slice(0, remaining);
    const validFiles = picked.filter(
      (file) => file.type.startsWith("image/") && file.size <= MAX_IMAGE_SIZE,
    );

    if (validFiles.length !== picked.length) {
      setMessage("이미지 파일만 등록할 수 있으며, 각 파일은 2MB 이하여야 합니다.");
    } else if (files.length > remaining) {
      setMessage(`사진은 최대 ${MAX_IMAGES}장까지 등록할 수 있습니다.`);
    }

    const nextImages = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setNewImages((current) => [...current, ...nextImages].slice(0, remaining));
    event.target.value = "";
  }

  function removeKeptImage(index: number) {
    setKeptImages((current) => current.filter((_, i) => i !== index));
  }

  function removeNewImage(index: number) {
    setNewImages((current) => {
      const target = current[index];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return current.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) return;
    setMessage("");
    setIsSubmitting(true);

    try {
      const uploadedUrls = await uploadImages(newImages.map((image) => image.file));
      const images = [...keptImages, ...uploadedUrls].slice(0, MAX_IMAGES);

      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          category,
          location,
          price: Number(price),
          description,
          images,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || "상품 수정에 실패했습니다.");
      }

      newImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setNewImages([]);
      router.push(`/market/${id}`);
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error && error.message
          ? error.message
          : "상품 수정에 실패했습니다.",
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
            href={id ? `/market/${id}` : "/market"}
          >
            상세로 돌아가기
          </Link>
        </header>

        <section className="mt-10 rounded-2xl border border-[#e9ede7] bg-white p-6 shadow-sm sm:mt-14 sm:p-10">
          <div className="mb-8">
            <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#7da17d]">
              EDIT PRODUCT
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">상품 정보 수정</h1>
            <p className="mt-3 text-sm text-[#7b8579]">
              상품 정보와 사진을 수정한 뒤 저장하면 상세 페이지에 반영됩니다.
            </p>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-[#edf0eb] bg-[#fbfcfa] p-6 text-sm text-[#687367]">
              상품 정보를 불러오는 중이에요...
            </div>
          ) : loadError ? (
            <div className="rounded-xl border border-[#f0ddd7] bg-[#fff8f6] p-6">
              <p className="text-sm font-semibold text-[#a15c42]">{loadError}</p>
              <Link
                className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-[#dce6da] px-4 text-sm font-semibold text-[#687367] transition hover:bg-[#f8faf7]"
                href="/market"
              >
                목록으로 돌아가기
              </Link>
            </div>
          ) : !product ? (
            <div className="rounded-xl border border-[#edf0eb] bg-[#fbfcfa] p-6 text-sm text-[#687367]">
              상품을 찾을 수 없습니다.
            </div>
          ) : sessionStatus === "loading" ? (
            <div className="rounded-xl border border-[#edf0eb] bg-[#fbfcfa] p-6 text-sm text-[#687367]">
              로그인 상태를 확인하는 중이에요...
            </div>
          ) : sessionStatus !== "authenticated" ? (
            <div className="rounded-xl border border-[#edf0eb] bg-[#fbfcfa] p-6">
              <p className="text-sm font-semibold text-[#687367]">
                로그인한 판매자만 상품을 수정할 수 있습니다.
              </p>
              <Link
                className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-[#3c7653] px-4 text-sm font-semibold text-white transition hover:bg-[#28583d]"
                href={`/login?callbackUrl=${encodeURIComponent(`/market/${id}/edit`)}`}
              >
                로그인하기
              </Link>
            </div>
          ) : product.sellerId !== session.user.id ? (
            <div className="rounded-xl border border-[#f0ddd7] bg-[#fff8f6] p-6">
              <p className="text-sm font-semibold text-[#a15c42]">
                이 상품을 등록한 판매자만 수정할 수 있습니다.
              </p>
              <Link
                className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-[#dce6da] px-4 text-sm font-semibold text-[#687367] transition hover:bg-[#f8faf7]"
                href={`/market/${id}`}
              >
                상품으로 돌아가기
              </Link>
            </div>
          ) : (
            <form className="grid gap-6" onSubmit={handleSubmit}>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                  <label className="text-sm font-semibold text-[#424b41]" htmlFor="edit-title">
                    상품명
                  </label>
                  <input
                    className={fieldClassName}
                    id="edit-title"
                    maxLength={80}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="상품명을 입력해 주세요"
                    required
                    value={title}
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-[#424b41]" htmlFor="edit-category">
                    카테고리
                  </label>
                  <select
                    className={fieldClassName}
                    id="edit-category"
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    value={category}
                  >
                    <option disabled value="">
                      카테고리를 선택해 주세요
                    </option>
                    <option>디지털기기</option>
                    <option>가구·인테리어</option>
                    <option>패션의류</option>
                    <option>생활가전</option>
                    <option>취미·게임</option>
                    <option>기타</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-[#424b41]" htmlFor="edit-price">
                    판매 가격
                  </label>
                  <div className="relative">
                    <input
                      className={`${fieldClassName} pr-12`}
                      id="edit-price"
                      min="0"
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0"
                      required
                      type="number"
                      value={price}
                    />
                    <span className="absolute inset-y-0 right-4 flex items-center text-sm text-[#8b9488]">
                      원
                    </span>
                  </div>
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <label className="text-sm font-semibold text-[#424b41]" htmlFor="edit-location">
                    거래 지역
                  </label>
                  <input
                    className={fieldClassName}
                    id="edit-location"
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="예: 성수동"
                    required
                    type="text"
                    value={location}
                  />
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <label className="text-sm font-semibold text-[#424b41]" htmlFor="edit-images">
                    상품 사진 <span className="font-normal text-[#9aa198]">(최대 {MAX_IMAGES}장)</span>
                  </label>

                  {(keptImages.length > 0 || newImages.length > 0) && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {keptImages.map((image, index) => (
                        <div
                          className="relative overflow-hidden rounded-xl border border-[#e6ebe4] bg-[#f7f9f6]"
                          key={`kept-${index}-${image.slice(0, 24)}`}
                        >
                          <img
                            alt={`등록된 상품 사진 ${index + 1}`}
                            className="aspect-square w-full object-cover"
                            src={image}
                          />
                          <button
                            className="absolute right-2 top-2 rounded-md bg-black/55 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-black/70"
                            onClick={() => removeKeptImage(index)}
                            type="button"
                          >
                            삭제
                          </button>
                        </div>
                      ))}
                      {newImages.map((image, index) => (
                        <div
                          className="relative overflow-hidden rounded-xl border border-[#dce6da] bg-[#f7f9f6]"
                          key={image.previewUrl}
                        >
                          <img
                            alt={`새 상품 사진 ${index + 1}`}
                            className="aspect-square w-full object-cover"
                            src={image.previewUrl}
                          />
                          <span className="absolute left-2 top-2 rounded-md bg-[#3c7653]/90 px-2 py-1 text-[10px] font-semibold text-white">
                            새 사진
                          </span>
                          <button
                            className="absolute right-2 top-2 rounded-md bg-black/55 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-black/70"
                            onClick={() => removeNewImage(index)}
                            type="button"
                          >
                            삭제
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <input
                    accept="image/*"
                    className="w-full rounded-lg border border-dashed border-[#dce4d9] bg-[#fbfcfa] px-4 py-3 text-sm text-[#687367] file:mr-3 file:rounded-md file:border-0 file:bg-[#edf3e9] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#3c6653]"
                    id="edit-images"
                    multiple
                    onChange={handleImagesChange}
                    type="file"
                  />
                  <p className="text-xs text-[#9aa198]">
                    기존 사진을 유지하거나 삭제하고, 새 사진을 추가할 수 있습니다. 저장 시 새 사진은 <code>public/uploads</code>에 업로드됩니다. (JPG/PNG/WEBP/GIF/AVIF, 파일당 최대 2MB)
                  </p>
                </div>

                <div className="grid gap-2 sm:col-span-2">
                  <label className="text-sm font-semibold text-[#424b41]" htmlFor="edit-description">
                    상품 설명
                  </label>
                  <textarea
                    className="min-h-40 w-full resize-y rounded-lg border border-[#e2e8df] bg-white px-4 py-3 text-sm leading-6 text-[#263229] outline-none transition placeholder:text-[#a5ada2] focus:border-[#78a27c] focus:ring-3 focus:ring-[#78a27c]/15"
                    id="edit-description"
                    maxLength={3000}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="상품 상태, 사용 기간, 구성품 등 이웃에게 알려줄 내용을 적어주세요."
                    required
                    value={description}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#edf0eb] pt-5 sm:flex-row sm:justify-end">
                <Link
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-[#dce6da] px-5 text-sm font-semibold text-[#687367] transition hover:bg-[#f8faf7]"
                  href={`/market/${id}`}
                >
                  취소
                </Link>
                <button
                  className="h-11 rounded-lg bg-[#3c7653] px-6 text-sm font-bold text-white transition hover:bg-[#28583d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3c7653] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? "저장 중..." : "수정 저장"}
                </button>
              </div>
              <p aria-live="polite" className="min-h-5 text-center text-xs text-[#a15c42]">
                {message}
              </p>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
export default function EditProductPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f8f9f6] px-5 py-7 text-[#263229] sm:px-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-[#e9ede7] bg-white p-6 text-sm text-[#687367] shadow-sm sm:p-10">
            ��ǰ ������ �ҷ����� ���̿���...
          </div>
        </main>
      }
    >
      <EditProductContent />
    </Suspense>
  );
}
