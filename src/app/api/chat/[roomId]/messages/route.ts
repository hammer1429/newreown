import { auth } from "@/auth";
import { listChatMessages, sendChatMessage } from "@/lib/chat-db";

type RouteContext = {
  params: Promise<{ roomId: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function GET(_request: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user.id) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { roomId } = await context.params;
  const result = await listChatMessages(roomId, session.user.id);
  if (!result) {
    return Response.json(
      { error: "대화방을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return Response.json(
    result,
    { headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: Request, context: RouteContext) {
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
      { error: "메시지 내용을 확인해 주세요." },
      { status: 400 },
    );
  }

  if (!isRecord(payload) || typeof payload.content !== "string") {
    return Response.json(
      { error: "메시지 내용을 입력해 주세요." },
      { status: 400 },
    );
  }

  const content = payload.content.trim();
  if (!content || content.length > 2000) {
    return Response.json(
      { error: "메시지는 1자 이상 2,000자 이하로 입력해 주세요." },
      { status: 400 },
    );
  }

  const { roomId } = await context.params;
  const message = await sendChatMessage({
    roomId,
    currentUserId: session.user.id,
    content,
  });

  if (!message) {
    return Response.json(
      { error: "대화방을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return Response.json(
    { message },
    { status: 201, headers: { "Cache-Control": "private, no-store" } },
  );
}
