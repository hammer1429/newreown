import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createProduct, getProducts } from "@/lib/products-db";

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Failed to fetch products", error);
    return NextResponse.json(
      { message: "상품 목록을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "로그인 후 상품을 등록해 주세요." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      title?: unknown;
      category?: unknown;
      location?: unknown;
      price?: unknown;
      description?: unknown;
      icon?: unknown;
      background?: unknown;
      images?: unknown;
    };
    const sellerName =
      session.user.name?.trim() || session.user.email?.trim() || "회원";

    const product = await createProduct({
      title: typeof body.title === "string" ? body.title : "",
      category: typeof body.category === "string" ? body.category : "",
      location: typeof body.location === "string" ? body.location : "",
      price: typeof body.price === "number" ? body.price : Number(body.price),
      description: typeof body.description === "string" ? body.description : "",
      icon: typeof body.icon === "string" ? body.icon : undefined,
      background: typeof body.background === "string" ? body.background : undefined,
      images: Array.isArray(body.images)
        ? body.images.filter((image): image is string => typeof image === "string")
        : undefined,
      sellerId: session.user.id,
      sellerName,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Failed to create product", error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : "상품 등록에 실패했습니다.";
    const status = message.includes("입력해 주세요") || message.includes("올바르게")
      ? 400
      : 500;
    return NextResponse.json({ message }, { status });
  }
}