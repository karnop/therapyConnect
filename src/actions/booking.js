"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite"; // Added Query import
import { redirect } from "next/navigation";

const DB_ID = "therapy_connect_db";
const SLOTS_COLLECTION = "slots";
const BOOKINGS_COLLECTION = "bookings";
const USERS_COLLECTION = "users";
const RATES_COLLECTION = "service_rates";

export async function getSlotDetails(slotId) {
  const { databases } = await createAdminClient();
  try {
    // 1. Fetch Slot
    const slot = await databases.getDocument(DB_ID, SLOTS_COLLECTION, slotId);

    // 2. Fetch Therapist Details
    const therapist = await databases.getDocument(
      DB_ID,
      USERS_COLLECTION,
      slot.therapist_id
    );

    // 3. Fetch Price (Fixed Query Syntax)
    const { documents: rates } = await databases.listDocuments(
      DB_ID,
      RATES_COLLECTION,
      [
        Query.equal("therapist_id", slot.therapist_id),
        Query.equal("duration_mins", 60),
      ]
    );

    return {
      slot,
      therapist,
      price: rates[0]?.price_inr || 0,
    };
  } catch (error) {
    console.error("Get Slot Details Error:", error); // Log error to see what's wrong
    return null;
  }
}

export async function createBooking(formData) {
  const session = await createSessionClient();
  const user = await session.account.get();

  const { databases } = await createAdminClient();

  const slotId = formData.get("slotId");
  const mode = formData.get("mode");

  try {
    const slot = await databases.getDocument(DB_ID, SLOTS_COLLECTION, slotId);

    if (slot.is_booked) {
      return { error: "This slot was just booked by someone else." };
    }

    await databases.updateDocument(DB_ID, SLOTS_COLLECTION, slotId, {
      is_booked: true,
    });

    await databases.createDocument(DB_ID, BOOKINGS_COLLECTION, ID.unique(), {
      client_id: user.$id,
      therapist_id: slot.therapist_id,
      service_rate_id: "standard-60",
      start_time: slot.start_time,
      end_time: slot.end_time,
      status: "confirmed",
      mode: mode,
      payment_id: "simulated_" + ID.unique(),
      otp_code: Math.floor(1000 + Math.random() * 9000).toString(),
    });
  } catch (error) {
    console.error("Booking Error:", error);
    return { error: "Transaction failed. Please try again." };
  }

  redirect("/success");
}
