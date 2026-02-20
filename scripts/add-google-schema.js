const { Client, Databases } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);
const DB_ID = "therapy_connect_db";
const USERS_COLLECTION = "users";

async function updateSchema() {
  console.log("⚙️  Adding Google Integration fields to Users collection...");
  try {
    // Tokens can be long, so we use 2048 max length
    await db.createStringAttribute(
      DB_ID,
      USERS_COLLECTION,
      "google_refresh_token",
      2048,
      false,
    );
    await db.createStringAttribute(
      DB_ID,
      USERS_COLLECTION,
      "google_access_token",
      2048,
      false,
    );
    await db.createStringAttribute(
      DB_ID,
      USERS_COLLECTION,
      "google_calendar_id",
      255,
      false,
    );

    console.log(
      "✅ Schema updated successfully! (It may take Appwrite a minute to build the indexes).",
    );
  } catch (error) {
    if (error.code === 409) {
      console.log("ℹ️  Attributes already exist. You are good to go!");
    } else {
      console.error("❌ Schema Error:", error.message);
    }
  }
}

updateSchema();
