import "server-only";

import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not set. Add it to your .env file.");
}

type MongoGlobal = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

const globalWithMongo = globalThis as MongoGlobal;

const clientPromise =
  process.env.NODE_ENV === "development"
    ? (globalWithMongo._mongoClientPromise ??=
        new MongoClient(uri).connect())
    : new MongoClient(uri).connect();

export async function connectToDatabase(): Promise<{
  client: MongoClient;
  db: Db;
}> {
  const client = await clientPromise;
  const databaseName = process.env.MONGODB_DB;
  const db = databaseName ? client.db(databaseName) : client.db();

  return { client, db };
}

export default clientPromise;
