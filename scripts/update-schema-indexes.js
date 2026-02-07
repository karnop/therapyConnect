const { Client, Databases } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);
const DB_ID = "therapy_connect_db";
const USERS_COLLECTION = "users";
const BOOKINGS_COLLECTION = "bookings";

async function createIndexes() {
  try {
    console.log("⚙️  Creating Indexes for Search & Sort...");

    // 1. Users Collection Indexes
    // For searching by name
    try {
      await db.createIndex(DB_ID, USERS_COLLECTION, "search_name", "fulltext", [
        "full_name",
      ]);
      console.log("✅ Created fulltext index on 'full_name' for Users.");
    } catch (e) {
      console.log("ℹ️  Index 'search_name' likely exists.");
    }

    // For filtering by role
    try {
      await db.createIndex(DB_ID, USERS_COLLECTION, "key_role", "key", [
        "role",
      ]);
      console.log("✅ Created key index on 'role' for Users.");
    } catch (e) {
      console.log("ℹ️  Index 'key_role' likely exists.");
    }

    // 2. Bookings Collection Indexes
    // For searching by Transaction ID
    try {
      await db.createIndex(
        DB_ID,
        BOOKINGS_COLLECTION,
        "search_transaction",
        "fulltext",
        ["transaction_id"],
      );
      console.log(
        "✅ Created fulltext index on 'transaction_id' for Bookings.",
      );
    } catch (e) {
      console.log("ℹ️  Index 'search_transaction' likely exists.");
    }

    // For filtering by Status
    try {
      await db.createIndex(DB_ID, BOOKINGS_COLLECTION, "key_status", "key", [
        "status",
      ]);
      console.log("✅ Created key index on 'status' for Bookings.");
    } catch (e) {
      console.log("ℹ️  Index 'key_status' likely exists.");
    }

    console.log("\n🎉 Indexes updated! You can now search and sort.");
  } catch (error) {
    console.error("❌ Index Error:", error);
  }
}

createIndexes();
