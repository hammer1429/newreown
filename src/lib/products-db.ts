import "server-only";

import { ObjectId, type Collection, type WithId } from "mongodb";
import { connection } from "next/server";
import { connectToDatabase } from "./dbconnect";
import { formatRelativeTime, type Product } from "./products";

export type ProductDocument = {
  title: string;
  category: string;
  location: string;
  price: number;
  likes?: number;
  icon?: string;
  background?: string;
  description?: string;
  images?: string[];
  createdAt: Date;
};

async function getProductsCollection(): Promise<Collection<ProductDocument>> {
  const { db } = await connectToDatabase();
  return db.collection<ProductDocument>("products");
}

function toProduct(doc: WithId<ProductDocument>): Product {
  const createdAt =
    doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt);

  return {
    id: doc._id.toString(),
    createdAt: createdAt.toISOString(),
    title: doc.title,
    category: doc.category,
    location: doc.location,
    price: Number(doc.price) || 0,
    likes: Number(doc.likes) || 0,
    time: formatRelativeTime(createdAt),
    icon: doc.icon || "📦",
    background: doc.background || "linear-gradient(135deg, #eef3ea, #d9e4d3)",
    description: doc.description || "",
    images: Array.isArray(doc.images)
      ? doc.images.filter((image): image is string => typeof image === "string" && image.length > 0)
      : [],
  };
}

export async function getProducts(): Promise<Product[]> {
  await connection();
  const collection = await getProductsCollection();
  const docs = await collection.find({}).sort({ createdAt: -1, _id: -1 }).toArray();
  return docs.map(toProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  await connection();
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const collection = await getProductsCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return doc ? toProduct(doc) : null;
}

export type CreateProductInput = {
  title: string;
  category: string;
  location: string;
  price: number;
  description: string;
  icon?: string;
  background?: string;
  images?: string[];
};

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const title = input.title.trim();
  const category = input.category.trim();
  const location = input.location.trim();
  const description = input.description.trim();
  const price = Number(input.price);
  const icon = (input.icon || "📦").trim() || "📦";
  const background =
    (input.background || "linear-gradient(135deg, #eef3ea, #d9e4d3)").trim() ||
    "linear-gradient(135deg, #eef3ea, #d9e4d3)";
  const images = Array.isArray(input.images)
    ? input.images
        .filter(
          (image): image is string =>
            typeof image === "string" &&
            (image.startsWith("/uploads/") ||
              image.startsWith("data:image/") ||
              /^https?:\/\//.test(image)),
        )
        .slice(0, 5)
    : [];

  if (!title || !category || !location || !description) {
    throw new Error("상품명, 카테고리, 거래 지역, 설명을 모두 입력해 주세요.");
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("판매 가격을 올바르게 입력해 주세요.");
  }

  const createdAt = new Date();
  const collection = await getProductsCollection();
  const result = await collection.insertOne({
    title,
    category,
    location,
    price,
    description,
    likes: 0,
    icon,
    background,
    images,
    createdAt,
  });

  return toProduct({
    _id: result.insertedId,
    title,
    category,
    location,
    price,
    description,
    likes: 0,
    icon,
    background,
    images,
    createdAt,
  });
}