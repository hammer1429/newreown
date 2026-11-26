import { auth } from "@/auth";
import {
  sendChatMessage,
  startChatRoomWithUser,
} from "@/lib/chat-db";
import { getProductById } from "@/lib/products-db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
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
      { error: "문의 내용을 확인해 주세요." },
      { status: 400 },
    );
  }

  if (!isRecord(payload) || typeof payload.message !== "string") {
    return Response.json(
      { error: "문의 내용을 입력해 주세요." },
      { status: 400 },
    );
  }

  const content = payload.message.trim();
  if (!content || content.length > 2000) {
    return Response.json(
      { error: "문의 내용은 1자 이상 2,000자 이하로 입력해 주세요." },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const product = await getProductById(id);
  if (!product) {
    return Response.json(
      { error: "상품을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  if (product.status !== "selling") {
    return Response.json(
      { error: "판매 중인 상품에만 문의할 수 있습니다." },
      { status: 409 },
    );
  }

  if (!product.sellerId) {
    return Response.json(
      { error: "판매자 계정 정보를 확인할 수 없습니다." },
      { status: 409 },
    );
  }

  const result = await startChatRoomWithUser({
    currentUserId: session.user.id,
    currentUserName: session.user.name?.trim() || "reown 이웃",
    recipientUserId: product.sellerId,
    subject: `상품 문의: ${product.title}`.slice(0, 80),
    category: "거래",
  });

  if ("error" in result) {
    const recipientMissing = result.error === "recipient-not-found";
    return Response.json(
      {
        error: recipientMissing
          ? "판매자 계정을 찾을 수 없습니다."
          : "본인 상품에는 문의할 수 없습니다.",
      },
      { status: recipientMissing ? 404 : 400 },
    );
  }

  const message = await sendChatMessage({
    roomId: result.room.id,
    currentUserId: session.user.id,
    content,
  });

  if (!message) {
    return Response.json(
      { error: "채팅방을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return Response.json(
    { room: result.room, message },
    { status: 201, headers: { "Cache-Control": "private, no-store" } },
  );
}
