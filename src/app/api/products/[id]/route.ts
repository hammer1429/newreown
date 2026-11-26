import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  deleteProduct,
  getProductById,
  updateProduct,
  updateProductStatus,
} from "@/lib/products-db";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json(
        { message: "상품을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Failed to fetch product", error);
    return NextResponse.json(
      { message: "상품 정보를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "로그인 후 상품을 수정해 주세요." },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as {
      status?: unknown;
      title?: unknown;
      category?: unknown;
      location?: unknown;
      price?: unknown;
      description?: unknown;
      icon?: unknown;
      background?: unknown;
      images?: unknown;
    };

    const hasDetailFields =
      body.title !== undefined ||
      body.category !== undefined ||
      body.location !== undefined ||
      body.price !== undefined ||
      body.description !== undefined ||
      body.images !== undefined ||
      body.icon !== undefined ||
      body.background !== undefined;

    let product = null;

    if (!hasDetailFields && (body.status === "selling" || body.status === "sold")) {
      product = await updateProductStatus(id, body.status, session.user.id);
    } else if (hasDetailFields) {
      product = await updateProduct(id, {
        title: typeof body.title === "string" ? body.title : "",
        category: typeof body.category === "string" ? body.category : "",
        location: typeof body.location === "string" ? body.location : "",
        price: typeof body.price === "number" ? body.price : Number(body.price),
        description: typeof body.description === "string" ? body.description : "",
        icon: typeof body.icon === "string" ? body.icon : undefined,
        background: typeof body.background === "string" ? body.background : undefined,
        images: Array.isArray(body.images)
          ? body.images.filter((image): image is string => typeof image === "string")
          : [],
        status: body.status === "sold" ? "sold" : body.status === "selling" ? "selling" : undefined,
      }, session.user.id);
    } else {
      return NextResponse.json(
        { message: "수정할 내용을 입력해 주세요." },
        { status: 400 },
      );
    }

    if (!product) {
      return NextResponse.json(
        { message: "상품을 찾을 수 없거나 수정 권한이 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Failed to update product", error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : "상품 수정에 실패했습니다.";
    const status = message.includes("입력해 주세요") || message.includes("올바르게")
      ? 400
      : 500;
    return NextResponse.json({ message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "로그인 후 상품을 삭제해 주세요." },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const deleted = await deleteProduct(id, session.user.id);

    if (!deleted) {
      return NextResponse.json(
        { message: "상품을 찾을 수 없거나 삭제 권한이 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete product", error);
    return NextResponse.json(
      { message: "상품 삭제에 실패했습니다." },
      { status: 500 },
    );
  }
}