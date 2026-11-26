"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

const fieldClassName =
  "h-12 w-full rounded-lg border border-[#e2e8df] bg-white px-4 text-sm text-[#263229] outline-none transition focus:border-[#78a27c] focus:ring-3 focus:ring-[#78a27c]/15";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

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

export default function NewProductPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const selectedImagesRef = useRef<SelectedImage[]>([]);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=%2Fmarket%2Fnew");
    }
  }, [router, status]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  const sellerName =
    session?.user?.name?.trim() || session?.user?.email?.trim() || "회원";

  function handleImagesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setMessage("");

    const remaining = Math.max(0, MAX_IMAGES - selectedImages.length);
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
      setMessage("이미지 파일만 등록할 수 있으며, 각 파일은 5MB 이하여야 합니다.");
    } else if (files.length > remaining) {
      setMessage(`사진은 최대 ${MAX_IMAGES}장까지 등록할 수 있습니다.`);
    }

    const nextImages = validFiles.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setSelectedImages((current) => [...current, ...nextImages].slice(0, MAX_IMAGES));
    event.target.value = "";
  }

  function removeImage(index: number) {
    setSelectedImages((current) => {
      const target = current[index];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return current.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status !== "authenticated") {
      setMessage("로그인 후 상품을 등록해 주세요.");
      return;
    }
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payloadBase = {
      title: String(formData.get("title") ?? ""),
      category: String(formData.get("category") ?? ""),
      location: String(formData.get("location") ?? ""),
      price: Number(formData.get("price")),
      description: String(formData.get("description") ?? ""),
    };

    setIsSubmitting(true);
    try {
      const imageUrls = await uploadImages(selectedImages.map((image) => image.file));

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payloadBase, images: imageUrls }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        product?: { id?: string };
      };

      if (!response.ok) {
        throw new Error(data.message || "상품 등록에 실패했습니다.");
      }

      selectedImages.forEach((image) => URL.revokeObjectURL(image.previewUrl));
      setSelectedImages([]);
      form.reset();
      const newId = data.product?.id;
      router.push(newId ? `/market/${newId}` : "/market");
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error && error.message
          ? error.message
          : "상품 등록에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (status !== "authenticated") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8f9f6] px-5 text-[#263229]">
        <section className="rounded-2xl border border-[#e9ede7] bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold text-[#687367]">
            {status === "loading" ? "로그인 정보를 확인하고 있어요." : "로그인이 필요합니다."}
          </p>
          {status === "unauthenticated" ? (
            <Link
              className="mt-4 inline-flex rounded-lg bg-[#3c7653] px-5 py-3 text-sm font-bold text-white"
              href="/login?callbackUrl=%2Fmarket%2Fnew"
            >
              로그인하러 가기
            </Link>
          ) : null}
        </section>
      </main>
    );
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
            href="/market"
          >
            동네마켓으로
          </Link>
        </header>

        <section className="mt-10 rounded-2xl border border-[#e9ede7] bg-white p-6 shadow-sm sm:mt-14 sm:p-10">
          <div className="mb-8">
            <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#7da17d]">
              SELL ON REOWN
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">새 상품 등록</h1>
            <p className="mt-3 text-sm text-[#7b8579]">
              상품 정보와 사진을 입력하면 상품이 등록되고 동네마켓에 바로 노출됩니다.
            </p>
          </div>

          <div className="mb-7 rounded-xl bg-[#f2f6ef] p-4 text-xs leading-5 text-[#60715e]">
            사진은 서버(<code>public/uploads</code>)에 저장되고, 상품 정보와 사진 경로는 MongoDB에 저장됩니다.
          </div>

          <div className="mb-7 grid gap-2 rounded-xl border border-[#e9ede7] bg-[#fbfcfa] p-4">
            <label className="text-sm font-semibold text-[#424b41]" htmlFor="product-seller">
              판매자
            </label>
            <input
              className={`${fieldClassName} cursor-not-allowed bg-[#f3f5f1] text-[#687367]`}
              disabled
              id="product-seller"
              value={sellerName}
            />
            <p className="text-xs text-[#8b9488]">
              현재 로그인한 계정으로 판매자가 자동 등록됩니다.
            </p>
          </div>

          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-semibold text-[#424b41]" htmlFor="product-title">
                  상품명
                </label>
                <input
                  className={fieldClassName}
                  id="product-title"
                  maxLength={80}
                  name="title"
                  placeholder="상품명을 입력해 주세요"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold text-[#424b41]" htmlFor="product-category">
                  카테고리
                </label>
                <select className={fieldClassName} defaultValue="" id="product-category" name="category" required>
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
                <label className="text-sm font-semibold text-[#424b41]" htmlFor="product-price">
                  판매 가격
                </label>
                <div className="relative">
                  <input
                    className={`${fieldClassName} pr-12`}
                    id="product-price"
                    min="0"
                    name="price"
                    placeholder="0"
                    required
                    type="number"
                  />
                  <span className="absolute inset-y-0 right-4 flex items-center text-sm text-[#8b9488]">
                    원
                  </span>
                </div>
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-semibold text-[#424b41]" htmlFor="product-location">
                  거래 지역
                </label>
                <input
                  className={fieldClassName}
                  id="product-location"
                  name="location"
                  placeholder="예: 성수동"
                  required
                  type="text"
                />
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-semibold text-[#424b41]" htmlFor="product-images">
                  상품 사진 <span className="font-normal text-[#9aa198]">(선택, 최대 {MAX_IMAGES}장)</span>
                </label>
                <input
                  accept="image/*"
                  className="w-full rounded-lg border border-dashed border-[#dce4d9] bg-[#fbfcfa] px-4 py-3 text-sm text-[#687367] file:mr-3 file:rounded-md file:border-0 file:bg-[#edf3e9] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#3c6653]"
                  id="product-images"
                  multiple
                  name="images"
                  onChange={handleImagesChange}
                  type="file"
                />
                <p className="text-xs text-[#9aa198]">
                  이미지를 선택하면 미리보기가 표시되고, 등록 시 <code>public/uploads</code>에 업로드됩니다. (JPG/PNG/WEBP/GIF/AVIF, 파일당 최대 5MB)
                </p>
                {selectedImages.length > 0 ? (
                  <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {selectedImages.map((image, index) => (
                      <div
                        className="relative overflow-hidden rounded-xl border border-[#e6ebe4] bg-[#f7f9f6]"
                        key={image.previewUrl}
                      >
                        <img
                          alt={`선택한 상품 사진 ${index + 1}`}
                          className="aspect-square w-full object-cover"
                          src={image.previewUrl}
                        />
                        <button
                          className="absolute right-2 top-2 rounded-md bg-black/55 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-black/70"
                          onClick={() => removeImage(index)}
                          type="button"
                        >
                          삭제
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <label className="text-sm font-semibold text-[#424b41]" htmlFor="product-description">
                  상품 설명
                </label>
                <textarea
                  className="min-h-40 w-full resize-y rounded-lg border border-[#e2e8df] bg-white px-4 py-3 text-sm leading-6 text-[#263229] outline-none transition placeholder:text-[#a5ada2] focus:border-[#78a27c] focus:ring-3 focus:ring-[#78a27c]/15"
                  id="product-description"
                  maxLength={3000}
                  name="description"
                  placeholder="상품 상태, 사용 기간, 구성품 등 이웃에게 알려줄 내용을 적어주세요."
                  required
                />
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#edf0eb] pt-5 sm:flex-row sm:justify-end">
              <Link
                className="inline-flex h-11 items-center justify-center rounded-lg border border-[#dce6da] px-5 text-sm font-semibold text-[#687367] transition hover:bg-[#f8faf7]"
                href="/market"
              >
                취소
              </Link>
              <button
                className="h-11 rounded-lg bg-[#3c7653] px-6 text-sm font-bold text-white transition hover:bg-[#28583d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3c7653] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "등록 중..." : "상품 등록"}
              </button>
            </div>
            <p aria-live="polite" className="min-h-5 text-center text-xs text-[#a15c42]">
              {message}
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
