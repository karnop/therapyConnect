"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";

const DB_ID = "therapy_connect_db";
const SLOTS_COLLECTION = "slots";
const BOOKINGS_COLLECTION = "bookings";

// --- HELPER: CHECK OVERLAP ---
function isOverlapping(newStart, newEnd, existingSlots) {
  return existingSlots.some((slot) => {
    const existingStart = new Date(slot.start_time);
    const existingEnd = new Date(slot.end_time);
    return newStart < existingEnd && newEnd > existingStart;
  });
}

// --- 1. SINGLE SLOT CREATION ---
export async function createSlot(formData) {
  const { account } = (await createSessionClient()).account;
  const user = await (await createSessionClient()).account.get();
  const { databases } = await createAdminClient();

  const date = formData.get("date");
  const time = formData.get("time");

  // FIX: Force IST Offset (+05:30) so 4:00 PM means 4:00 PM IST
  const startDateTime = new Date(`${date}T${time}+05:30`);
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
  const now = new Date();

  if (startDateTime < now) {
    return { error: "Cannot create slots in the past." };
  }

  try {
    const dayStart = new Date(startDateTime);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(startDateTime);
    dayEnd.setHours(23, 59, 59, 999);

    const existingSlots = await databases.listDocuments(
      DB_ID,
      SLOTS_COLLECTION,
      [
        Query.equal("therapist_id", user.$id),
        Query.between(
          "start_time",
          dayStart.toISOString(),
          dayEnd.toISOString()
        ),
      ]
    );

    if (isOverlapping(startDateTime, endDateTime, existingSlots.documents)) {
      return { error: "This time overlaps with an existing slot." };
    }

    await databases.createDocument(DB_ID, SLOTS_COLLECTION, ID.unique(), {
      therapist_id: user.$id,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      is_booked: false,
    });

    revalidatePath("/therapist/schedule");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function generateBulkSlots(formData) {
  const user = await (await createSessionClient()).account.get();
  const { databases } = await createAdminClient();

  const startDate = new Date(formData.get("startDate"));
  const endDate = new Date(formData.get("endDate"));

  const differenceInTime = endDate.getTime() - startDate.getTime();
  const differenceInDays = differenceInTime / (1000 * 3600 * 24);

  if (differenceInDays > 14) return { error: "Limit is 14 days." };
  if (endDate < startDate) return { error: "End date error." };

  const startTimeStr = formData.get("startTime");
  const endTimeStr = formData.get("endTime");
  const selectedDays = formData.get("selectedDays").split(",").map(Number);

  // Fetch existing slots range for overlap check
  // We add buffer to start/end queries to be safe
  const existingSlotsInRange = await databases.listDocuments(
    DB_ID,
    SLOTS_COLLECTION,
    [
      Query.equal("therapist_id", user.$id),
      Query.limit(1000),
      // Note: Removed time range query here to simplify MVP logic and ensure we catch everything.
      // In prod, use range query.
    ]
  );

  const slotsToCreate = [];
  const now = new Date();

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    if (selectedDays.includes(d.getDay())) {
      // FIX: Construct time using IST offset explicitly
      const dateStr = d.toISOString().split("T")[0]; // Extract YYYY-MM-DD from the UTC date object
      let currentSlotTime = new Date(`${dateStr}T${startTimeStr}:00+05:30`);

      // Calculate Day End Time in IST
      const dayEndTime = new Date(`${dateStr}T${endTimeStr}:00+05:30`);

      while (currentSlotTime < dayEndTime) {
        const slotEnd = new Date(currentSlotTime.getTime() + 60 * 60 * 1000);

        if (currentSlotTime > now) {
          const hasOverlap = isOverlapping(
            currentSlotTime,
            slotEnd,
            existingSlotsInRange.documents
          );
          if (!hasOverlap) {
            slotsToCreate.push({
              therapist_id: user.$id,
              start_time: currentSlotTime.toISOString(),
              end_time: slotEnd.toISOString(),
              is_booked: false,
            });
          }
        }
        currentSlotTime = slotEnd;
      }
    }
  }

  try {
    const createPromises = slotsToCreate.map((data) =>
      databases.createDocument(DB_ID, SLOTS_COLLECTION, ID.unique(), data)
    );
    await Promise.all(createPromises);
    revalidatePath("/therapist/schedule");
    return { success: true, count: slotsToCreate.length };
  } catch (error) {
    return { error: "Failed to generate some slots." };
  }
}

export async function createManualBooking(formData) {
  const session = await createSessionClient();
  const user = await session.account.get();
  const { databases } = await createAdminClient();

  const clientId = formData.get("clientId");
  const date = formData.get("date");
  const time = formData.get("time");
  const mode = formData.get("mode");

  // FIX: Force IST Offset
  const startDateTime = new Date(`${date}T${time}+05:30`);
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
  const now = new Date();

  if (startDateTime < now) {
    return { error: "Cannot book appointments in the past." };
  }

  try {
    const dayStart = new Date(startDateTime);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(startDateTime);
    dayEnd.setHours(23, 59, 59, 999);

    const existingSlots = await databases.listDocuments(
      DB_ID,
      SLOTS_COLLECTION,
      [
        Query.equal("therapist_id", user.$id),
        Query.between(
          "start_time",
          dayStart.toISOString(),
          dayEnd.toISOString()
        ),
      ]
    );

    let targetSlotId = null;
    const exactMatch = existingSlots.documents.find(
      (s) => s.start_time === startDateTime.toISOString()
    );

    if (exactMatch) {
      if (exactMatch.is_booked)
        return { error: "This slot is already booked." };
      targetSlotId = exactMatch.$id;
    } else {
      if (isOverlapping(startDateTime, endDateTime, existingSlots.documents)) {
        return { error: "Time overlaps with another existing slot." };
      }
      const newSlot = await databases.createDocument(
        DB_ID,
        SLOTS_COLLECTION,
        ID.unique(),
        {
          therapist_id: user.$id,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          is_booked: false,
        }
      );
      targetSlotId = newSlot.$id;
    }

    await databases.updateDocument(DB_ID, SLOTS_COLLECTION, targetSlotId, {
      is_booked: true,
    });

    await databases.createDocument(DB_ID, BOOKINGS_COLLECTION, ID.unique(), {
      client_id: clientId,
      therapist_id: user.$id,
      service_rate_id: "manual-booking",
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      status: "confirmed",
      mode: mode,
      payment_id: "manual_entry",
      otp_code: "0000",
    });

    revalidatePath("/therapist/schedule");
    revalidatePath("/therapist/dashboard");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function deleteSlot(slotId) {
  const { databases } = await createAdminClient();
  try {
    // SAFETY GUARD: Check if booked before deleting
    const slot = await databases.getDocument(DB_ID, SLOTS_COLLECTION, slotId);

    if (slot.is_booked) {
      // Cannot delete booked slots via this simple button
      // Ideally, we'd throw an error that the frontend catches
      throw new Error(
        "Cannot delete a booked slot. Please cancel the booking instead."
      );
    }

    await databases.deleteDocument(DB_ID, SLOTS_COLLECTION, slotId);
    revalidatePath("/therapist/schedule");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: error.message };
  }
}

export async function getMySlots() {
  const user = await (await createSessionClient()).account.get();
  const { databases } = await createAdminClient();

  // 1. Fetch Slots
  const slots = await databases.listDocuments(DB_ID, SLOTS_COLLECTION, [
    Query.equal("therapist_id", user.$id),
    Query.orderAsc("start_time"),
    Query.limit(1000),
  ]);

  // 2. Fetch Active Bookings (to enrich slots with status)
  // We get bookings from now onwards to match slots
  const now = new Date().toISOString();
  const bookings = await databases.listDocuments(DB_ID, BOOKINGS_COLLECTION, [
    Query.equal("therapist_id", user.$id),
    Query.greaterThanEqual("start_time", now),
    Query.limit(1000),
  ]);

  // 3. Merge: Map slot time to booking status
  // Key = start_time ISO string, Value = Booking Doc
  const bookingMap = {};
  bookings.documents.forEach((b) => {
    bookingMap[b.start_time] = b;
  });

  // 4. Return enriched slots
  return slots.documents.map((slot) => {
    const matchingBooking = bookingMap[slot.start_time];

    // Determine Status
    let status = "available"; // default
    let bookingId = null;
    let clientName = null;

    if (slot.is_booked && matchingBooking) {
      status = matchingBooking.status; // pending_approval, confirmed, etc.
      bookingId = matchingBooking.$id;
      // Note: client name isn't fetched here to save calls,
      // but we could if we did a join. For schedule grid, status color is enough.
    }

    return {
      ...slot,
      status, // 'available', 'pending_approval', 'confirmed', etc.
      bookingId,
    };
  });
}
