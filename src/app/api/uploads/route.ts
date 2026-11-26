import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "로그인 후 상품을 등록해 주세요." },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const files = formData
      .getAll("images")
      .filter((value): value is File => value instanceof File);

    if (files.length === 0) {
      return NextResponse.json(
        { message: "업로드할 이미지를 선택해 주세요." },
        { status: 400 },
      );
    }

    if (files.length > MAX_IMAGES) {
      return NextResponse.json(
        { message: `이미지는 최대 ${MAX_IMAGES}장까지 업로드할 수 있습니다.` },
        { status: 400 },
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      const ext = ALLOWED_IMAGE_TYPES[file.type];
      if (!ext) {
        return NextResponse.json(
          {
            message:
              "지원하지 않는 이미지 형식입니다. (JPG, PNG, WEBP, GIF, AVIF)",
          },
          { status: 400 },
        );
      }

      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { message: "각 이미지는 5MB 이하여야 합니다." },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${randomUUID()}.${ext}`;
      await writeFile(path.join(uploadDir, filename), buffer);
      urls.push(`/uploads/products/${filename}`);
    }

    return NextResponse.json({ images: urls }, { status: 201 });
  } catch (error) {
    console.error("Failed to upload images", error);
    return NextResponse.json(
      { message: "이미지 업로드에 실패했습니다." },
      { status: 500 },
    );
  }
}