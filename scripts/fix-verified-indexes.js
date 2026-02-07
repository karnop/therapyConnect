const { Client, Databases } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);
const DB_ID = "therapy_connect_db";
const USERS_COLLECTION = "users";

async function createVerifiedIndex() {
  try {
    console.log("⚙️  Creating Index for Verified Status...");

    // Create key index on 'is_verified'
    // This is required for Query.equal("is_verified", true) to work
    await db.createIndex(DB_ID, USERS_COLLECTION, "key_verified", "key", [
      "is_verified",
    ]);

    console.log("✅ Index 'key_verified' created successfully!");
  } catch (error) {
    // Error 409 means index already exists, which is fine.
    if (error.code === 409) {
      console.log("ℹ️  Index already exists.");
    } else {
      console.error("❌ Index Error:", error.message);
    }
  }
}

createVerifiedIndex();
