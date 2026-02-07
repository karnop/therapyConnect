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
  const { query, specialty, minPrice, maxPrice, mode, sort } = filters;

  // 1. Fetch ALL Therapists
  // Note: We attempt to filter by is_verified in DB, but we will double-check in JS
  // to handle the String vs Boolean mismatch edge case.
  const { documents: allTherapists } = await databases.listDocuments(
    DB_ID,
    USERS_COLLECTION,
    [
      Query.equal("role", "therapist"),
      Query.limit(100), // Fetch plenty to allow for filtering
    ],
  );

  // --- CRITICAL FIX: The "Belt and Suspenders" Filter ---
  // Filter out unverified users in Memory to guarantee safety.
  // This handles both Boolean (true) and String ("true") types.
  const verifiedTherapists = allTherapists.filter(
    (t) => t.is_verified === true || t.is_verified === "true",
  );

  // 2. Enrich & Filter (Parallel Processing)
  const results = await Promise.all(
    verifiedTherapists.map(async (therapist) => {
      // --- FILTER: Text Search ---
      if (query) {
        const q = query.toLowerCase();
        const name = therapist.full_name?.toLowerCase() || "";
        const bio = therapist.bio?.toLowerCase() || "";
        const specs = (therapist.specialties || []).map((s) => s.toLowerCase());

        if (
          !name.includes(q) &&
          !bio.includes(q) &&
          !specs.some((s) => s.includes(q))
        ) {
          return null;
        }
      }

      // --- FILTER: Specialty ---
      if (specialty && specialty !== "All") {
        const specs = therapist.specialties || [];
        if (!specs.includes(specialty)) return null;
      }

      // --- FILTER: Mode ---
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
    }),
  );

  // 3. Filter Nulls
  let finalResults = results.filter(Boolean);

  // 4. RANKING ALGORITHM
  finalResults.sort((a, b) => {
    // A. Explicit User Sort
    if (sort === "price_asc") return a.price - b.price;
    if (sort === "price_desc") return b.price - a.price;

    // B. Algorithm: Availability First
    const aHasSlot = !!a.nextSlot;
    const bHasSlot = !!b.nextSlot;

    // Tier 1: Has Slots vs No Slots
    if (aHasSlot && !bHasSlot) return -1;
    if (!aHasSlot && bHasSlot) return 1;

    // Tier 2: Inside "Has Slots", sort by SOONEST date
    if (aHasSlot && bHasSlot) {
      return new Date(a.nextSlot.start_time) - new Date(b.nextSlot.start_time);
    }

    // Tier 3: Inside "No Slots", sort by NEWEST profile
    return new Date(b.$createdAt) - new Date(a.$createdAt);
  });

  return finalResults;
}
