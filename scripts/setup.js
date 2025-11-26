const { Client, Databases } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" }); // Load env vars

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);

const DB_ID = "therapy_connect_db";

const COLLECTIONS = [
  {
    name: "users",
    id: "users",
    attributes: [
      { key: "user_id", type: "string", size: 36, required: true },
      { key: "role", type: "string", size: 20, required: true }, // client, therapist, admin
      { key: "full_name", type: "string", size: 128, required: true },
      { key: "phone_number", type: "string", size: 15, required: true },
      { key: "is_verified", type: "boolean", required: false, default: false },
      { key: "avatar_id", type: "string", size: 36, required: false },
      // Therapist Specific
      { key: "bio", type: "string", size: 1000, required: false },
      { key: "video_id", type: "string", size: 36, required: false },
      { key: "license_doc_id", type: "string", size: 36, required: false },
      {
        key: "specialties",
        type: "string",
        size: 255,
        required: false,
        array: true,
      },
      { key: "metro_station", type: "string", size: 64, required: false },
      { key: "clinic_address", type: "string", size: 255, required: false },
      { key: "geo_lat", type: "double", required: false },
      { key: "geo_long", type: "double", required: false },
    ],
  },
  {
    name: "service_rates",
    id: "service_rates",
    attributes: [
      { key: "therapist_id", type: "string", size: 36, required: true },
      { key: "duration_mins", type: "integer", required: true }, // 30, 60, 120
      { key: "price_inr", type: "integer", required: true },
      { key: "is_active", type: "boolean", required: true, default: true },
    ],
  },
  {
    name: "availability_rules",
    id: "availability_rules",
    attributes: [
      { key: "therapist_id", type: "string", size: 36, required: true },
      { key: "day_of_week", type: "integer", required: true }, // 0-6
      { key: "start_time", type: "string", size: 5, required: true }, // "09:00"
      { key: "end_time", type: "string", size: 5, required: true }, // "17:00"
      { key: "mode", type: "string", size: 10, required: true }, // online, offline
    ],
  },
  {
    name: "bookings",
    id: "bookings",
    attributes: [
      { key: "client_id", type: "string", size: 36, required: true },
      { key: "therapist_id", type: "string", size: 36, required: true },
      { key: "service_rate_id", type: "string", size: 36, required: true },
      { key: "start_time", type: "datetime", required: true },
      { key: "end_time", type: "datetime", required: true },
      { key: "status", type: "string", size: 20, required: true }, // pending, confirmed...
      { key: "mode", type: "string", size: 10, required: true },
      { key: "otp_code", type: "string", size: 4, required: true },
      { key: "otp_verified", type: "boolean", required: false, default: false },
      { key: "meeting_link", type: "url", required: false },
      { key: "payment_id", type: "string", size: 128, required: false },
      { key: "package_used_id", type: "string", size: 36, required: false },
    ],
  },
  {
    name: "client_packages",
    id: "client_packages",
    attributes: [
      { key: "client_id", type: "string", size: 36, required: true },
      { key: "therapist_id", type: "string", size: 36, required: true },
      { key: "balance_remaining", type: "integer", required: true },
      { key: "expiry_date", type: "datetime", required: false },
      { key: "is_active", type: "boolean", required: true, default: true },
    ],
  },
  {
    name: "reviews",
    id: "reviews",
    attributes: [
      { key: "booking_id", type: "string", size: 36, required: true },
      { key: "therapist_id", type: "string", size: 36, required: true },
      { key: "client_id", type: "string", size: 36, required: true },
      { key: "rating", type: "integer", required: true },
      { key: "comment", type: "string", size: 500, required: false },
      { key: "is_anonymous", type: "boolean", required: true, default: false },
    ],
  },
];

async function setupDatabase() {
  try {
    // 1. Create Database
    try {
      await db.create(DB_ID, "TherapyConnect DB");
      console.log(`✅ Database "${DB_ID}" created.`);
    } catch (error) {
      console.log(`⚠️  Database "${DB_ID}" already exists.`);
    }

    // 2. Create Collections & Attributes
    for (const col of COLLECTIONS) {
      try {
        await db.createCollection(DB_ID, col.id, col.name);
        console.log(`✅ Collection "${col.name}" created.`);
      } catch (error) {
        console.log(`⚠️  Collection "${col.name}" already exists.`);
      }

      // Create Attributes
      for (const attr of col.attributes) {
        try {
          if (attr.type === "string") {
            await db.createStringAttribute(
              DB_ID,
              col.id,
              attr.key,
              attr.size,
              attr.required,
              attr.default,
              attr.array
            );
          } else if (attr.type === "integer") {
            await db.createIntegerAttribute(
              DB_ID,
              col.id,
              attr.key,
              attr.required,
              0,
              10000000,
              attr.default
            );
          } else if (attr.type === "boolean") {
            await db.createBooleanAttribute(
              DB_ID,
              col.id,
              attr.key,
              attr.required,
              attr.default
            );
          } else if (attr.type === "datetime") {
            await db.createDatetimeAttribute(
              DB_ID,
              col.id,
              attr.key,
              attr.required,
              attr.default
            );
          } else if (attr.type === "email") {
            await db.createEmailAttribute(
              DB_ID,
              col.id,
              attr.key,
              attr.required,
              attr.default
            );
          } else if (attr.type === "url") {
            await db.createUrlAttribute(
              DB_ID,
              col.id,
              attr.key,
              attr.required,
              attr.default
            );
          } else if (attr.type === "double") {
            await db.createFloatAttribute(
              DB_ID,
              col.id,
              attr.key,
              attr.required,
              0,
              100000,
              attr.default
            );
          }
          console.log(`   🔹 Attribute "${attr.key}" created.`);
        } catch (error) {
          // Ignore error if attribute already exists
          // console.log(`   Attribute "${attr.key}" skipped (exists).`);
        }
        // Wait a bit to prevent rate limits
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    console.log("\n🎉 Database setup complete!");
  } catch (error) {
    console.error("❌ Setup failed:", error);
  }
}

setupDatabase();
