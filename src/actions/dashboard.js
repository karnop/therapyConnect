"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite";
import { Query } from "node-appwrite";
import { revalidatePath } from "next/cache";

const DB_ID = "therapy_connect_db";
const BOOKINGS_COLLECTION = "bookings";
const USERS_COLLECTION = "users";
const RATES_COLLECTION = "service_rates";
const BUCKET_ID = "69272be5003c066e0366";

// --- CLIENT: SAVE PREP ---
export async function updateBookingPrep(formData) {
  const { databases } = await createAdminClient();

  const bookingId = formData.get("bookingId");

  // Fix: Handle Mood Parsing safely
  const moodRaw = formData.get("mood");
  const mood = moodRaw ? parseInt(moodRaw) : 5;

  // Fix: Handle Checkbox Boolean Logic
  const isSharedRaw = formData.get("isShared");
  const isShared = isSharedRaw === "on";

  try {
    await databases.updateDocument(DB_ID, BOOKINGS_COLLECTION, bookingId, {
      client_mood: mood,
      client_intake: formData.get("intake") || "",
      client_journal: formData.get("journal") || "",
      is_shared: isShared,
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Prep Update Error:", error);
    return { error: "Failed to save details. " + error.message };
  }
}

// --- CLIENT: FETCH BOOKINGS ---
export async function getClientBookings() {
  const session = await createSessionClient();
  const user = await session.account.get();
  const { databases } = await createAdminClient();

  const bookings = await databases.listDocuments(DB_ID, BOOKINGS_COLLECTION, [
    Query.equal("client_id", user.$id),
    Query.orderDesc("start_time"),
    Query.limit(50),
  ]);

  // Enrich with Therapist Details
  const enrichedBookings = await Promise.all(
    bookings.documents.map(async (booking) => {
      try {
        const therapist = await databases.getDocument(
          DB_ID,
          USERS_COLLECTION,
          booking.therapist_id
        );

        let avatarUrl = null;
        if (therapist.avatar_id) {
          const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
          const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
          avatarUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${therapist.avatar_id}/view?project=${projectId}`;
        }

        return {
          ...booking,
          therapist: {
            full_name: therapist.full_name,
            meeting_link: therapist.meeting_link,
            clinic_address: therapist.clinic_address,
            metro_station: therapist.metro_station,
            avatarUrl: avatarUrl,
          },
        };
      } catch (e) {
        return booking;
      }
    })
  );

  return enrichedBookings;
}

// --- THERAPIST: DASHBOARD DATA ---
export async function getTherapistDashboardData() {
  const session = await createSessionClient();
  const user = await session.account.get();
  const { databases } = await createAdminClient();

  const now = new Date();
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  ).toISOString();
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).toISOString();

  // 1. Fetch Upcoming Bookings
  const upcoming = await databases.listDocuments(DB_ID, BOOKINGS_COLLECTION, [
    Query.equal("therapist_id", user.$id),
    Query.greaterThanEqual("start_time", now.toISOString()),
    Query.orderAsc("start_time"),
    Query.limit(20),
  ]);

  // 2. Calculate Earnings
  const monthBookings = await databases.listDocuments(
    DB_ID,
    BOOKINGS_COLLECTION,
    [
      Query.equal("therapist_id", user.$id),
      Query.greaterThanEqual("start_time", startOfMonth),
      Query.lessThanEqual("start_time", endOfMonth),
      Query.equal("status", "confirmed"),
    ]
  );

  const rateDocs = await databases.listDocuments(DB_ID, RATES_COLLECTION, [
    Query.equal("therapist_id", user.$id),
    Query.equal("duration_mins", 60),
    Query.limit(1),
  ]);
  const price = rateDocs.documents[0]?.price_inr || 0;

  const totalEarnings = monthBookings.total * price;
  const sessionCount = monthBookings.total;

  // 3. Enrich Upcoming with Client Data
  const enrichedUpcoming = await Promise.all(
    upcoming.documents.map(async (booking) => {
      try {
        const client = await databases.getDocument(
          DB_ID,
          USERS_COLLECTION,
          booking.client_id
        );
        return {
          ...booking,
          client: {
            full_name: client.full_name,
            phone: client.phone_number,
            email: client.email,
          },
        };
      } catch (e) {
        return booking;
      }
    })
  );

  return {
    upcoming: enrichedUpcoming,
    stats: {
      earnings: totalEarnings,
      sessions: sessionCount,
      price_per_session: price,
    },
  };
}

// --- NEW: FETCH SESSION DETAILS & HISTORY ---
export async function getSessionDetails(bookingId) {
  const { databases } = await createAdminClient();
  const session = await createSessionClient();
  const currentUser = await session.account.get(); // The Therapist

  try {
    // 1. Fetch Current Booking
    const booking = await databases.getDocument(
      DB_ID,
      BOOKINGS_COLLECTION,
      bookingId
    );

    // 2. Fetch Client Profile
    const client = await databases.getDocument(
      DB_ID,
      USERS_COLLECTION,
      booking.client_id
    );

    // 3. Fetch History (All bookings between this therapist and client)
    const history = await databases.listDocuments(DB_ID, BOOKINGS_COLLECTION, [
      Query.equal("therapist_id", currentUser.$id),
      Query.equal("client_id", booking.client_id),
      Query.orderDesc("start_time"),
      Query.limit(20),
    ]);

    return {
      booking,
      client,
      history: history.documents,
    };
  } catch (error) {
    return null;
  }
}
