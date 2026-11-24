import { NextResponse } from "next/server";
import { createNotice, getNotices } from "@/lib/notices";

export async function GET() {
  try {
    const notices = await getNotices();
    return NextResponse.json({ notices });
  } catch (error) {
    console.error("Failed to fetch notices", error);
    return NextResponse.json(
      { message: "공지 목록을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      category?: unknown;
      title?: unknown;
      content?: unknown;
      pinned?: unknown;
    };

    const notice = await createNotice({
      category: typeof body.category === "string" ? body.category : "",
      title: typeof body.title === "string" ? body.title : "",
      content: typeof body.content === "string" ? body.content : "",
      pinned: body.pinned === true,
    });

    return NextResponse.json({ notice }, { status: 201 });
  } catch (error) {
    console.error("Failed to create notice", error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : "공지 등록에 실패했습니다.";
    const status = message.includes("입력해 주세요") ? 400 : 500;
    return NextResponse.json({ message }, { status });
  }
}
