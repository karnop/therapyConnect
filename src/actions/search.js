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
  // Added sort by creation to ensure consistent list order
  const { documents: allTherapists } = await databases.listDocuments(
    DB_ID,
    USERS_COLLECTION,
    [
      Query.equal("role", "therapist"),
      Query.limit(100),
      Query.orderDesc("$createdAt"),
    ],
  );

  // 2. Verified Filter (Loose check)
  // Checks for boolean true, string "true", or existing verified field
  const verifiedTherapists = allTherapists.filter(
    (t) => t.is_verified === true || t.is_verified === "true",
  );

  if (verifiedTherapists.length === 0) return [];

  // 3. Enrich & Filter
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
      if (specialty && specialty !== "All" && specialty !== "") {
        const specs = therapist.specialties || [];
        if (!specs.includes(specialty)) return null;
      }

      // --- FILTER: Mode ---
      if (mode && mode !== "all") {
        if (mode === "online" && !therapist.meeting_link) return null;
        if (mode === "offline" && !therapist.clinic_address) return null;
      }

      // --- FETCH: Price ---
      let price = 2000;
      try {
        const rateDocs = await databases.listDocuments(
          DB_ID,
          RATES_COLLECTION,
          [
            Query.equal("therapist_id", therapist.$id),
            Query.equal("duration_mins", 60),
            Query.limit(1),
          ],
        );
        if (rateDocs.documents.length > 0) {
          price = rateDocs.documents[0].price_inr;
        }
      } catch (e) {
        // Ignore rate fetch error
      }

      // --- FILTER: Price Range ---
      if (minPrice && price < parseInt(minPrice)) return null;
      if (maxPrice && price > parseInt(maxPrice)) return null;

      // --- FETCH: Next Slot ---
      let nextSlot = null;
      try {
        const now = new Date().toISOString();
        const slotDocs = await databases.listDocuments(
          DB_ID,
          SLOTS_COLLECTION,
          [
            Query.equal("therapist_id", therapist.$id),
            Query.equal("is_booked", false),
            Query.greaterThan("start_time", now),
            Query.orderAsc("start_time"),
            Query.limit(1),
          ],
        );
        nextSlot = slotDocs.documents[0] || null;
      } catch (e) {
        // Ignore slot error
      }

      // --- FETCH: Avatar ---
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

  let finalResults = results.filter(Boolean);

  // 4. Sort
  finalResults.sort((a, b) => {
    if (sort === "price_asc") return a.price - b.price;
    if (sort === "price_desc") return b.price - a.price;

    const aHasSlot = !!a.nextSlot;
    const bHasSlot = !!b.nextSlot;

    if (aHasSlot && !bHasSlot) return -1;
    if (!aHasSlot && bHasSlot) return 1;

    if (aHasSlot && bHasSlot) {
      return new Date(a.nextSlot.start_time) - new Date(b.nextSlot.start_time);
    }
    return new Date(b.$createdAt) - new Date(a.$createdAt);
  });

  return finalResults;
}
