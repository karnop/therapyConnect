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
    // 1. Avatar Upload
    if (avatarFile && avatarFile.size > 0 && avatarFile.name !== "undefined") {
      const file = await storage.createFile(BUCKET_ID, ID.unique(), avatarFile);
      newAvatarId = file.$id;
    }

    // 2. Profile Update
    const updateData = {
      full_name: fullName,
      bio: bio,
      specialties: specialties,
      clinic_address: clinicAddress,
      metro_station: metroStation,
      meeting_link: meetingLink ? meetingLink : null,
      payment_instructions: paymentInstructions,
    };

    if (newAvatarId) updateData.avatar_id = newAvatarId;

    try {
      await databases.updateDocument(
        DB_ID,
        USERS_COLLECTION,
        user.$id,
        updateData,
      );
    } catch (dbError) {
      if (dbError.code === 404) {
        // Self-healing create if missing
        await databases.createDocument(DB_ID, USERS_COLLECTION, user.$id, {
          ...updateData,
          user_id: user.$id,
          role: "therapist",
          phone_number: user.phone || "0000000000",
          is_verified: true,
        });
      } else {
        throw dbError;
      }
    }

    if (fullName && fullName !== user.name) {
      await users.updateName(user.$id, fullName);
    }

    // 3. Update Rates (Loop through 30, 60, 90)
    const durations = [30, 60, 90];

    for (const d of durations) {
      const price = formData.get(`price${d}`); // price30, price60, price90
      if (price) {
        const rates = await databases.listDocuments(DB_ID, RATES_COLLECTION, [
          Query.equal("therapist_id", user.$id),
          Query.equal("duration_mins", d),
        ]);

        if (rates.documents.length > 0) {
          await databases.updateDocument(
            DB_ID,
            RATES_COLLECTION,
            rates.documents[0].$id,
            {
              price_inr: parseInt(price),
            },
          );
        } else {
          await databases.createDocument(DB_ID, RATES_COLLECTION, ID.unique(), {
            therapist_id: user.$id,
            duration_mins: d,
            price_inr: parseInt(price),
          });
        }
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
  const { databases, storage } = await createAdminClient();

  try {
    const user = await account.get();
    let profile;
    try {
      profile = await databases.getDocument(DB_ID, USERS_COLLECTION, user.$id);
    } catch (e) {
      if (e.code === 404)
        profile = { full_name: user.name, bio: "", specialties: [] };
      else throw e;
    }

    let avatarUrl = null;
    if (profile.avatar_id) {
      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
      avatarUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${profile.avatar_id}/view?project=${projectId}`;
    }

    // Fetch ALL rates
    const rates = await databases.listDocuments(DB_ID, RATES_COLLECTION, [
      Query.equal("therapist_id", user.$id),
    ]);

    if (!profile.full_name) profile.full_name = user.name;

    return { profile, rates: rates.documents, avatarUrl };
  } catch (error) {
    return null;
  }
}
