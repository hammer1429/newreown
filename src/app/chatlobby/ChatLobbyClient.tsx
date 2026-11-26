"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";

type ChatCategory = "거래" | "동네" | "문의";
type ChatTab = "전체" | "안 읽음" | ChatCategory;

type ChatRoom = {
  id: string;
  peerName: string;
  subject: string;
  category: ChatCategory;
  lastMessage: string;
  time: string;
  unreadCount: number;
};

type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  time: string;
};

const tabs: ChatTab[] = ["전체", "안 읽음", "거래", "동네", "문의"];
const categories: ChatCategory[] = ["거래", "동네", "문의"];

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function ChatLobbyClient({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState("");
  const [activeRoomId, setActiveRoomId] = useState("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<ChatTab>("전체");
  const [showNewRoomForm, setShowNewRoomForm] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<ChatCategory>("문의");
  const [draftMessage, setDraftMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const activeRoom = rooms.find((room) => room.id === activeRoomId);
  const totalUnread = rooms.reduce((sum, room) => sum + room.unreadCount, 0);

  const visibleRooms = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return rooms.filter((room) => {
      const matchesTab =
        activeTab === "전체" ||
        (activeTab === "안 읽음" && room.unreadCount > 0) ||
        room.category === activeTab;
      const matchesSearch =
        !keyword ||
        `${room.peerName} ${room.subject} ${room.lastMessage} ${room.category}`
          .toLowerCase()
          .includes(keyword);
      return matchesTab && matchesSearch;
    });
  }, [activeTab, rooms, search]);

  useEffect(() => {
    let active = true;

    async function loadRooms() {
      try {
        const response = await fetch("/api/chat", { cache: "no-store" });
        const data = (await response.json()) as {
          error?: string;
          rooms?: ChatRoom[];
        };
        if (!response.ok) {
          throw new Error(data.error ?? "채팅 목록을 불러오지 못했어요.");
        }

        const nextRooms = Array.isArray(data.rooms) ? data.rooms : [];
        if (active) {
          setRooms(nextRooms);
          setActiveRoomId((current) => current || nextRooms[0]?.id || "");
          setRoomsError("");
        }
      } catch (error) {
        if (active) {
          setRoomsError(
            getErrorMessage(error, "채팅 목록을 불러오지 못했어요."),
          );
        }
      } finally {
        if (active) {
          setRoomsLoading(false);
        }
      }
    }

    void loadRooms();
    const intervalId = window.setInterval(() => void loadRooms(), 10000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!activeRoomId) {
      return;
    }

    let active = true;

    async function loadMessages() {
      try {
        const response = await fetch(
          `/api/chat/${encodeURIComponent(activeRoomId)}/messages`,
          { cache: "no-store" },
        );
        const data = (await response.json()) as {
          error?: string;
          messages?: ChatMessage[];
        };
        if (!response.ok) {
          throw new Error(data.error ?? "대화 내용을 불러오지 못했어요.");
        }

        if (active) {
          setMessages(Array.isArray(data.messages) ? data.messages : []);
          setMessagesError("");
          setRooms((current) =>
            current.map((room) =>
              room.id === activeRoomId ? { ...room, unreadCount: 0 } : room,
            ),
          );
        }
      } catch (error) {
        if (active) {
          setMessagesError(
            getErrorMessage(error, "대화 내용을 불러오지 못했어요."),
          );
        }
      } finally {
        if (active) {
          setMessagesLoading(false);
        }
      }
    }

    void loadMessages();
    const intervalId = window.setInterval(() => void loadMessages(), 5000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [activeRoomId]);

  async function handleCreateRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setCreatingRoom(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail, subject, category }),
      });
      const data = (await response.json()) as {
        error?: string;
        room?: ChatRoom;
      };
      if (!response.ok || !data.room) {
        throw new Error(data.error ?? "대화방을 만들지 못했어요.");
      }

      const room = data.room;
      setRooms((current) => [
        room,
        ...current.filter((item) => item.id !== room.id),
      ]);
      setActiveRoomId(room.id);
      setMessages([]);
      setMessagesLoading(true);
      setMessagesError("");
      setRecipientEmail("");
      setSubject("");
      setShowNewRoomForm(false);
    } catch (error) {
      setFormError(getErrorMessage(error, "대화방을 만들지 못했어요."));
    } finally {
      setCreatingRoom(false);
    }
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeRoomId || !draftMessage.trim()) {
      return;
    }

    setSendingMessage(true);
    setMessagesError("");

    try {
      const response = await fetch(
        `/api/chat/${encodeURIComponent(activeRoomId)}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: draftMessage }),
        },
      );
      const data = (await response.json()) as {
        error?: string;
        message?: ChatMessage;
      };
      if (!response.ok || !data.message) {
        throw new Error(data.error ?? "메시지를 보내지 못했어요.");
      }

      const message = data.message;
      setMessages((current) => [...current, message]);
      setRooms((current) =>
        current.map((room) =>
          room.id === activeRoomId
            ? {
                ...room,
                lastMessage: message.content,
                time: "방금 전",
              }
            : room,
        ),
      );
      setDraftMessage("");
    } catch (error) {
      setMessagesError(getErrorMessage(error, "메시지를 보내지 못했어요."));
    } finally {
      setSendingMessage(false);
    }
  }

  function selectRoom(room: ChatRoom) {
    if (room.id === activeRoomId) {
      return;
    }
    setActiveRoomId(room.id);
    setMessages([]);
    setMessagesLoading(true);
    setMessagesError("");
  }

  return (
    <div className="min-h-screen bg-[#f8f9f6] text-[#263229]">
      <header className="sticky top-0 z-20 border-b border-[#e9ede7] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
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
          <nav className="flex items-center gap-4 text-sm font-semibold text-[#647064]">
            <Link className="transition hover:text-[#315d3d]" href="/market">
              동네마켓
            </Link>
            <Link className="text-[#315d3d]" href="/chatlobby">
              채팅
            </Link>
            <Link className="transition hover:text-[#315d3d]" href="/mypage">
              마이페이지
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
        <section className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-bold tracking-[0.18em] text-[#97a095]">
              NEIGHBORHOOD CHAT
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#26392b]">
              채팅
            </h1>
            <p className="mt-2 text-sm text-[#738071]">
              {userName}님, 이웃과 나눈 대화를 확인해요.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[#e6ebe4] bg-white px-4 py-3 text-sm shadow-sm">
              <p className="text-xs font-semibold text-[#8a9387]">
                읽지 않은 메시지
              </p>
              <p className="mt-1 text-lg font-extrabold text-[#3c7653]">
                {totalUnread}개
              </p>
            </div>
            <button
              className="h-11 rounded-lg bg-[#3c7653] px-4 text-sm font-bold text-white transition hover:bg-[#28583d]"
              onClick={() => {
                setShowNewRoomForm((current) => !current);
                setFormError("");
              }}
              type="button"
            >
              새 대화
            </button>
          </div>
        </section>

        {showNewRoomForm ? (
          <section className="mb-5 rounded-2xl border border-[#e7ece5] bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="font-bold">새 대화 시작하기</h2>
              <p className="mt-1 text-xs text-[#8a9387]">
                상대방의 가입 이메일과 대화 주제를 입력해 주세요.
              </p>
            </div>
            <form
              className="grid gap-3 sm:grid-cols-[1fr_1fr_150px_auto]"
              onSubmit={handleCreateRoom}
            >
              <label className="grid gap-1.5 text-xs font-semibold text-[#596653]">
                상대방 이메일
                <input
                  autoComplete="email"
                  className="h-10 rounded-lg border border-[#e2e8df] px-3 text-sm font-normal text-[#263229] outline-none focus:border-[#78a27c]"
                  onChange={(event) => setRecipientEmail(event.target.value)}
                  placeholder="neighbor@example.com"
                  required
                  type="email"
                  value={recipientEmail}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-[#596653]">
                대화 주제
                <input
                  className="h-10 rounded-lg border border-[#e2e8df] px-3 text-sm font-normal text-[#263229] outline-none focus:border-[#78a27c]"
                  maxLength={80}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="예: 원목 의자 거래"
                  required
                  value={subject}
                />
              </label>
              <label className="grid gap-1.5 text-xs font-semibold text-[#596653]">
                유형
                <select
                  className="h-10 rounded-lg border border-[#e2e8df] bg-white px-3 text-sm font-normal text-[#263229] outline-none focus:border-[#78a27c]"
                  onChange={(event) =>
                    setCategory(event.target.value as ChatCategory)
                  }
                  value={category}
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="mt-auto h-10 rounded-lg border border-[#dce6da] px-4 text-sm font-bold text-[#3c7653] transition hover:bg-[#f5f8f3] disabled:opacity-60"
                disabled={creatingRoom}
                type="submit"
              >
                {creatingRoom ? "만드는 중..." : "대화 시작"}
              </button>
            </form>
            {formError ? (
              <p aria-live="polite" className="mt-3 text-xs text-rose-600">
                {formError}
              </p>
            ) : null}
          </section>
        ) : null}

        {roomsError ? (
          <p
            aria-live="polite"
            className="mb-4 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            role="alert"
          >
            {roomsError}
          </p>
        ) : null}

        <section className="grid min-h-[560px] overflow-hidden rounded-2xl border border-[#e9ede7] bg-white shadow-sm lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="border-b border-[#edf0eb] lg:border-r lg:border-b-0">
            <div className="border-b border-[#edf0eb] p-4">
              <label className="flex h-10 items-center gap-2 rounded-lg border border-[#e6ebe4] bg-[#f8faf7] px-3 text-[#7b8579]">
                <span aria-hidden="true">⌕</span>
                <input
                  aria-label="대화 검색"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9aa198]"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="대화 검색"
                  type="search"
                  value={search}
                />
              </label>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {tabs.map((tab) => (
                  <button
                    aria-pressed={activeTab === tab}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                      activeTab === tab
                        ? "border-[#3c7653] bg-[#3c7653] text-white"
                        : "border-[#e5eae2] bg-white text-[#677265]"
                    }`}
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    type="button"
                  >
                    {tab}
                    {tab === "안 읽음" && totalUnread > 0
                      ? ` ${totalUnread}`
                      : ""}
                  </button>
                ))}
              </div>
            </div>

            {roomsLoading ? (
              <div className="p-6 text-center text-sm text-[#939b91]">
                채팅 목록을 불러오는 중이에요...
              </div>
            ) : visibleRooms.length > 0 ? (
              <ul className="max-h-[520px] divide-y divide-[#f0f2ee] overflow-y-auto">
                {visibleRooms.map((room) => {
                  const isActive = room.id === activeRoomId;
                  const avatar = Array.from(room.peerName)[0] ?? "이";
                  return (
                    <li key={room.id}>
                      <button
                        aria-current={isActive ? "true" : undefined}
                        className={`flex w-full items-center gap-3 px-4 py-4 text-left transition ${
                          isActive ? "bg-[#f0f5ee]" : "hover:bg-[#f8faf7]"
                        }`}
                        onClick={() => selectRoom(room)}
                        type="button"
                      >
                        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eff4ed] font-bold text-[#537354]">
                          {avatar}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-bold text-[#2f3d33]">
                              {room.peerName} · {room.subject}
                            </span>
                            <span className="shrink-0 text-[10px] text-[#9aa198]">
                              {room.time}
                            </span>
                          </span>
                          <span className="mt-1 flex items-center justify-between gap-2">
                            <span className="truncate text-xs text-[#8a9387]">
                              {room.lastMessage}
                            </span>
                            {room.unreadCount > 0 ? (
                              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#3c7653] text-[10px] font-bold text-white">
                                {room.unreadCount}
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-1 inline-flex rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#798475]">
                            {room.category}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-5 py-12 text-center">
                <span
                  aria-hidden="true"
                  className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#eff4ed] text-2xl text-[#85a283]"
                >
                  💬
                </span>
                <strong className="mt-3 block text-sm text-[#465044]">
                  {rooms.length === 0
                    ? "아직 대화가 없어요"
                    : "조건에 맞는 대화가 없어요"}
                </strong>
                <p className="mt-1 text-xs leading-5 text-[#939b91]">
                  {rooms.length === 0
                    ? "새 대화를 시작해 이웃에게 말을 걸어보세요."
                    : "검색어나 탭을 바꿔 다시 찾아보세요."}
                </p>
                {rooms.length === 0 ? (
                  <button
                    className="mt-4 text-xs font-bold text-[#3c7653] hover:underline"
                    onClick={() => setShowNewRoomForm(true)}
                    type="button"
                  >
                    새 대화 시작하기
                  </button>
                ) : null}
              </div>
            )}
          </aside>

          <section
            aria-label="대화 내용"
            className="flex min-h-[420px] min-w-0 flex-col"
          >
            {activeRoom ? (
              <>
                <div className="border-b border-[#edf0eb] px-5 py-4">
                  <p className="text-sm font-bold text-[#2f3d33]">
                    {activeRoom.peerName}
                  </p>
                  <p className="mt-1 text-xs text-[#8a9387]">
                    {activeRoom.subject} · {activeRoom.category}
                  </p>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto bg-[#fbfcfa] p-4 sm:p-5">
                  {messagesLoading && messages.length === 0 ? (
                    <p className="py-10 text-center text-xs text-[#939b91]">
                      대화 내용을 불러오는 중이에요...
                    </p>
                  ) : messages.length > 0 ? (
                    messages.map((message) => {
                      const isMine = message.senderId === userId;
                      return (
                        <div
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                          key={message.id}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                              isMine
                                ? "rounded-br-sm bg-[#3c7653] text-white"
                                : "rounded-bl-sm border border-[#e9ede7] bg-white text-[#384638]"
                            }`}
                          >
                            {!isMine ? (
                              <p className="mb-1 text-[10px] font-bold opacity-70">
                                {message.senderName}
                              </p>
                            ) : null}
                            <p className="whitespace-pre-wrap break-words text-sm leading-6">
                              {message.content}
                            </p>
                            <p
                              className={`mt-1 text-right text-[10px] ${
                                isMine ? "text-white/70" : "text-[#9aa198]"
                              }`}
                            >
                              {message.time}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="grid h-full min-h-48 place-items-center text-center">
                      <p className="text-sm text-[#939b91]">
                        첫 메시지를 보내 대화를 시작해 보세요.
                      </p>
                    </div>
                  )}
                  {messagesError ? (
                    <p aria-live="polite" className="text-center text-xs text-rose-600">
                      {messagesError}
                    </p>
                  ) : null}
                </div>

                <form
                  className="flex items-end gap-2 border-t border-[#edf0eb] p-3 sm:p-4"
                  onSubmit={handleSendMessage}
                >
                  <label className="sr-only" htmlFor="chat-message">
                    메시지 입력
                  </label>
                  <textarea
                    className="max-h-32 min-h-11 flex-1 resize-y rounded-lg border border-[#e2e8df] px-3 py-2.5 text-sm leading-5 outline-none focus:border-[#78a27c]"
                    id="chat-message"
                    maxLength={2000}
                    onChange={(event) => setDraftMessage(event.target.value)}
                    placeholder="메시지를 입력하세요"
                    required
                    value={draftMessage}
                  />
                  <button
                    className="h-11 shrink-0 rounded-lg bg-[#3c7653] px-4 text-sm font-bold text-white transition hover:bg-[#28583d] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={sendingMessage || !draftMessage.trim()}
                    type="submit"
                  >
                    {sendingMessage ? "전송 중" : "전송"}
                  </button>
                </form>
              </>
            ) : (
              <div className="grid flex-1 place-items-center px-6 text-center">
                <div>
                  <span
                    aria-hidden="true"
                    className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#eff4ed] text-2xl"
                  >
                    💬
                  </span>
                  <p className="mt-3 text-sm font-semibold text-[#647064]">
                    대화를 선택하거나 새 대화를 시작해 보세요.
                  </p>
                </div>
              </div>
            )}
          </section>
        </section>

        <p className="mt-4 text-center text-xs text-[#a0a69d]">
          채팅방과 메시지는 로그인한 계정에 연결되어 저장됩니다.
        </p>
      </main>
    </div>
  );
}
