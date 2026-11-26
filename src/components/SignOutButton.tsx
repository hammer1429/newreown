"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      className="rounded-lg border border-[#dce6da] bg-white px-4 py-2 text-sm font-bold text-[#3c7653] transition hover:bg-[#f0f5ee]"
      onClick={() => signOut({ redirectTo: "/" })}
      type="button"
    >
      로그아웃
    </button>
  );
}
