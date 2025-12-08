"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";

const DB_ID = "therapy_connect_db";
const INVOICE_COLLECTION = "invoice_settings";

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
    // Check if exists
    const existing = await databases.listDocuments(DB_ID, INVOICE_COLLECTION, [
      Query.equal("therapist_id", user.$id),
    ]);

    if (existing.documents.length > 0) {
      // Update
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
      // Create
      await databases.createDocument(DB_ID, INVOICE_COLLECTION, ID.unique(), {
        therapist_id: user.$id,
        rci_number: rci,
        qualification: qualification,
        upi_id: upi,
        business_address: address,
      });
    }

    revalidatePath("/therapist/settings");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}
