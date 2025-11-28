"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";

const DB_ID = "therapy_connect_db";
const USERS_COLLECTION = "users";
const RATES_COLLECTION = "service_rates";
const BUCKET_ID = "69272be5003c066e0366";

export async function updateTherapistProfile(formData) {
  const { databases, account, storage } = await createSessionClient();
  const user = await account.get();

  // Admin client for writes
  const admin = await createAdminClient();
  const dbAdmin = admin.databases;
  const storageAdmin = admin.storage;

  const fullName = formData.get("fullName");
  const bio = formData.get("bio");
  const clinicAddress = formData.get("clinicAddress");
  const metroStation = formData.get("metroStation");
  const meetingLink = formData.get("meetingLink");
  const paymentInstructions = formData.get("paymentInstructions"); // NEW

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
    if (avatarFile && avatarFile.size > 0 && avatarFile.name !== "undefined") {
      const file = await storageAdmin.createFile(
        BUCKET_ID,
        ID.unique(),
        avatarFile
      );
      newAvatarId = file.$id;
    }

    const updateData = {
      full_name: fullName,
      bio: bio,
      specialties: specialties,
      clinic_address: clinicAddress,
      metro_station: metroStation,
      meeting_link: meetingLink,
      payment_instructions: paymentInstructions, // NEW
    };

    if (newAvatarId) {
      updateData.avatar_id = newAvatarId;
    }

    await dbAdmin.updateDocument(DB_ID, USERS_COLLECTION, user.$id, updateData);

    if (fullName && fullName !== user.name) {
      await account.updateName(fullName);
    }

    const price60 = formData.get("price60");
    if (price60) {
      const rates = await dbAdmin.listDocuments(DB_ID, RATES_COLLECTION, [
        Query.equal("therapist_id", user.$id),
        Query.equal("duration_mins", 60),
      ]);

      if (rates.documents.length > 0) {
        await dbAdmin.updateDocument(
          DB_ID,
          RATES_COLLECTION,
          rates.documents[0].$id,
          { price_inr: parseInt(price60) }
        );
      } else {
        await dbAdmin.createDocument(DB_ID, RATES_COLLECTION, ID.unique(), {
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
  const session = await createSessionClient();
  const account = session.account;
  const admin = await createAdminClient();
  const databases = admin.databases;
  const storage = admin.storage;

  try {
    const user = await account.get();

    const profile = await databases.getDocument(
      DB_ID,
      USERS_COLLECTION,
      user.$id
    );

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
