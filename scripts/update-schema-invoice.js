const { Client, Databases } = require("node-appwrite");
require("dotenv").config({ path: ".env.local" });

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const db = new Databases(client);
const DB_ID = "therapy_connect_db";

async function createInvoiceCollection() {
  try {
    console.log("⚙️  Creating 'invoice_settings' collection...");

    // 1. Create Collection
    try {
      await db.createCollection(
        DB_ID,
        "invoice_settings",
        "Invoice Configurations"
      );
      console.log("✅ Collection 'invoice_settings' created.");
    } catch (e) {
      console.log("ℹ️  Collection likely exists.");
    }

    await new Promise((r) => setTimeout(r, 1000)); // Wait for propagation

    // 2. Add Attributes
    // Link to therapist
    await db.createStringAttribute(
      DB_ID,
      "invoice_settings",
      "therapist_id",
      36,
      true
    );

    // Compliance Fields
    await db.createStringAttribute(
      DB_ID,
      "invoice_settings",
      "rci_number",
      100,
      false
    );
    await db.createStringAttribute(
      DB_ID,
      "invoice_settings",
      "qualification",
      255,
      false
    ); // e.g. M.Phil

    // Payment Fields
    await db.createStringAttribute(
      DB_ID,
      "invoice_settings",
      "upi_id",
      100,
      false
    ); // for QR code
    await db.createStringAttribute(
      DB_ID,
      "invoice_settings",
      "business_address",
      500,
      false
    ); // Custom header address

    console.log("✅ Attributes added successfully!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

createInvoiceCollection();
