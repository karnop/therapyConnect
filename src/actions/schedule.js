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

  const startDateTime = new Date(`${date}T${time}`);
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

// --- 2. BULK GENERATOR ---
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

  const [startHour, startMin] = startTimeStr.split(":").map(Number);
  const [endHour, endMin] = endTimeStr.split(":").map(Number);

  const existingSlotsInRange = await databases.listDocuments(
    DB_ID,
    SLOTS_COLLECTION,
    [
      Query.equal("therapist_id", user.$id),
      Query.between(
        "start_time",
        startDate.toISOString(),
        endDate.toISOString()
      ),
      Query.limit(1000),
    ]
  );

  const slotsToCreate = [];
  const now = new Date();

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    if (selectedDays.includes(d.getDay())) {
      let currentSlotTime = new Date(d);
      currentSlotTime.setHours(startHour, startMin, 0, 0);
      const dayEndTime = new Date(d);
      dayEndTime.setHours(endHour, endMin, 0, 0);

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

// --- 3. FETCH & DELETE (UPDATED) ---

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
