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
      slot.therapist_id,
    );
    const { documents: rates } = await databases.listDocuments(
      DB_ID,
      RATES_COLLECTION,
      [Query.equal("therapist_id", slot.therapist_id)],
    );
    return { slot, therapist, rates };
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
    // 1. Fetch the Starting Slot to get Context
    const startSlot = await databases.getDocument(
      DB_ID,
      SLOTS_COLLECTION,
      startSlotId,
    );

    // Calculate Target Time Range
    const startTime = new Date(startSlot.start_time);
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    // 2. Query ALL slots falling within this range
    // We sort by start_time to ensure we can check continuity
    const affectedSlots = await databases.listDocuments(
      DB_ID,
      SLOTS_COLLECTION,
      [
        Query.equal("therapist_id", startSlot.therapist_id),
        Query.greaterThanEqual("start_time", startTime.toISOString()),
        Query.lessThan("start_time", endTime.toISOString()),
        Query.orderAsc("start_time"),
      ],
    );

    // 3. ROBUST VALIDATION
    // Logic: Iterate through fetched slots. They must:
    // a) Be unbooked
    // b) Perfectly bridge the time from startTime to endTime without gaps

    let currentCheckTime = startTime.getTime();
    let totalCoveredMinutes = 0;

    for (const slot of affectedSlots.documents) {
      if (slot.is_booked) {
        return { error: "Part of this time range is already booked." };
      }

      const sTime = new Date(slot.start_time).getTime();
      const eTime = new Date(slot.end_time).getTime();

      // Gap Check: The current slot must start exactly where the previous check ended
      if (sTime !== currentCheckTime) {
        return {
          error:
            "There is a gap in available slots. Cannot book consecutive time.",
        };
      }

      // Update trackers
      totalCoveredMinutes += (eTime - sTime) / (1000 * 60);
      currentCheckTime = eTime;
    }

    // Final Coverage Check
    if (totalCoveredMinutes < duration) {
      return {
        error: `Available slots only cover ${totalCoveredMinutes} mins. You need ${duration} mins.`,
      };
    }

    // 4. Lock ALL affected slots
    await Promise.all(
      affectedSlots.documents.map((slot) =>
        databases.updateDocument(DB_ID, SLOTS_COLLECTION, slot.$id, {
          is_booked: true,
        }),
      ),
    );

    // 5. Create Booking
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
    return { error: "Transaction failed: " + error.message };
  }

  redirect("/success");
}
