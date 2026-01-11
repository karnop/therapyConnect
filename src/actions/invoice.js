"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";

const DB_ID = "therapy_connect_db";
const INVOICE_COLLECTION = "invoice_settings";
const BOOKINGS_COLLECTION = "bookings";
const USERS_COLLECTION = "users";

export async function getInvoiceSettings() {
  const session = await createSessionClient();
  const user = await session.account.get();
  const { databases } = await createAdminClient();

  try {
    const docs = await databases.listDocuments(DB_ID, INVOICE_COLLECTION, [
      Query.equal("therapist_id", user.$id),
      Query.limit(1),
    ]);
    return docs.documents[0] || null;
  } catch (error) {
    return null;
  }
}

export async function updateInvoiceSettings(formData) {
  const session = await createSessionClient();
  const user = await session.account.get();
  const { databases } = await createAdminClient();

  const rci = formData.get("rci");
  const qualification = formData.get("qualification");
  const upi = formData.get("upi");
  const address = formData.get("address");

  try {
    const existing = await databases.listDocuments(DB_ID, INVOICE_COLLECTION, [
      Query.equal("therapist_id", user.$id),
    ]);

    if (existing.documents.length > 0) {
      await databases.updateDocument(
        DB_ID,
        INVOICE_COLLECTION,
        existing.documents[0].$id,
        {
          rci_number: rci,
          qualification: qualification,
          upi_id: upi,
          business_address: address,
        }
      );
    } else {
      await databases.createDocument(DB_ID, INVOICE_COLLECTION, ID.unique(), {
        therapist_id: user.$id,
        rci_number: rci,
        qualification: qualification,
        upi_id: upi,
        business_address: address,
      });
    }

    revalidatePath("/therapist/settings");
    revalidatePath("/therapist/invoices");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

// --- NEW: FETCH BILLABLE SESSIONS ---
export async function getBillableSessions() {
  const session = await createSessionClient();
  const user = await session.account.get();
  const { databases } = await createAdminClient();

  try {
    // Fetch confirmed bookings, sorted by date (newest first)
    const bookings = await databases.listDocuments(DB_ID, BOOKINGS_COLLECTION, [
      Query.equal("therapist_id", user.$id),
      Query.equal("status", "confirmed"),
      Query.orderDesc("start_time"),
      Query.limit(100), // Limit to 100 for now
    ]);

    // Enrich with client names
    const enriched = await Promise.all(
      bookings.documents.map(async (b) => {
        try {
          const client = await databases.getDocument(
            DB_ID,
            USERS_COLLECTION,
            b.client_id
          );
          return {
            ...b,
            clientName: client.full_name,
          };
        } catch (e) {
          return { ...b, clientName: "Unknown Client" };
        }
      })
    );

    return enriched;
  } catch (error) {
    console.error("Error fetching billable sessions:", error);
    return [];
  }
}
