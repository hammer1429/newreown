import "server-only";

import { ObjectId, type Collection, type WithId } from "mongodb";
import { connection } from "next/server";
import { connectToDatabase } from "./dbconnect";
import {
  formatRelativeTime,
  type Product,
  type ProductStatus,
} from "./products";

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
  sellerId?: string;
  sellerName?: string;
  status?: ProductStatus;
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
    status: doc.status === "sold" ? "sold" : "selling",
    description: doc.description || "",
    images: Array.isArray(doc.images)
      ? doc.images.filter((image): image is string => typeof image === "string" && image.length > 0)
      : [],
    sellerId: doc.sellerId,
    sellerName: doc.sellerName,
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
  sellerId: string;
  sellerName: string;
};

export type UpdateProductInput = {
  title: string;
  category: string;
  location: string;
  price: number;
  description: string;
  icon?: string;
  background?: string;
  images?: string[];
  status?: ProductStatus;
};

function normalizeImages(images: unknown): string[] {
  return Array.isArray(images)
    ? images
        .filter(
          (image): image is string =>
            typeof image === "string" &&
            (image.startsWith("/uploads/") ||
              image.startsWith("data:image/") ||
              /^https?:\/\//.test(image)),
        )
        .slice(0, 5)
    : [];
}

function validateProductInput(input: {
  title: string;
  category: string;
  location: string;
  description: string;
  price: number;
}) {
  const title = input.title.trim();
  const category = input.category.trim();
  const location = input.location.trim();
  const description = input.description.trim();
  const price = Number(input.price);

  if (!title || !category || !location || !description) {
    throw new Error("상품명, 카테고리, 거래 지역, 설명을 모두 입력해 주세요.");
  }
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("판매 가격을 올바르게 입력해 주세요.");
  }

  return { title, category, location, description, price };
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const { title, category, location, description, price } =
    validateProductInput(input);
  const icon = (input.icon || "📦").trim() || "📦";
  const background =
    (input.background || "linear-gradient(135deg, #eef3ea, #d9e4d3)").trim() ||
    "linear-gradient(135deg, #eef3ea, #d9e4d3)";
  const images = normalizeImages(input.images);

  const createdAt = new Date();
  const collection = await getProductsCollection();
  const result = await collection.insertOne({
    title,
    category,
    location,
    price,
    description,
    likes: 0,
    sellerId: input.sellerId,
    sellerName: input.sellerName,
    icon,
    background,
    images,
    status: "selling",
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
    sellerId: input.sellerId,
    sellerName: input.sellerName,
    icon,
    background,
    images,
    status: "selling",
    createdAt,
  });
}

export async function updateProduct(
  id: string,
  input: UpdateProductInput,
  sellerId: string,
): Promise<Product | null> {
  await connection();
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const collection = await getProductsCollection();
  const existing = await collection.findOne({
    _id: new ObjectId(id),
    sellerId,
  });
  if (!existing) {
    return null;
  }

  const { title, category, location, description, price } =
    validateProductInput(input);
  const icon = (input.icon || existing.icon || "📦").trim() || "📦";
  const background =
    (input.background || existing.background || "linear-gradient(135deg, #eef3ea, #d9e4d3)").trim() ||
    "linear-gradient(135deg, #eef3ea, #d9e4d3)";
  const images = normalizeImages(input.images);
  const nextStatus: ProductStatus =
    input.status === "sold"
      ? "sold"
      : input.status === "selling"
        ? "selling"
        : existing.status === "sold"
          ? "sold"
          : "selling";

  const updated: ProductDocument = {
    ...existing,
    title,
    category,
    location,
    price,
    description,
    icon,
    background,
    images,
    status: nextStatus,
  };

  const result = await collection.replaceOne(
    { _id: existing._id, sellerId },
    updated,
  );
  if (result.matchedCount === 0) {
    return null;
  }

  return toProduct({ ...updated, _id: existing._id });
}

export async function updateProductStatus(
  id: string,
  status: ProductStatus,
  sellerId: string,
): Promise<Product | null> {
  await connection();
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const collection = await getProductsCollection();
  const existing = await collection.findOne({ _id: new ObjectId(id) });
  if (!existing) {
    return null;
  }

  const nextStatus: ProductStatus = status === "sold" ? "sold" : "selling";
  const result = await collection.updateOne(
    { _id: existing._id, sellerId },
    { $set: { status: nextStatus } },
  );
  if (result.matchedCount === 0) {
    return null;
  }

  return toProduct({ ...existing, _id: existing._id, status: nextStatus });
}

export async function deleteProduct(
  id: string,
  sellerId: string,
): Promise<boolean> {
  await connection();
  if (!ObjectId.isValid(id)) {
    return false;
  }

  const collection = await getProductsCollection();
  const result = await collection.deleteOne({
    _id: new ObjectId(id),
    sellerId,
  });
  return result.deletedCount === 1;
}