"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";

const DB_ID = "therapy_connect_db";
const USERS_COLLECTION = "users";
const RATES_COLLECTION = "service_rates";
const BUCKET_ID = "69272be5003c066e0366";

export async function updateTherapistProfile(formData) {
  const { account } = await createSessionClient();
  const user = await account.get();

  const { databases, storage, users } = await createAdminClient();

  // Extract Form Data
  const fullName = formData.get("fullName");
  const bio = formData.get("bio");
  const clinicAddress = formData.get("clinicAddress");
  const metroStation = formData.get("metroStation");
  const meetingLink = formData.get("meetingLink");
  const paymentInstructions = formData.get("paymentInstructions");

  const specialtiesInput = formData.get("specialties");
  const specialties = specialtiesInput
    ? specialtiesInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];

  const avatarFile = formData.get("avatar");
  let newAvatarId = null;

  try {
    // 1. Upload Avatar if exists
    if (avatarFile && avatarFile.size > 0 && avatarFile.name !== "undefined") {
      const file = await storage.createFile(BUCKET_ID, ID.unique(), avatarFile);
      newAvatarId = file.$id;
    }

    // --- HELPER: Sanitize Input ---
    // Appwrite URL fields throw errors on empty strings ("").
    // We must convert empty strings to null for optional fields.
    const sanitize = (value) => {
      if (!value || value.trim() === "") return null;
      return value.trim();
    };

    // 2. Prepare Update Object
    const updateData = {
      full_name: fullName,
      bio: sanitize(bio),
      specialties: specialties,
      clinic_address: sanitize(clinicAddress),
      metro_station: sanitize(metroStation),
      meeting_link: sanitize(meetingLink), // FIX: Converts "" to null
      payment_instructions: sanitize(paymentInstructions),
    };

    if (newAvatarId) {
      updateData.avatar_id = newAvatarId;
    }

    // 3. Update User Profile
    // Query by user_id to find the correct document ID
    const userDocs = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
      Query.equal("user_id", user.$id),
    ]);

    if (userDocs.documents.length === 0) {
      throw new Error("Therapist profile not found in database.");
    }

    const documentId = userDocs.documents[0].$id;

    await databases.updateDocument(
      DB_ID,
      USERS_COLLECTION,
      documentId,
      updateData,
    );

    // 4. Update Auth Account Name
    if (fullName && fullName !== user.name) {
      await users.updateName(user.$id, fullName);
    }

    // 5. Update Rates (Schema: therapist_id, duration_mins, price_inr)
    const price60 = formData.get("price60");
    if (price60) {
      const rates = await databases.listDocuments(DB_ID, RATES_COLLECTION, [
        Query.equal("therapist_id", user.$id),
        Query.equal("duration_mins", 60),
      ]);

      if (rates.documents.length > 0) {
        // Update existing rate
        await databases.updateDocument(
          DB_ID,
          RATES_COLLECTION,
          rates.documents[0].$id,
          {
            price_inr: parseInt(price60),
          },
        );
      } else {
        // Create new rate (removed is_active field)
        await databases.createDocument(DB_ID, RATES_COLLECTION, ID.unique(), {
          therapist_id: user.$id,
          duration_mins: 60,
          price_inr: parseInt(price60),
        });
      }
    }

    revalidatePath("/therapist/settings");
    revalidatePath("/therapist/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Profile Update Error:", error);
    return { error: error.message };
  }
}

export async function getTherapistData() {
  const { account } = await createSessionClient();
  const { databases } = await createAdminClient();

  try {
    const user = await account.get();

    // Query by user_id
    const userDocs = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
      Query.equal("user_id", user.$id),
    ]);

    if (userDocs.documents.length === 0) {
      return null;
    }

    const profile = userDocs.documents[0];

    let avatarUrl = null;
    if (profile.avatar_id) {
      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
      avatarUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${profile.avatar_id}/view?project=${projectId}`;
    }

    const rates = await databases.listDocuments(DB_ID, RATES_COLLECTION, [
      Query.equal("therapist_id", user.$id),
    ]);

    if (!profile.full_name) {
      profile.full_name = user.name;
    }

    return { profile, rates: rates.documents, avatarUrl };
  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
}
