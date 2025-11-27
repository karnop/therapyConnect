"use server";

import { createAdminClient } from "@/lib/appwrite";
import { Query } from "node-appwrite";

const DB_ID = "therapy_connect_db";
const USERS_COLLECTION = "users";
const RATES_COLLECTION = "service_rates";
const SLOTS_COLLECTION = "slots";
const BUCKET_ID = "69272be5003c066e0366";

export async function getPublicProfile(id) {
  const { databases } = await createAdminClient();

  try {
    // 1. Fetch Profile
    const profile = await databases.getDocument(DB_ID, USERS_COLLECTION, id);

    // 2. Fetch Price (60 min)
    const rateDocs = await databases.listDocuments(DB_ID, RATES_COLLECTION, [
      Query.equal("therapist_id", id),
      Query.equal("duration_mins", 60),
      Query.limit(1),
    ]);
    const price = rateDocs.documents[0]?.price_inr || 0;

    // 3. Construct Image URL
    let avatarUrl = null;
    if (profile.avatar_id) {
      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
      avatarUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${profile.avatar_id}/view?project=${projectId}`;
    }

    return {
      ...profile,
      price,
      avatarUrl,
    };
  } catch (error) {
    return null;
  }
}

export async function getAvailableSlots(therapistId) {
  const { databases } = await createAdminClient();
  const now = new Date().toISOString();

  // Fetch future available slots
  // Limit to 100 for MVP speed (approx 2-3 weeks of data)
  const slots = await databases.listDocuments(DB_ID, SLOTS_COLLECTION, [
    Query.equal("therapist_id", therapistId),
    Query.equal("is_booked", false),
    Query.greaterThan("start_time", now),
    Query.orderAsc("start_time"),
    Query.limit(100),
  ]);

  return slots.documents;
}
