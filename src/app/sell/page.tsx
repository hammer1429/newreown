"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";

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
    throw new Error(data.message || "??? ???? ??????.");
  }

  return data.images;
}

export default function SellPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const selectedImagesRef = useRef<SelectedImage[]>([]);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  function handleImagesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setMessage("");

    const remaining = Math.max(0, MAX_IMAGES - selectedImages.length);
    if (remaining === 0) {
      setMessage(`??? ?? ${MAX_IMAGES}??? ??? ? ????.`);
      event.target.value = "";
      return;
    }

    const picked = files.slice(0, remaining);
    const validFiles = picked.filter(
      (file) => file.type.startsWith("image/") && file.size <= MAX_IMAGE_SIZE,
    );

    if (validFiles.length !== picked.length) {
      setMessage("??? ??? ??? ? ???, ? ??? 2MB ???? ???.");
    } else if (files.length > remaining) {
      setMessage(`??? ?? ${MAX_IMAGES}??? ??? ? ????.`);
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
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const condition = String(formData.get("condition") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const fullDescription = condition
      ? `?? ??: ${condition}\n\n${description}`
      : description;

    const payloadBase = {
      title: String(formData.get("title") ?? ""),
      category: String(formData.get("category") ?? ""),
      location: String(formData.get("location") ?? ""),
      price: Number(formData.get("price")),
      description: fullDescription,
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
        throw new Error(data.message || "?? ??? ??????.");
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
          : "?? ??? ??????.",
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
            aria-label="reown ?"
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
            ????
          </Link>
        </header>

        <section className="mt-10 rounded-2xl border border-[#e9ede7] bg-white p-6 shadow-sm sm:mt-14 sm:p-10">
          <div className="mb-8">
            <p className="mb-2 text-xs font-bold tracking-[0.18em] text-[#7da17d]">
              SELL ON REOWN
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">
              ? ?? ????
            </h1>
            <p className="mt-3 text-sm text-[#7b8579]">
              ?? ??? ??? ???? ??? ? ?? ??? ? ???.
            </p>
          </div>

          <div className="mb-7 rounded-xl bg-[#f2f6ef] p-4 text-xs leading-5 text-[#60715e]">
            ??? ??(<code>public/uploads</code>)? ????, ?? ??? ?? ??? MongoDB? ?????.
          </div>

          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <label
                  className="text-sm font-semibold text-[#424b41]"
                  htmlFor="product-title"
                >
                  ???
                </label>
                <input
                  className={fieldClassName}
                  id="product-title"
                  maxLength={80}
                  name="title"
                  placeholder="???? ??? ???"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label
                  className="text-sm font-semibold text-[#424b41]"
                  htmlFor="product-category"
                >
                  ????
                </label>
                <select
                  className={fieldClassName}
                  defaultValue=""
                  id="product-category"
                  name="category"
                  required
                >
                  <option disabled value="">????? ??? ???</option>
                  <option>?????</option>
                  <option>???????</option>
                  <option>????</option>
                  <option>????</option>
                  <option>?????</option>
                  <option>??</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label
                  className="text-sm font-semibold text-[#424b41]"
                  htmlFor="product-price"
                >
                  ?? ??
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
                    ?
                  </span>
                </div>
              </div>

              <div className="grid gap-2">
                <label
                  className="text-sm font-semibold text-[#424b41]"
                  htmlFor="product-location"
                >
                  ?? ??
                </label>
                <select
                  className={fieldClassName}
                  defaultValue=""
                  id="product-location"
                  name="location"
                  required
                >
                  <option disabled value="">??? ??? ???</option>
                  <option>???</option>
                  <option>???</option>
                  <option>???</option>
                  <option>???</option>
                </select>
              </div>

              <div className="grid gap-2">
                <label
                  className="text-sm font-semibold text-[#424b41]"
                  htmlFor="product-condition"
                >
                  ?? ??
                </label>
                <select
                  className={fieldClassName}
                  defaultValue=""
                  id="product-condition"
                  name="condition"
                  required
                >
                  <option disabled value="">??? ??? ???</option>
                  <option>? ??</option>
                  <option>??? ?? ??</option>
                  <option>??? ??</option>
                  <option>??? ??</option>
                </select>
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <label
                  className="text-sm font-semibold text-[#424b41]"
                  htmlFor="product-description"
                >
                  ?? ??
                </label>
                <textarea
                  className="min-h-40 w-full resize-y rounded-lg border border-[#e2e8df] bg-white px-4 py-3 text-sm leading-6 text-[#263229] outline-none transition placeholder:text-[#a5ada2] focus:border-[#78a27c] focus:ring-3 focus:ring-[#78a27c]/15"
                  id="product-description"
                  maxLength={3000}
                  name="description"
                  placeholder="?? ??, ?? ??, ??? ? ???? ??? ??? ?????."
                  required
                />
              </div>

              <div className="grid gap-2 sm:col-span-2">
                <label
                  className="text-sm font-semibold text-[#424b41]"
                  htmlFor="product-images"
                >
                  ?? ?? <span className="font-normal text-[#9aa198]">(??, ?? {MAX_IMAGES}?)</span>
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
                  ???? ???? ????? ????, ?? ? <code>public/uploads</code>? ??????. (JPG/PNG/WEBP/GIF/AVIF, ??? ?? 2MB)
                </p>
                {selectedImages.length > 0 ? (
                  <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {selectedImages.map((image, index) => (
                      <div
                        className="relative overflow-hidden rounded-xl border border-[#e6ebe4] bg-[#f7f9f6]"
                        key={image.previewUrl}
                      >
                        <img
                          alt={`??? ?? ?? ${index + 1}`}
                          className="aspect-square w-full object-cover"
                          src={image.previewUrl}
                        />
                        <button
                          className="absolute right-2 top-2 rounded-md bg-black/55 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-black/70"
                          onClick={() => removeImage(index)}
                          type="button"
                        >
                          ??
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#edf0eb] pt-5 sm:flex-row sm:justify-end">
              <Link
                className="inline-flex h-11 items-center justify-center rounded-lg border border-[#dce6da] px-5 text-sm font-semibold text-[#687367] transition hover:bg-[#f8faf7]"
                href="/market"
              >
                ??
              </Link>
              <button
                className="h-11 rounded-lg bg-[#3c7653] px-6 text-sm font-bold text-white transition hover:bg-[#28583d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3c7653] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "?? ?..." : "?? ??"}
              </button>
            </div>
            <p
              aria-live="polite"
              className="min-h-5 text-center text-xs text-[#a15c42]"
            >
              {message}
            </p>
          </form>
        </section>

        <footer className="mt-8 border-t border-[#e9ede7] py-6 text-center text-xs text-[#a0a69d]">
          ? 2026 reown. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
