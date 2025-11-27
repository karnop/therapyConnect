"use server";

import { createAdminClient } from "@/lib/appwrite";
import { Query } from "node-appwrite";

const DB_ID = "therapy_connect_db";
const USERS_COLLECTION = "users";
const RATES_COLLECTION = "service_rates";
const SLOTS_COLLECTION = "slots";
const BUCKET_ID = "69272be5003c066e0366"; // Your Images Bucket

export async function getTherapists(filters = {}) {
  const { databases } = await createAdminClient();
  const { query, specialty, minPrice, maxPrice } = filters;

  // 1. Fetch ALL Therapists (Role = therapist)
  // For MVP scale (<100 users), fetching all and filtering in memory is perfectly fine and faster to implement.
  const { documents: therapists } = await databases.listDocuments(
    DB_ID,
    USERS_COLLECTION,
    [Query.equal("role", "therapist"), Query.limit(100)]
  );

  // 2. Enrich & Filter (Parallel Processing)
  const results = await Promise.all(
    therapists.map(async (therapist) => {
      // --- FILTER: Text Search ---
      if (query) {
        const q = query.toLowerCase();
        const name = therapist.full_name?.toLowerCase() || "";
        const bio = therapist.bio?.toLowerCase() || "";
        // If neither name nor bio matches, skip this therapist
        if (!name.includes(q) && !bio.includes(q)) return null;
      }

      // --- FILTER: Specialty ---
      if (specialty && specialty !== "All") {
        const specs = therapist.specialties || [];
        if (!specs.includes(specialty)) return null;
      }

      // --- FETCH: Price ---
      const rateDocs = await databases.listDocuments(DB_ID, RATES_COLLECTION, [
        Query.equal("therapist_id", therapist.$id),
        Query.equal("duration_mins", 60),
        Query.limit(1),
      ]);
      const price = rateDocs.documents[0]?.price_inr || 0;

      // --- FILTER: Price ---
      if (minPrice && price < parseInt(minPrice)) return null;
      if (maxPrice && price > parseInt(maxPrice)) return null;

      // --- FETCH: Next Available Slot ---
      const now = new Date().toISOString();
      const slotDocs = await databases.listDocuments(DB_ID, SLOTS_COLLECTION, [
        Query.equal("therapist_id", therapist.$id),
        Query.equal("is_booked", false),
        Query.greaterThan("start_time", now),
        Query.orderAsc("start_time"),
        Query.limit(1),
      ]);
      const nextSlot = slotDocs.documents[0] || null;

      // --- FETCH: Avatar URL ---
      let avatarUrl = null;
      if (therapist.avatar_id) {
        const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
        const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
        avatarUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${therapist.avatar_id}/view?project=${projectId}`;
      }

      return {
        ...therapist,
        price,
        nextSlot,
        avatarUrl,
      };
    })
  );

  // Remove nulls (filtered out therapists)
  return results.filter(Boolean);
}
