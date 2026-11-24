import { NextResponse } from "next/server";
import { getProductById } from "@/lib/products-db";

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