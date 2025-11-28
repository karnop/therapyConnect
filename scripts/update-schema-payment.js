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

async function updateSchema() {
  try {
    console.log("⚙️  Updating Schema for Payment Flow...");

    // 1. Add 'payment_instructions' to Users (Therapist)
    try {
      await db.createStringAttribute(
        DB_ID,
        USERS_COLLECTION,
        "payment_instructions",
        1000,
        false
      );
      console.log("✅ Added 'payment_instructions' to Users.");
    } catch (e) {
      console.log("ℹ️  'payment_instructions' already exists.");
    }

    // 2. Add 'transaction_id' to Bookings
    try {
      await db.createStringAttribute(
        DB_ID,
        BOOKINGS_COLLECTION,
        "transaction_id",
        255,
        false
      );
      console.log("✅ Added 'transaction_id' to Bookings.");
    } catch (e) {
      console.log("ℹ️  'transaction_id' already exists.");
    }

    console.log("\n🎉 Schema updated successfully!");
  } catch (error) {
    console.error("❌ Schema Update Error:", error);
  }
}

updateSchema();
