const { Client, Databases } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);
const DB_ID = "therapy_connect_db";
const BOOKINGS_COLLECTION = "bookings";

async function updateSchemaCRM() {
  try {
    console.log("⚙️  Starting CRM Schema Upgrade...");

    // --- 1. Create 'client_records' Collection (The Medical File) ---
    try {
      await db.createCollection(
        DB_ID,
        "client_records",
        "Client Clinical Records"
      );
      console.log("✅ Collection 'client_records' created.");

      // Wait for collection to establish
      await new Promise((r) => setTimeout(r, 1000));

      // Attributes
      await db.createStringAttribute(
        DB_ID,
        "client_records",
        "therapist_id",
        36,
        true
      );
      await db.createStringAttribute(
        DB_ID,
        "client_records",
        "client_id",
        36,
        true
      );

      // Risk: 'stable', 'moderate', 'high'
      await db.createStringAttribute(
        DB_ID,
        "client_records",
        "risk_status",
        20,
        false,
        "stable"
      );

      // Clinical Data (Text Areas)
      await db.createStringAttribute(
        DB_ID,
        "client_records",
        "presenting_problem",
        2000,
        false
      );
      await db.createStringAttribute(
        DB_ID,
        "client_records",
        "medications",
        2000,
        false
      );
      await db.createStringAttribute(
        DB_ID,
        "client_records",
        "emergency_contact",
        1000,
        false
      ); // JSON or Text
      await db.createStringAttribute(
        DB_ID,
        "client_records",
        "homework_list",
        5000,
        false
      );

      // Source: 'marketplace' vs 'offline'
      await db.createStringAttribute(
        DB_ID,
        "client_records",
        "source",
        20,
        false,
        "marketplace"
      );

      console.log("   🔹 Attributes added to 'client_records'.");
    } catch (e) {
      console.log("ℹ️  Collection 'client_records' likely exists:", e.message);
    }

    // --- 2. Create 'documents' Collection (Metadata for Files) ---
    try {
      await db.createCollection(DB_ID, "documents", "Client Documents");
      console.log("✅ Collection 'documents' created.");

      await new Promise((r) => setTimeout(r, 1000));

      await db.createStringAttribute(
        DB_ID,
        "documents",
        "therapist_id",
        36,
        true
      );
      await db.createStringAttribute(DB_ID, "documents", "client_id", 36, true);
      await db.createStringAttribute(DB_ID, "documents", "file_id", 36, true); // Link to Storage Bucket
      await db.createStringAttribute(DB_ID, "documents", "name", 255, true);
      await db.createStringAttribute(DB_ID, "documents", "type", 50, false); // 'prescription', 'report', etc.
      await db.createIntegerAttribute(DB_ID, "documents", "size", false);

      console.log("   🔹 Attributes added to 'documents'.");
    } catch (e) {
      console.log("ℹ️  Collection 'documents' likely exists:", e.message);
    }

    // --- 3. Update 'bookings' Collection (Clinical Notes) ---
    console.log("🔄 Updating 'bookings' collection...");

    try {
      // Private Note (Therapist Only - Encrypted logic handled in UI/Backend usually, but here just storage)
      await db.createStringAttribute(
        DB_ID,
        BOOKINGS_COLLECTION,
        "private_note",
        5000,
        false
      );
      console.log("   🔹 Added 'private_note'.");
    } catch (e) {
      /* Ignore if exists */
    }

    try {
      // Shared Summary (Visible to Client)
      await db.createStringAttribute(
        DB_ID,
        BOOKINGS_COLLECTION,
        "shared_summary",
        5000,
        false
      );
      console.log("   🔹 Added 'shared_summary'.");
    } catch (e) {
      /* Ignore if exists */
    }

    console.log("\n🎉 CRM Schema Upgrade Complete!");
  } catch (error) {
    console.error("❌ Schema Update Error:", error);
  }
}

updateSchemaCRM();
