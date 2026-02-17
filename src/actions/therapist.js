"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";

const DB_ID = "therapy_connect_db";
const USERS_COLLECTION = "users";
const RATES_COLLECTION = "service_rates";
const BUCKET_ID = "69272be5003c066e0366";

// Helper to clean inputs (converts "" to null to prevent validation errors)
const sanitize = (val) =>
  val && val.toString().trim() !== "" ? val.toString().trim() : null;

export async function updateTherapistProfile(formData) {
  const { account } = await createSessionClient();
  let user;

  try {
    user = await account.get();
  } catch (e) {
    return { error: "Session expired. Please login again." };
  }

  const { databases, storage, users } = await createAdminClient();

  // 1. EXTRACT & SANITIZE
  const fullName = sanitize(formData.get("fullName"));
  const bio = sanitize(formData.get("bio"));
  const clinicAddress = sanitize(formData.get("clinicAddress"));
  const metroStation = sanitize(formData.get("metroStation"));
  const meetingLink = sanitize(formData.get("meetingLink"));
  const paymentInstructions = sanitize(formData.get("paymentInstructions"));

  // Check Bio Length
  if (bio && bio.length > 8000) {
    return {
      error: `Bio is too long (${bio.length} chars). Max allowed is 8000.`,
    };
  }

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
    // 2. AVATAR UPLOAD
    if (avatarFile && avatarFile.size > 0 && avatarFile.name !== "undefined") {
      if (avatarFile.size > 5 * 1024 * 1024) {
        return { error: "Image too large. Please upload an image under 5MB." };
      }
      try {
        const file = await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          avatarFile,
        );
        newAvatarId = file.$id;
      } catch (uploadError) {
        console.error("Upload failed:", uploadError);
        return { error: "Failed to upload image. " + uploadError.message };
      }
    }

    // 3. PREPARE UPDATE OBJECT
    const updateData = {
      full_name: fullName,
      bio: bio,
      specialties: specialties,
      clinic_address: clinicAddress,
      metro_station: metroStation,
      meeting_link: meetingLink,
      payment_instructions: paymentInstructions,
    };

    if (newAvatarId) {
      updateData.avatar_id = newAvatarId;
    }

    // 4. DATABASE UPDATE (Self-Healing)
    try {
      await databases.updateDocument(
        DB_ID,
        USERS_COLLECTION,
        user.$id,
        updateData,
      );
    } catch (dbError) {
      if (dbError.code === 404) {
        console.log("⚠️ Therapist record missing. Creating new...");
        await databases.createDocument(DB_ID, USERS_COLLECTION, user.$id, {
          ...updateData,
          user_id: user.$id,
          role: "therapist",
          phone_number: user.phone || "0000000000",
          is_verified: false,
        });
      } else {
        throw dbError;
      }
    }

    // 5. UPDATE AUTH NAME
    if (fullName && fullName !== user.name) {
      try {
        await users.updateName(user.$id, fullName);
      } catch (e) {
        // Ignore auth name update errors
      }
    }

    // 6. UPDATE RATES (Loop for 30, 60, 90 mins)
    const durations = [30, 60, 90];

    for (const d of durations) {
      const price = formData.get(`price${d}`); // price30, price60, price90

      // We check if price is provided (not empty)
      if (price && price.trim() !== "") {
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
            is_active: true,
          });
        }
      }
    }

    revalidatePath("/therapist/settings");
    revalidatePath("/therapist/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Profile Update Error:", error);
    // Return clear error message
    return { error: error.message.replace("AppwriteException: ", "") };
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
        return {
          profile: { full_name: user.name },
          rates: [],
          avatarUrl: null,
        };
      throw e;
    }

    let avatarUrl = null;
    if (profile.avatar_id) {
      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
      avatarUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${profile.avatar_id}/view?project=${projectId}`;
    }

    const rates = await databases.listDocuments(DB_ID, RATES_COLLECTION, [
      Query.equal("therapist_id", user.$id),
    ]);

    if (!profile.full_name) profile.full_name = user.name;

    return { profile, rates: rates.documents, avatarUrl };
  } catch (error) {
    return null;
  }
}
