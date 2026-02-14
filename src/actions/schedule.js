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

// --- 1. SINGLE SLOT CREATION (Now Defaults to 30 Min) ---
export async function createSlot(formData) {
  const { account } = (await createSessionClient()).account;
  const user = await (await createSessionClient()).account.get();
  const { databases } = await createAdminClient();

  const date = formData.get("date");
  const time = formData.get("time");

  const startDateTime = new Date(`${date}T${time}+05:30`);
  // BASE UNIT: 30 Minutes
  const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000);
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
          dayEnd.toISOString(),
        ),
      ],
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

// --- 2. BULK GENERATOR (Loops by 30 mins) ---
export async function generateBulkSlots(formData) {
  const user = await (await createSessionClient()).account.get();
  const { databases } = await createAdminClient();

  const startDate = new Date(formData.get("startDate"));
  const endDate = new Date(formData.get("endDate"));

  // Validation limits...
  const differenceInTime = endDate.getTime() - startDate.getTime();
  const differenceInDays = differenceInTime / (1000 * 3600 * 24);
  if (differenceInDays > 14) return { error: "Limit is 14 days." };

  const startTimeStr = formData.get("startTime");
  const endTimeStr = formData.get("endTime");
  const selectedDays = formData.get("selectedDays").split(",").map(Number);

  const [startHour, startMin] = startTimeStr.split(":").map(Number);
  const [endHour, endMin] = endTimeStr.split(":").map(Number);

  // Fetch existing slots logic...
  const existingSlotsInRange = await databases.listDocuments(
    DB_ID,
    SLOTS_COLLECTION,
    [
      Query.equal("therapist_id", user.$id),
      Query.limit(2000), // Increased limit as slot count doubles
    ],
  );

  const slotsToCreate = [];
  const now = new Date();

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    if (selectedDays.includes(d.getDay())) {
      // IST Date Construction
      const dateStr = d.toISOString().split("T")[0];
      let currentSlotTime = new Date(`${dateStr}T${startTimeStr}:00+05:30`);
      const dayEndTime = new Date(`${dateStr}T${endTimeStr}:00+05:30`);

      while (currentSlotTime < dayEndTime) {
        // STEP SIZE: 30 Minutes
        const slotEnd = new Date(currentSlotTime.getTime() + 30 * 60 * 1000);

        if (currentSlotTime > now) {
          const hasOverlap = isOverlapping(
            currentSlotTime,
            slotEnd,
            existingSlotsInRange.documents,
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
      databases.createDocument(DB_ID, SLOTS_COLLECTION, ID.unique(), data),
    );
    await Promise.all(createPromises);
    revalidatePath("/therapist/schedule");
    return { success: true, count: slotsToCreate.length };
  } catch (error) {
    return { error: "Failed to generate some slots." };
  }
}

// --- 3. MANUAL BOOKING (Multi-Slot Locking) ---
export async function createManualBooking(formData) {
  const session = await createSessionClient();
  const user = await session.account.get();
  const { databases } = await createAdminClient();

  const clientId = formData.get("clientId");
  const date = formData.get("date");
  const time = formData.get("time");
  const mode = formData.get("mode");
  // New: Allow variable duration for manual booking
  const duration = parseInt(formData.get("duration") || "60");

  const startDateTime = new Date(`${date}T${time}+05:30`);
  const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);

  try {
    // Query ALL slots that fall in this range
    const overlappingSlots = await databases.listDocuments(
      DB_ID,
      SLOTS_COLLECTION,
      [
        Query.equal("therapist_id", user.$id),
        Query.greaterThanEqual("start_time", startDateTime.toISOString()),
        Query.lessThan("start_time", endDateTime.toISOString()),
      ],
    );

    // LOCK THEM
    for (const slot of overlappingSlots.documents) {
      if (slot.is_booked)
        return { error: "One of the slots in this range is already booked." };
      await databases.updateDocument(DB_ID, SLOTS_COLLECTION, slot.$id, {
        is_booked: true,
      });
    }

    // Note: If no slots exist, we create the booking anyway (manual override).
    // If slots exist, we mark them booked so they disappear from marketplace.

    await databases.createDocument(DB_ID, BOOKINGS_COLLECTION, ID.unique(), {
      client_id: clientId,
      therapist_id: user.$id,
      service_rate_id: "manual",
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      status: "confirmed",
      mode: mode,
      payment_id: "manual",
      otp_code: "0000",
    });

    revalidatePath("/therapist/schedule");
    revalidatePath("/therapist/dashboard");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

// ... (fetch/delete functions same as before) ...
export async function deleteSlot(slotId) {
  const { databases } = await createAdminClient();
  try {
    const slot = await databases.getDocument(DB_ID, SLOTS_COLLECTION, slotId);
    if (slot.is_booked) throw new Error("Cannot delete a booked slot.");
    await databases.deleteDocument(DB_ID, SLOTS_COLLECTION, slotId);
    revalidatePath("/therapist/schedule");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getMySlots() {
  const user = await (await createSessionClient()).account.get();
  const { databases } = await createAdminClient();
  const slots = await databases.listDocuments(DB_ID, SLOTS_COLLECTION, [
    Query.equal("therapist_id", user.$id),
    Query.orderAsc("start_time"),
    Query.limit(1000),
  ]);
  const bookings = await databases.listDocuments(DB_ID, BOOKINGS_COLLECTION, [
    Query.equal("therapist_id", user.$id),
    Query.limit(1000),
  ]);

  // Complex merge logic isn't needed for just deleting empty slots.
  // But for the grid we need status.
  const bookingMap = {};
  bookings.documents.forEach((b) => {
    // Map any slot that falls inside a booking's range
    const bStart = new Date(b.start_time);
    const bEnd = new Date(b.end_time);

    // We can't map by exact start_time anymore because one booking covers multiple slots.
    // We won't perfect this visual mapping for MVP "manual schedule" grid,
    // as long as "Booked" shows up red/orange.
    bookingMap[b.start_time] = b; // Simple start match for now
  });

  return slots.documents.map((slot) => {
    const matchingBooking = bookingMap[slot.start_time];
    let status = "available";
    let bookingId = null;

    if (slot.is_booked) {
      status = matchingBooking ? matchingBooking.status : "unknown_booking";
      bookingId = matchingBooking?.$id;
    }
    return { ...slot, status, bookingId };
  });
}
