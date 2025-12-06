"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite";
import { Query } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";
import { format, parseISO } from "date-fns";

const DB_ID = "therapy_connect_db";
const BOOKINGS_COLLECTION = "bookings";
const USERS_COLLECTION = "users";
const RATES_COLLECTION = "service_rates";
const SLOTS_COLLECTION = "slots";
const CLIENT_RECORDS_COLLECTION = "client_records";
const BUCKET_ID = "69272be5003c066e0366";

export async function updateBookingPrep(formData) {
  const { databases } = await createAdminClient();

  const bookingId = formData.get("bookingId");
  const moodRaw = formData.get("mood");
  const mood = moodRaw ? parseInt(moodRaw) : 5;
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
    return { error: "Failed to save details." };
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
            payment_instructions: therapist.payment_instructions,
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

// --- THERAPIST: HANDLE REQUESTS ---
export async function handleBookingRequest(bookingId, action) {
  const { databases } = await createAdminClient();

  try {
    const booking = await databases.getDocument(
      DB_ID,
      BOOKINGS_COLLECTION,
      bookingId
    );
    const client = await databases.getDocument(
      DB_ID,
      USERS_COLLECTION,
      booking.client_id
    );
    const therapist = await databases.getDocument(
      DB_ID,
      USERS_COLLECTION,
      booking.therapist_id
    );

    // Prepare Email Data with Fallbacks
    const emailData = {
      clientName: client.full_name || "Client",
      therapistName: therapist.full_name,
      date: format(parseISO(booking.start_time), "EEEE, MMMM do"),
      time: format(parseISO(booking.start_time), "h:mm a"),
      // FIX: Ensure this is never empty
      paymentInstructions:
        therapist.payment_instructions ||
        "Please contact the therapist directly for payment details.",
    };

    if (action === "accept") {
      await databases.updateDocument(DB_ID, BOOKINGS_COLLECTION, bookingId, {
        status: "awaiting_payment",
      });

      await sendEmail(client.email, "REQUEST_ACCEPTED", emailData);
    } else if (action === "decline") {
      await databases.updateDocument(DB_ID, BOOKINGS_COLLECTION, bookingId, {
        status: "cancelled",
      });

      // Free the slot
      const slots = await databases.listDocuments(DB_ID, SLOTS_COLLECTION, [
        Query.equal("therapist_id", booking.therapist_id),
        Query.equal("start_time", booking.start_time),
      ]);

      if (slots.documents.length > 0) {
        await databases.updateDocument(
          DB_ID,
          SLOTS_COLLECTION,
          slots.documents[0].$id,
          {
            is_booked: false,
          }
        );
      }

      await sendEmail(client.email, "REQUEST_DECLINED", emailData);
    }

    revalidatePath("/therapist/dashboard");
    revalidatePath("/therapist/requests");
    return { success: true };
  } catch (error) {
    console.error("Handle Request Error:", error);
    return { error: error.message };
  }
}

// --- THERAPIST: CONFIRM PAYMENT ---
export async function confirmBookingPayment(bookingId, isValid) {
  const { databases } = await createAdminClient();

  try {
    const booking = await databases.getDocument(
      DB_ID,
      BOOKINGS_COLLECTION,
      bookingId
    );
    const client = await databases.getDocument(
      DB_ID,
      USERS_COLLECTION,
      booking.client_id
    );
    const therapist = await databases.getDocument(
      DB_ID,
      USERS_COLLECTION,
      booking.therapist_id
    );

    if (isValid) {
      await databases.updateDocument(DB_ID, BOOKINGS_COLLECTION, bookingId, {
        status: "confirmed",
      });

      const emailData = {
        clientName: client.full_name || "Client",
        therapistName: therapist.full_name,
        meetingLink: therapist.meeting_link,
        address: `${therapist.clinic_address} (${therapist.metro_station})`,
      };
      await sendEmail(client.email, "PAYMENT_CONFIRMED", emailData);
    } else {
      // Reject proof -> Send back to awaiting payment
      // Note: In V2 we should add a 'rejection_reason' field
      await databases.updateDocument(DB_ID, BOOKINGS_COLLECTION, bookingId, {
        status: "awaiting_payment",
        transaction_id: null,
      });

      // Optional: Send "Payment Rejected" email here
    }

    revalidatePath("/therapist/requests");
    revalidatePath("/therapist/dashboard");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

// --- THERAPIST: GET DASHBOARD DATA ---
export async function getTherapistDashboardData() {
  const session = await createSessionClient();
  const user = await session.account.get();
  const { databases } = await createAdminClient();

  const now = new Date().toISOString();

  // 1. Fetch Therapist Profile (NEW: Needed for meeting link)
  const therapistProfile = await databases.getDocument(
    DB_ID,
    USERS_COLLECTION,
    user.$id
  );

  // 2. Fetch Lists
  const requests = await databases.listDocuments(DB_ID, BOOKINGS_COLLECTION, [
    Query.equal("therapist_id", user.$id),
    Query.equal("status", "pending_approval"),
    Query.orderAsc("start_time"),
  ]);

  const verifications = await databases.listDocuments(
    DB_ID,
    BOOKINGS_COLLECTION,
    [
      Query.equal("therapist_id", user.$id),
      Query.equal("status", "payment_verification"),
      Query.orderAsc("start_time"),
    ]
  );

  const upcoming = await databases.listDocuments(DB_ID, BOOKINGS_COLLECTION, [
    Query.equal("therapist_id", user.$id),
    Query.greaterThanEqual("start_time", now),
    Query.equal("status", "confirmed"),
    Query.orderAsc("start_time"),
    Query.limit(20),
  ]);

  // Stats
  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).toISOString();
  const monthBookings = await databases.listDocuments(
    DB_ID,
    BOOKINGS_COLLECTION,
    [
      Query.equal("therapist_id", user.$id),
      Query.greaterThanEqual("start_time", startOfMonth),
      Query.equal("status", "confirmed"),
    ]
  );

  const rateDocs = await databases.listDocuments(DB_ID, RATES_COLLECTION, [
    Query.equal("therapist_id", user.$id),
    Query.limit(1),
  ]);
  const price = rateDocs.documents[0]?.price_inr || 0;

  const enrich = async (list) => {
    return await Promise.all(
      list.map(async (booking) => {
        try {
          const client = await databases.getDocument(
            DB_ID,
            USERS_COLLECTION,
            booking.client_id
          );
          return {
            ...booking,
            client: { full_name: client.full_name, phone: client.phone_number },
          };
        } catch (e) {
          return booking;
        }
      })
    );
  };

  return {
    therapistProfile, // NEW: Return profile with meeting_link
    requests: await enrich(requests.documents),
    verifications: await enrich(verifications.documents),
    upcoming: await enrich(upcoming.documents),
    stats: {
      earnings: monthBookings.total * price,
      sessions: monthBookings.total,
      price_per_session: price,
    },
  };
}

// --- FETCH SESSION DETAILS ---
export async function getSessionDetails(bookingId) {
  const { databases } = await createAdminClient();
  const session = await createSessionClient();
  const currentUser = await session.account.get();

  try {
    const booking = await databases.getDocument(
      DB_ID,
      BOOKINGS_COLLECTION,
      bookingId
    );
    const client = await databases.getDocument(
      DB_ID,
      USERS_COLLECTION,
      booking.client_id
    );

    // NEW: Fetch Therapist details to get meeting link
    const therapist = await databases.getDocument(
      DB_ID,
      USERS_COLLECTION,
      booking.therapist_id
    );

    const history = await databases.listDocuments(DB_ID, BOOKINGS_COLLECTION, [
      Query.equal("therapist_id", currentUser.$id),
      Query.equal("client_id", booking.client_id),
      Query.orderDesc("start_time"),
      Query.limit(20),
    ]);

    return {
      booking,
      client,
      therapist, // NEW: Include therapist profile
      history: history.documents,
    };
  } catch (error) {
    return null;
  }
}

export async function submitPaymentProof(formData) {
  const { databases } = await createAdminClient();
  const bookingId = formData.get("bookingId");
  const transactionId = formData.get("transactionId");

  try {
    await databases.updateDocument(DB_ID, BOOKINGS_COLLECTION, bookingId, {
      transaction_id: transactionId,
      status: "payment_verification",
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getClientHomework() {
  const session = await createSessionClient();
  const user = await session.account.get();
  const { databases } = await createAdminClient();

  try {
    // Fetch all clinical records linked to this client
    const records = await databases.listDocuments(
      DB_ID,
      CLIENT_RECORDS_COLLECTION,
      [Query.equal("client_id", user.$id)]
    );

    // Filter for those with homework and get therapist names
    const homeworkList = await Promise.all(
      records.documents.map(async (record) => {
        if (!record.homework_list) return null;

        try {
          const therapist = await databases.getDocument(
            DB_ID,
            USERS_COLLECTION,
            record.therapist_id
          );
          return {
            id: record.$id,
            therapistName: therapist.full_name,
            tasks: record.homework_list,
          };
        } catch (e) {
          return null;
        }
      })
    );

    return homeworkList.filter(Boolean);
  } catch (error) {
    console.error("Homework Fetch Error:", error);
    return [];
  }
}
