"use server";

import { createAdminClient } from "@/lib/appwrite";
import { Query } from "node-appwrite";
import { revalidatePath } from "next/cache";

const DB_ID = "therapy_connect_db";
const USERS_COLLECTION = "users";
const BOOKINGS_COLLECTION = "bookings";
const BUCKET_ID = "69272be5003c066e0366";

// --- 1. GET SYSTEM STATS ---
export async function getAdminStats() {
  const { databases } = await createAdminClient();

  try {
    const [clients, therapists, bookings] = await Promise.all([
      databases.listDocuments(DB_ID, USERS_COLLECTION, [
        Query.equal("role", "client"),
        Query.limit(1),
      ]),
      databases.listDocuments(DB_ID, USERS_COLLECTION, [
        Query.equal("role", "therapist"),
        Query.limit(1),
      ]),
      databases.listDocuments(DB_ID, BOOKINGS_COLLECTION, [
        Query.equal("status", "confirmed"),
        Query.limit(1),
      ]),
    ]);

    const recentActivity = await databases.listDocuments(
      DB_ID,
      BOOKINGS_COLLECTION,
      [Query.orderDesc("$createdAt"), Query.limit(5)],
    );

    const enrichedActivity = await Promise.all(
      recentActivity.documents.map(async (b) => {
        try {
          const client = await databases.getDocument(
            DB_ID,
            USERS_COLLECTION,
            b.client_id,
          );
          const therapist = await databases.getDocument(
            DB_ID,
            USERS_COLLECTION,
            b.therapist_id,
          );
          return {
            ...b,
            clientName: client.full_name,
            therapistName: therapist.full_name,
          };
        } catch (e) {
          return b;
        }
      }),
    );

    return {
      totalClients: clients.total,
      totalTherapists: therapists.total,
      totalBookings: bookings.total,
      recentActivity: enrichedActivity,
    };
  } catch (error) {
    return null;
  }
}

// --- 2. THERAPIST MANAGEMENT ---
export async function getAllTherapists() {
  const { databases } = await createAdminClient();
  try {
    const list = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
      Query.equal("role", "therapist"),
      Query.orderDesc("$createdAt"),
      Query.limit(100),
    ]);
    return list.documents;
  } catch (e) {
    console.error("Fetch Therapists Error:", e);
    return [];
  }
}

export async function getTherapistDeepDive(userId) {
  const { databases } = await createAdminClient();

  try {
    // 1. Profile
    const profile = await databases.getDocument(
      DB_ID,
      USERS_COLLECTION,
      userId,
    );

    // 2. Booking Stats (Try/Catch in case bookings collection is empty/error)
    let totalBookings = 0;
    try {
      const bookings = await databases.listDocuments(
        DB_ID,
        BOOKINGS_COLLECTION,
        [Query.equal("therapist_id", userId), Query.limit(1)],
      );
      totalBookings = bookings.total;
    } catch (e) {
      console.error("Booking Stats Error:", e);
    }

    // 3. Avatar
    let avatarUrl = null;
    if (profile.avatar_id) {
      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
      avatarUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${profile.avatar_id}/view?project=${projectId}`;
    }

    return {
      ...profile,
      avatarUrl,
      totalBookings,
    };
  } catch (error) {
    console.error("Deep Dive Error:", error);
    return null;
  }
}

export async function toggleTherapistVerification(userId, currentStatus) {
  const { databases } = await createAdminClient();

  // Logic: Invert the status
  // Appwrite Booleans accept true/false.
  // If you used a String Enum, this might need to be String(newStatus).
  // Assuming standard boolean for now as per setup script.
  const newStatus = !currentStatus;

  try {
    await databases.updateDocument("therapy_connect_db", "users", userId, {
      is_verified: newStatus,
    });

    // Revalidate everywhere to update search results immediately
    revalidatePath("/admin/therapists");
    revalidatePath("/search");

    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getBookingAuditLog(page = 1, query = "", status = "all") {
  const { databases } = await createAdminClient();
  const limit = 15;
  const offset = (page - 1) * limit;

  const queries = [
    Query.limit(limit),
    Query.offset(offset),
    Query.orderDesc("$createdAt"),
  ];

  if (status !== "all") {
    queries.push(Query.equal("status", status));
  }

  // Note: Only add search if query exists, otherwise it slows down
  if (query) {
    queries.push(Query.search("transaction_id", query));
  }

  try {
    const response = await databases.listDocuments(
      DB_ID,
      BOOKINGS_COLLECTION,
      queries,
    );

    // Enrich with Names
    const enriched = await Promise.all(
      response.documents.map(async (b) => {
        try {
          // Fetch names (Might be slow for 15 items, but acceptable for Admin MVP)
          const client = await databases.getDocument(
            DB_ID,
            USERS_COLLECTION,
            b.client_id,
          );
          const therapist = await databases.getDocument(
            DB_ID,
            USERS_COLLECTION,
            b.therapist_id,
          );
          return {
            ...b,
            clientName: client.full_name,
            therapistName: therapist.full_name,
          };
        } catch (e) {
          return {
            ...b,
            clientName: "Unknown/Deleted",
            therapistName: "Unknown/Deleted",
          };
        }
      }),
    );

    return {
      data: enriched,
      total: response.total,
      pages: Math.ceil(response.total / limit),
    };
  } catch (e) {
    console.error("Booking Audit Error:", e);
    return { data: [], total: 0, pages: 0 };
  }
}

// --- 4. USER BASE (Paginated) ---
export async function getClientDirectory(page = 1, query = "") {
  const { databases } = await createAdminClient();
  const limit = 15;
  const offset = (page - 1) * limit;

  const queries = [
    Query.equal("role", "client"),
    Query.limit(limit),
    Query.offset(offset),
    Query.orderDesc("$createdAt"),
  ];

  if (query) {
    queries.push(Query.search("full_name", query));
  }

  try {
    const response = await databases.listDocuments(
      DB_ID,
      USERS_COLLECTION,
      queries,
    );
    return {
      data: response.documents,
      total: response.total,
      pages: Math.ceil(response.total / limit),
    };
  } catch (e) {
    console.error("User Directory Error:", e);
    return { data: [], total: 0, pages: 0 };
  }
}
