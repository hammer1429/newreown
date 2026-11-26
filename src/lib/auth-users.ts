import "server-only";

import { MongoServerError } from "mongodb";
import { connectToDatabase } from "./dbconnect";

type UserDocument = {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findAuthUserByEmail(
  email: string,
): Promise<AuthUser | null> {
  const { db } = await connectToDatabase();
  const user = await db
    .collection<UserDocument>("users")
    .findOne({ email: normalizeEmail(email) });

  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
  };
}

export async function createAuthUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<boolean> {
  const { db } = await connectToDatabase();
  const users = db.collection<UserDocument>("users");
  await users.createIndex({ email: 1 }, { unique: true, name: "email_unique" });

  try {
    await users.insertOne({
      name: input.name,
      email: normalizeEmail(input.email),
      passwordHash: input.passwordHash,
      createdAt: new Date(),
    });
    return true;
  } catch (error) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return false;
    }
    throw error;
  }
}
