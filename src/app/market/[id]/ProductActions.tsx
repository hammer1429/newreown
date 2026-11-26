"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, type FormEvent } from "react";
import type { ProductStatus } from "@/lib/products";

type ProductActionsProps = {
  productId: string;
  productTitle: string;
  sellerId?: string;
  status: ProductStatus;
};

export default function ProductActions({
  productId,
  productTitle,
  sellerId,
  status,
}: ProductActionsProps) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<ProductStatus>(status);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryError, setInquiryError] = useState("");
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);

  const isSold = currentStatus === "sold";
  const canManageProduct =
    sessionStatus === "authenticated" && session.user.id === sellerId;
  const canInquire =
    sessionStatus === "authenticated" &&
    Boolean(sellerId) &&
    session.user.id !== sellerId &&
    status === "selling";
  const loginHref = `/login?callbackUrl=${encodeURIComponent(`/market/${productId}`)}`;

  async function handleToggleSoldOut() {
    if (isUpdatingStatus) return;
    const nextStatus: ProductStatus = isSold ? "selling" : "sold";
    const confirmed = window.confirm(
      nextStatus === "sold"
        ? "이 상품을 품절 처리할까요?"
        : "이 상품을 판매중으로 변경할까요?",
    );
    if (!confirmed) return;

    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || "상품 상태 변경에 실패했습니다.");
      }

      setCurrentStatus(nextStatus);
      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error && error.message
          ? error.message
          : "상품 상태 변경에 실패했습니다.",
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  async function handleDelete() {
    if (isDeleting) return;
    const confirmed = window.confirm(
      "이 상품을 삭제할까요? 삭제 후에는 되돌릴 수 없습니다.",
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || "상품 삭제에 실패했습니다.");
      }

      router.push("/market");
      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error && error.message
          ? error.message
          : "상품 삭제에 실패했습니다.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSendInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inquiryMessage.trim() || isSendingInquiry) return;

    setInquiryError("");
    setIsSendingInquiry(true);

    try {
      const response = await fetch(`/api/products/${productId}/inquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inquiryMessage }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        room?: { id: string };
      };

      if (!response.ok || !data.room?.id) {
        throw new Error(data.error || "문의 전송에 실패했습니다.");
      }

      router.push("/chatlobby");
    } catch (error) {
      setInquiryError(
        error instanceof Error && error.message
          ? error.message
          : "문의 전송에 실패했습니다.",
      );
    } finally {
      setIsSendingInquiry(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          className="inline-flex h-11 items-center justify-center rounded-lg bg-[#3c7653] px-5 text-sm font-bold text-white transition hover:bg-[#28583d]"
          href="/market"
        >
          목록으로 돌아가기
        </Link>
        {canManageProduct ? (
          <>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[#dce6da] px-5 text-sm font-semibold text-[#687367] transition hover:bg-[#f8faf7]"
              href={`/market/${productId}/edit`}
            >
              상품 수정
            </Link>
            <button
              className={`inline-flex h-11 items-center justify-center rounded-lg border px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                isSold
                  ? "border-[#cfe0d1] bg-[#f4f8f3] text-[#3c7653] hover:bg-[#edf4ec]"
                  : "border-[#ead8c8] bg-[#fff8f2] text-[#a16207] hover:bg-[#fff1e6]"
              }`}
              disabled={isUpdatingStatus || isDeleting}
              onClick={handleToggleSoldOut}
              type="button"
            >
              {isUpdatingStatus
                ? "변경 중..."
                : isSold
                  ? "판매중으로 변경"
                  : "품절 처리"}
            </button>
            <button
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[#e7c9c2] px-5 text-sm font-semibold text-[#a15c42] transition hover:bg-[#fff5f2] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isDeleting || isUpdatingStatus}
              onClick={handleDelete}
              type="button"
            >
              {isDeleting ? "삭제 중..." : "상품 삭제"}
            </button>
          </>
        ) : canInquire ? (
          <button
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#3c7653] px-5 text-sm font-bold text-white transition hover:bg-[#28583d]"
            onClick={() => setIsInquiryOpen(true)}
            type="button"
          >
            판매 문의하기
          </button>
        ) : sessionStatus === "unauthenticated" &&
          sellerId &&
          status === "selling" ? (
          <Link
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#3c7653] px-5 text-sm font-bold text-white transition hover:bg-[#28583d]"
            href={loginHref}
          >
            로그인하고 판매 문의하기
          </Link>
        ) : null}
      </div>

      {isInquiryOpen && canInquire ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#17241a]/55 px-4 py-8">
          <section
            aria-labelledby="product-inquiry-title"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
            role="dialog"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-[#7da17d]">
                  CONTACT SELLER
                </p>
                <h2
                  className="mt-2 text-xl font-extrabold text-[#263229]"
                  id="product-inquiry-title"
                >
                  판매 문의
                </h2>
                <p className="mt-1 text-sm text-[#7b8579]">{productTitle}</p>
              </div>
              <button
                aria-label="문의 창 닫기"
                className="grid size-9 shrink-0 place-items-center rounded-lg text-xl text-[#687367] transition hover:bg-[#f2f6ef]"
                onClick={() => setIsInquiryOpen(false)}
                type="button"
              >
                ×
              </button>
            </div>

            <form className="grid gap-4" onSubmit={handleSendInquiry}>
              <label
                className="grid gap-2 text-sm font-semibold text-[#424b41]"
                htmlFor="product-inquiry-message"
              >
                문의 내용
                <textarea
                  autoFocus
                  className="min-h-36 w-full resize-y rounded-lg border border-[#e2e8df] bg-white px-4 py-3 text-sm font-normal leading-6 text-[#263229] outline-none transition placeholder:text-[#a5ada2] focus:border-[#78a27c] focus:ring-3 focus:ring-[#78a27c]/15"
                  id="product-inquiry-message"
                  maxLength={2000}
                  onChange={(event) => setInquiryMessage(event.target.value)}
                  placeholder="상품 상태나 거래 방법을 문의해 보세요."
                  required
                  value={inquiryMessage}
                />
              </label>
              {inquiryError ? (
                <p aria-live="polite" className="text-sm text-[#a15c42]">
                  {inquiryError}
                </p>
              ) : null}
              <div className="flex justify-end gap-3">
                <button
                  className="h-11 rounded-lg border border-[#dce6da] px-5 text-sm font-semibold text-[#687367] transition hover:bg-[#f8faf7]"
                  disabled={isSendingInquiry}
                  onClick={() => setIsInquiryOpen(false)}
                  type="button"
                >
                  취소
                </button>
                <button
                  className="h-11 rounded-lg bg-[#3c7653] px-5 text-sm font-bold text-white transition hover:bg-[#28583d] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSendingInquiry || !inquiryMessage.trim()}
                  type="submit"
                >
                  {isSendingInquiry ? "채팅 연결 중..." : "문의 보내고 채팅하기"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}