"use server";

import { createAdminClient } from "@/lib/appwrite";
import { Query } from "node-appwrite";

const DB_ID = "therapy_connect_db";
const USERS_COLLECTION = "users";
const RATES_COLLECTION = "service_rates";
const SLOTS_COLLECTION = "slots";
const BUCKET_ID = "69272be5003c066e0366";

export async function getTherapists(filters = {}) {
  const { databases } = await createAdminClient();
  const { query, specialty, minPrice, maxPrice, mode, sort } = filters; // Added 'sort' and 'mode'

  // 1. Fetch ALL Therapists
  const { documents: therapists } = await databases.listDocuments(
    DB_ID,
    USERS_COLLECTION,
    [Query.equal("role", "therapist"), Query.limit(100)]
  );

  // 2. Enrich & Filter
  const results = await Promise.all(
    therapists.map(async (therapist) => {
      // --- FILTER: Text Search (Name, Bio, OR Specialties) ---
      if (query) {
        const q = query.toLowerCase();
        const name = therapist.full_name?.toLowerCase() || "";
        const bio = therapist.bio?.toLowerCase() || "";
        const specs = (therapist.specialties || []).map((s) => s.toLowerCase());

        // If query matches NONE of these, skip
        if (
          !name.includes(q) &&
          !bio.includes(q) &&
          !specs.some((s) => s.includes(q))
        ) {
          return null;
        }
      }

      // --- FILTER: Specialty (Dropdown) ---
      if (specialty && specialty !== "All") {
        const specs = therapist.specialties || [];
        if (!specs.includes(specialty)) return null;
      }

      // --- FILTER: Mode (Online/Offline) ---
      if (mode && mode !== "all") {
        if (mode === "online" && !therapist.meeting_link) return null;
        if (mode === "offline" && !therapist.clinic_address) return null;
      }

      // --- FETCH: Price ---
      const rateDocs = await databases.listDocuments(DB_ID, RATES_COLLECTION, [
        Query.equal("therapist_id", therapist.$id),
        Query.equal("duration_mins", 60),
        Query.limit(1),
      ]);
      const price = rateDocs.documents[0]?.price_inr || 0;

      // --- FILTER: Price Range ---
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

  // 3. Filter Nulls
  let finalResults = results.filter(Boolean);

  // 4. SORTING LOGIC
  if (sort) {
    if (sort === "price_asc") {
      finalResults.sort((a, b) => a.price - b.price);
    } else if (sort === "price_desc") {
      finalResults.sort((a, b) => b.price - a.price);
    }
  }

  return finalResults;
}
