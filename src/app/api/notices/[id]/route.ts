import { NextResponse } from "next/server";
import { deleteNotice } from "@/lib/notices";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const deleted = await deleteNotice(id);

    if (!deleted) {
      return NextResponse.json(
        { message: "공지사항을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete notice", error);
    return NextResponse.json(
      { message: "공지 삭제에 실패했습니다." },
      { status: 500 },
    );
  }
}