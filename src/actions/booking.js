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
  const { databases } = await createAdminClient();
  try {
    const slot = await databases.getDocument(DB_ID, SLOTS_COLLECTION, slotId);
    const therapist = await databases.getDocument(
      DB_ID,
      USERS_COLLECTION,
      slot.therapist_id
    );
    const { documents: rates } = await databases.listDocuments(
      DB_ID,
      RATES_COLLECTION,
      [
        Query.equal("therapist_id", slot.therapist_id),
        Query.equal("duration_mins", 60),
      ]
    );
    return { slot, therapist, price: rates[0]?.price_inr || 0 };
  } catch (error) {
    return null;
  }
}

export async function createBooking(formData) {
  const session = await createSessionClient();
  const user = await session.account.get();
  const { databases, users } = await createAdminClient(); // Need 'users' for fetching therapist email

  const slotId = formData.get("slotId");
  const mode = formData.get("mode");

  try {
    const slot = await databases.getDocument(DB_ID, SLOTS_COLLECTION, slotId);
    if (slot.is_booked) return { error: "Slot already booked." };

    await databases.updateDocument(DB_ID, SLOTS_COLLECTION, slotId, {
      is_booked: true,
    });

    await databases.createDocument(DB_ID, BOOKINGS_COLLECTION, ID.unique(), {
      client_id: user.$id,
      therapist_id: slot.therapist_id,
      service_rate_id: "standard-60",
      start_time: slot.start_time,
      end_time: slot.end_time,
      status: "pending_approval",
      mode: mode,
      otp_code: Math.floor(1000 + Math.random() * 9000).toString(),
    });

    // --- EMAILS ---
    const therapistProfile = await databases.getDocument(
      DB_ID,
      USERS_COLLECTION,
      slot.therapist_id
    );

    // Get Therapist Auth Email (Not in DB doc)
    const therapistUser = await users.get(slot.therapist_id);

    const emailData = {
      clientName: user.name,
      therapistName: therapistProfile.full_name,
      date: format(parseISO(slot.start_time), "EEEE, MMMM do"),
      time: format(parseISO(slot.start_time), "h:mm a"),
    };

    // 1. Notify Client
    await sendEmail(user.email, "REQUEST_SENT", emailData);

    // 2. Notify Therapist
    await sendEmail(therapistUser.email, "REQUEST_RECEIVED", emailData);
  } catch (error) {
    console.error("Booking Error:", error);
    return { error: "Transaction failed." };
  }

  redirect("/success");
}
