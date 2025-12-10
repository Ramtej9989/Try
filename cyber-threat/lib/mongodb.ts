import { MongoClient, Db, MongoClientOptions } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add MONGODB_URI to .env file");
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "soc_platform";
const options: MongoClientOptions = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let cachedDb: Db | null = null;

// In development mode, use a global variable to preserve the connection
// across hot-reloads
if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof global & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }

  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

/**
 * Returns the MongoDB client promise
 * This is used by NextAuth to store sessions
 */
export default clientPromise;

/**
 * Get MongoDB database instance
 */
export async function getMongoDB(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await clientPromise;
  const db = client.db(dbName);
  cachedDb = db;
  return db;
}

/**
 * Wrapper to handle MongoDB operations with error handling
 */
export async function withDb<T>(
  operation: (db: Db) => Promise<T>,
  errorMessage: string = "Database operation failed"
): Promise<T> {
  try {
    const db = await getMongoDB();
    return await operation(db);
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    throw new Error(errorMessage);
  }
}

/**
 * Helper to check if MongoDB connection is healthy
 */
export async function checkDbConnection(): Promise<boolean> {
  try {
    const client = await clientPromise;
    const adminDb = client.db().admin();
    await adminDb.ping();
    return true;
  } catch (error) {
    console.error("MongoDB connection check failed:", error);
    return false;
  }
}
