import { auth } from "@/auth";
import {
  startChatRoom,
  listChatRooms,
  type ChatCategory,
} from "@/lib/chat-db";
import { normalizeEmail } from "@/lib/auth-users";

const categories: ChatCategory[] = ["거래", "동네", "문의"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isChatCategory(value: unknown): value is ChatCategory {
  return typeof value === "string" && categories.some((item) => item === value);
}

export async function GET() {
  const session = await auth();
  if (!session?.user.id) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const rooms = await listChatRooms(session.user.id);
  return Response.json(
    { rooms },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user.id) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return Response.json(
      { error: "요청 형식이 올바르지 않습니다." },
      { status: 415 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { error: "대화 정보를 확인해 주세요." },
      { status: 400 },
    );
  }

  if (!isRecord(payload)) {
    return Response.json(
      { error: "대화 정보를 확인해 주세요." },
      { status: 400 },
    );
  }

  const recipientEmail =
    typeof payload.recipientEmail === "string"
      ? normalizeEmail(payload.recipientEmail)
      : "";
  const subject =
    typeof payload.subject === "string" ? payload.subject.trim() : "";
  const category = isChatCategory(payload.category) ? payload.category : null;

  if (
    recipientEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)
  ) {
    return Response.json(
      { error: "상대방의 가입 이메일을 올바르게 입력해 주세요." },
      { status: 400 },
    );
  }

  if (!subject || subject.length > 80) {
    return Response.json(
      { error: "대화 주제를 1자 이상 80자 이하로 입력해 주세요." },
      { status: 400 },
    );
  }

  if (!category) {
    return Response.json(
      { error: "대화 유형을 선택해 주세요." },
      { status: 400 },
    );
  }

  const result = await startChatRoom({
    currentUserId: session.user.id,
    currentUserName: session.user.name?.trim() || "reown 이웃",
    recipientEmail,
    subject,
    category,
  });

  if ("error" in result) {
    const isRecipientMissing = result.error === "recipient-not-found";
    return Response.json(
      {
        error: isRecipientMissing
          ? "해당 이메일로 가입한 사용자를 찾을 수 없어요."
          : "본인과는 대화를 시작할 수 없어요.",
      },
      { status: isRecipientMissing ? 404 : 400 },
    );
  }

  return Response.json(
    { room: result.room },
    {
      status: result.created ? 201 : 200,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}
