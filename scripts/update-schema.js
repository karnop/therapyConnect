const { Client, Databases } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);
const DB_ID = "therapy_connect_db";

async function createSlotsCollection() {
  try {
    console.log("⚙️ Creating 'slots' collection...");

    // 1. Create Collection
    await db.createCollection(DB_ID, "slots", "Available Slots");
    console.log('✅ Collection "slots" created.');

    // 2. Add Attributes
    // Link to the therapist who owns this slot
    await db.createStringAttribute(DB_ID, "slots", "therapist_id", 36, true);

    // Exact Start Time (e.g., 2023-12-04T16:00:00.000Z)
    await db.createDatetimeAttribute(DB_ID, "slots", "start_time", true);

    // Exact End Time (e.g., 2023-12-04T17:00:00.000Z)
    await db.createDatetimeAttribute(DB_ID, "slots", "end_time", true);

    // Status: Is it available or taken?
    await db.createBooleanAttribute(DB_ID, "slots", "is_booked", true, false);

    console.log('✅ Attributes added to "slots". Ready to go!');
  } catch (error) {
    console.log("⚠️ Note:", error.message);
  }
}

createSlotsCollection();
