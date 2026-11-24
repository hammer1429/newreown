import "server-only";

import { ObjectId, type Collection, type WithId } from "mongodb";
import { connection } from "next/server";
import { connectToDatabase } from "./dbconnect";

export type NoticeDocument = {
  category: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: Date;
};

export type Notice = {
  id: string;
  category: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  date: string;
};

async function getNoticesCollection(): Promise<Collection<NoticeDocument>> {
  const { db } = await connectToDatabase();
  return db.collection<NoticeDocument>("notices");
}

function formatNoticeDate(createdAt: Date): string {
  const year = createdAt.getFullYear();
  const month = String(createdAt.getMonth() + 1).padStart(2, "0");
  const day = String(createdAt.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function toNotice(doc: WithId<NoticeDocument>): Notice {
  const createdAt =
    doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt);

  return {
    id: doc._id.toString(),
    category: doc.category,
    title: doc.title,
    content: doc.content,
    pinned: Boolean(doc.pinned),
    createdAt: createdAt.toISOString(),
    date: formatNoticeDate(createdAt),
  };
}

export async function getNotices(): Promise<Notice[]> {
  await connection();
  const collection = await getNoticesCollection();
  const docs = await collection
    .find({})
    .sort({ pinned: -1, createdAt: -1, _id: -1 })
    .toArray();

  return docs.map(toNotice);
}

export async function getNoticeById(id: string): Promise<Notice | null> {
  await connection();
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const collection = await getNoticesCollection();
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return doc ? toNotice(doc) : null;
}

export type CreateNoticeInput = {
  category: string;
  title: string;
  content: string;
  pinned?: boolean;
};

export async function createNotice(input: CreateNoticeInput): Promise<Notice> {
  const category = input.category.trim();
  const title = input.title.trim();
  const content = input.content.trim();
  const pinned = Boolean(input.pinned);

  if (!category || !title || !content) {
    throw new Error("카테고리, 제목, 내용을 모두 입력해 주세요.");
  }

  const createdAt = new Date();
  const collection = await getNoticesCollection();
  const result = await collection.insertOne({
    category,
    title,
    content,
    pinned,
    createdAt,
  });

  return toNotice({
    _id: result.insertedId,
    category,
    title,
    content,
    pinned,
    createdAt,
  });
}

export async function deleteNotice(id: string): Promise<boolean> {
  await connection();
  if (!ObjectId.isValid(id)) {
    return false;
  }

  const collection = await getNoticesCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
