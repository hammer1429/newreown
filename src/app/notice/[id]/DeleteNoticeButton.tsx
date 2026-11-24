"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteNoticeButtonProps = {
  noticeId: string;
};

export default function DeleteNoticeButton({ noticeId }: DeleteNoticeButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (isDeleting) return;
    const confirmed = window.confirm("이 공지사항을 삭제할까요? 삭제 후에는 되돌릴 수 없습니다.");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/notices/${noticeId}`, {
        method: "DELETE",
      });
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.message || "공지 삭제에 실패했습니다.");
      }

      router.push("/notice");
      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error && error.message
          ? error.message
          : "공지 삭제에 실패했습니다.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <button
      className="inline-flex h-11 items-center justify-center rounded-lg border border-[#e7c9c2] px-5 text-sm font-semibold text-[#a15c42] transition hover:bg-[#fff5f2] disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isDeleting}
      onClick={handleDelete}
      type="button"
    >
      {isDeleting ? "삭제 중..." : "공지 삭제"}
    </button>
  );
}