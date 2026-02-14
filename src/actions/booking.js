"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";
import { redirect } from "next/navigation";
import { sendEmail } from "@/lib/email";
import { format, parseISO } from "date-fns";

const DB_ID = "therapy_connect_db";
const SLOTS_COLLECTION = "slots";
const BOOKINGS_COLLECTION = "bookings";
const USERS_COLLECTION = "users";
const RATES_COLLECTION = "service_rates";

export async function getSlotDetails(slotId) {
  // ... (Keep existing fetch logic) ...
  // Note: We might need to adjust this to fetch price based on DURATION later
  // For now, assuming slotId implies the start time.
  const { databases } = await createAdminClient();
  try {
    const slot = await databases.getDocument(DB_ID, SLOTS_COLLECTION, slotId);
    const therapist = await databases.getDocument(
      DB_ID,
      USERS_COLLECTION,
      slot.therapist_id,
    );

    // Fetch ALL rates
    const { documents: rates } = await databases.listDocuments(
      DB_ID,
      RATES_COLLECTION,
      [Query.equal("therapist_id", slot.therapist_id)],
    );

    return { slot, therapist, rates }; // Return ALL rates so frontend can pick
  } catch (error) {
    return null;
  }
}

export async function createBooking(formData) {
  const session = await createSessionClient();
  const user = await session.account.get();
  const { databases, users } = await createAdminClient();

  const startSlotId = formData.get("slotId");
  const mode = formData.get("mode");
  const duration = parseInt(formData.get("duration") || "60"); // 30, 60, 90

  try {
    const startSlot = await databases.getDocument(
      DB_ID,
      SLOTS_COLLECTION,
      startSlotId,
    );

    // Calculate End Time
    const startTime = new Date(startSlot.start_time);
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    // 1. Find ALL slots covered by this duration
    const affectedSlots = await databases.listDocuments(
      DB_ID,
      SLOTS_COLLECTION,
      [
        Query.equal("therapist_id", startSlot.therapist_id),
        Query.greaterThanEqual("start_time", startTime.toISOString()),
        Query.lessThan("start_time", endTime.toISOString()),
      ],
    );

    // 2. Validate availability
    // We expect (duration / 30) slots. E.g. 60mins needs 2 slots.
    const requiredSlots = duration / 30;
    if (affectedSlots.documents.length < requiredSlots) {
      return {
        error: "Consecutive slots are not available for this duration.",
      };
    }

    for (const slot of affectedSlots.documents) {
      if (slot.is_booked)
        return { error: "Part of this time range is already booked." };
    }

    // 3. Lock ALL slots
    await Promise.all(
      affectedSlots.documents.map((slot) =>
        databases.updateDocument(DB_ID, SLOTS_COLLECTION, slot.$id, {
          is_booked: true,
        }),
      ),
    );

    // 4. Create Booking
    await databases.createDocument(DB_ID, BOOKINGS_COLLECTION, ID.unique(), {
      client_id: user.$id,
      therapist_id: startSlot.therapist_id,
      service_rate_id: `standard-${duration}`,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: "pending_approval",
      mode: mode,
      otp_code: Math.floor(1000 + Math.random() * 9000).toString(),
    });

    // --- EMAILS ---
    const therapistProfile = await databases.getDocument(
      DB_ID,
      USERS_COLLECTION,
      startSlot.therapist_id,
    );
    const therapistUser = await users.get(startSlot.therapist_id);
    const emailData = {
      clientName: user.name,
      therapistName: therapistProfile.full_name,
      date: format(startTime, "EEEE, MMMM do"),
      time: `${format(startTime, "h:mm a")} (${duration} mins)`,
    };

    await sendEmail(user.email, "REQUEST_SENT", emailData);
    await sendEmail(therapistUser.email, "REQUEST_RECEIVED", emailData);
  } catch (error) {
    console.error("Booking Error:", error);
    return { error: "Transaction failed." };
  }

  redirect("/success");
}
