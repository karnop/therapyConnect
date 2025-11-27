"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";

const DB_ID = "therapy_connect_db";
const SLOTS_COLLECTION = "slots";

// --- HELPER: CHECK OVERLAP ---
// Returns true if the new range overlaps with any existing slot
function isOverlapping(newStart, newEnd, existingSlots) {
  return existingSlots.some((slot) => {
    const existingStart = new Date(slot.start_time);
    const existingEnd = new Date(slot.end_time);

    // Overlap formula: (StartA < EndB) and (EndA > StartB)
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
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // +60 mins
  const now = new Date();

  // VALIDATION 1: Past Check
  if (startDateTime < now) {
    return { error: "Cannot create slots in the past." };
  }

  try {
    // VALIDATION 2: Overlap Check
    // Fetch slots for this specific day to check overlap
    // Construct start/end of the day for query
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

    // Create if valid
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

// --- 2. BULK GENERATOR (Optimized) ---
export async function generateBulkSlots(formData) {
  const user = await (await createSessionClient()).account.get();
  const { databases } = await createAdminClient();

  const startDate = new Date(formData.get("startDate"));
  const endDate = new Date(formData.get("endDate"));

  // VALIDATION 3: 14 Day Limit
  const differenceInTime = endDate.getTime() - startDate.getTime();
  const differenceInDays = differenceInTime / (1000 * 3600 * 24);

  if (differenceInDays > 14) {
    return {
      error: "You can only generate slots for up to 14 days at a time.",
    };
  }

  if (endDate < startDate) {
    return { error: "End date must be after start date." };
  }

  const startTimeStr = formData.get("startTime");
  const endTimeStr = formData.get("endTime");
  const selectedDays = formData.get("selectedDays").split(",").map(Number);

  const [startHour, startMin] = startTimeStr.split(":").map(Number);
  const [endHour, endMin] = endTimeStr.split(":").map(Number);

  // OPTIMIZATION: Fetch ALL existing slots in this date range ONCE
  // This prevents making 1 database read call for every single hour we try to generate.
  // We construct a query to get slots between bulk start and bulk end.
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
      Query.limit(1000), // Assume max slots in 2 weeks won't exceed 1000
    ]
  );

  const slotsToCreate = [];
  const now = new Date();

  // Loop logic (Memory only - very fast)
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    if (selectedDays.includes(d.getDay())) {
      let currentSlotTime = new Date(d);
      currentSlotTime.setHours(startHour, startMin, 0, 0);

      const dayEndTime = new Date(d);
      dayEndTime.setHours(endHour, endMin, 0, 0);

      while (currentSlotTime < dayEndTime) {
        const slotEnd = new Date(currentSlotTime.getTime() + 60 * 60 * 1000);

        // Check 1: Is it in the past?
        if (currentSlotTime > now) {
          // Check 2: Does it overlap? (Local check against fetched list)
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
        // Move to next hour
        currentSlotTime = slotEnd;
      }
    }
  }

  // Batch Create
  // Appwrite doesn't have a true batch API, but running Promise.all on pre-validated data
  // is much faster than checking every single one sequentially.
  try {
    const createPromises = slotsToCreate.map((data) =>
      databases.createDocument(DB_ID, SLOTS_COLLECTION, ID.unique(), data)
    );

    await Promise.all(createPromises);

    revalidatePath("/therapist/schedule");
    return { success: true, count: slotsToCreate.length };
  } catch (error) {
    console.error("Bulk Error:", error);
    return { error: "Failed to generate some slots." };
  }
}

// --- 3. FETCH & DELETE ---
export async function deleteSlot(slotId) {
  const { databases } = await createAdminClient();
  try {
    await databases.deleteDocument(DB_ID, SLOTS_COLLECTION, slotId);
    revalidatePath("/therapist/schedule");
  } catch (error) {
    console.error(error);
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

  return slots.documents;
}
