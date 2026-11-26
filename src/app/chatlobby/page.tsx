import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ChatLobbyClient from "./ChatLobbyClient";

export default function ChatLobbyPage() {
  return (
    <Suspense
      fallback={
        <main className="grid min-h-screen place-items-center bg-[#f8f9f6] px-5 text-sm text-[#738071]">
          <p role="status">채팅 목록을 불러오는 중이에요...</p>
        </main>
      }
    >
      <AuthenticatedChatLobby />
    </Suspense>
  );
}

async function AuthenticatedChatLobby() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=%2Fchatlobby");
  }

  return (
    <ChatLobbyClient
      userId={session.user.id}
      userName={session.user.name?.trim() || "reown 이웃"}
    />
  );
}
