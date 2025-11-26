"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";

const DB_ID = process.env.NEXT_PUBLIC_DB_ID;
const USERS_COLLECTION = process.env.NEXT_PUBLIC_USERS_COLLECTION_ID;
const RATES_COLLECTION = process.env.NEXT_PUBLIC_RATES_COLLECTION_ID;
const BUCKET_ID = process.env.NEXT_PUBLIC_STORAGE_BUCKET_ID;

export async function updateTherapistProfile(formData) {
  // 1. Get Session Client for Auth
  const session = await createSessionClient();
  const account = session.account;
  const user = await account.get();

  // 2. Get Admin Client for DB/Storage
  const admin = await createAdminClient();
  const databases = admin.databases;
  const storage = admin.storage;

  const fullName = formData.get("fullName");
  const bio = formData.get("bio");
  const clinicAddress = formData.get("clinicAddress");
  const metroStation = formData.get("metroStation");
  const meetingLink = formData.get("meetingLink");

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
    // Avatar Upload Logic
    if (avatarFile && avatarFile.size > 0 && avatarFile.name !== "undefined") {
      const file = await storage.createFile(BUCKET_ID, ID.unique(), avatarFile);
      newAvatarId = file.$id;
    }

    const updateData = {
      full_name: fullName,
      bio: bio,
      specialties: specialties,
      clinic_address: clinicAddress,
      metro_station: metroStation,
      meeting_link: meetingLink,
    };

    if (newAvatarId) {
      updateData.avatar_id = newAvatarId;
    }

    await databases.updateDocument(
      DB_ID,
      USERS_COLLECTION,
      user.$id,
      updateData
    );

    if (fullName && fullName !== user.name) {
      await account.updateName(fullName);
    }

    // Update Rates
    const price60 = formData.get("price60");
    if (price60) {
      const rates = await databases.listDocuments(DB_ID, RATES_COLLECTION, [
        Query.equal("therapist_id", user.$id),
        Query.equal("duration_mins", 60),
      ]);

      if (rates.documents.length > 0) {
        await databases.updateDocument(
          DB_ID,
          RATES_COLLECTION,
          rates.documents[0].$id,
          { price_inr: parseInt(price60) }
        );
      } else {
        await databases.createDocument(DB_ID, RATES_COLLECTION, ID.unique(), {
          therapist_id: user.$id,
          duration_mins: 60,
          price_inr: parseInt(price60),
          // is_active: true // REMOVED to prevent "Invalid document structure" error
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
  const session = await createSessionClient();
  const account = session.account;

  const admin = await createAdminClient();
  const databases = admin.databases;
  // const storage = admin.storage; // Not needed for URL construction

  try {
    const user = await account.get();

    const profile = await databases.getDocument(
      DB_ID,
      USERS_COLLECTION,
      user.$id
    );

    // Get Avatar URL
    let avatarUrl = null;
    if (profile.avatar_id) {
      // FIX: Manually construct the URL for the Node SDK
      // This avoids downloading the file buffer and gives us the public link directly.
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
