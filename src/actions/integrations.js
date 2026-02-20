"use server";

import { redirect } from "next/navigation";
import {
  getGoogleAuthUrl,
  refreshGoogleToken,
  getGoogleEventsList,
  createGoogleEvent,
} from "@/lib/google";
import { createSessionClient, createAdminClient } from "@/lib/appwrite";
import { revalidatePath } from "next/cache";

const DB_ID = "therapy_connect_db";
const USERS_COLLECTION = "users";

export async function connectGoogleCalendar() {
  const { account } = await createSessionClient();
  const user = await account.get();
  redirect(getGoogleAuthUrl(user.$id));
}

export async function disconnectGoogleCalendar() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    const { databases } = await createAdminClient();
    await databases.updateDocument(DB_ID, USERS_COLLECTION, user.$id, {
      google_refresh_token: null,
      google_access_token: null,
      google_calendar_id: null,
    });
    revalidatePath("/therapist/settings");
    return { success: true };
  } catch (error) {
    return { error: "Failed to disconnect calendar." };
  }
}

// PULL FROM GOOGLE (For Dashboard)
export async function getDashboardGoogleEvents() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    const { databases } = await createAdminClient();
    const dbUser = await databases.getDocument(
      DB_ID,
      USERS_COLLECTION,
      user.$id,
    );

    if (!dbUser.google_refresh_token) return [];

    let accessToken = dbUser.google_access_token;
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    try {
      // Attempt 1: Try fetching with current access token
      const data = await getGoogleEventsList(
        accessToken,
        now.toISOString(),
        nextWeek.toISOString(),
      );
      return data.items || [];
    } catch (error) {
      // Attempt 2: Token likely expired. Refresh it, save it, and try again.
      const newTokens = await refreshGoogleToken(dbUser.google_refresh_token);
      accessToken = newTokens.access_token;
      await databases.updateDocument(DB_ID, USERS_COLLECTION, user.$id, {
        google_access_token: accessToken,
      });

      const data = await getGoogleEventsList(
        accessToken,
        now.toISOString(),
        nextWeek.toISOString(),
      );
      return data.items || [];
    }
  } catch (err) {
    console.error("Error fetching Google events:", err);
    return [];
  }
}

// PUSH TO GOOGLE (Call this when a booking is confirmed)
export async function pushBookingToGoogle(bookingId) {
  const { databases } = await createAdminClient();
  const DB_ID = "therapy_connect_db";

  try {
    console.log("⏳ Starting Google Push for Booking ID:", bookingId);

    const booking = await databases.getDocument(DB_ID, "bookings", bookingId);
    const therapist = await databases.getDocument(
      DB_ID,
      "users",
      booking.therapist_id,
    );

    // SAFE FETCH: Ensure we don't crash if client data is missing
    let clientName = "Therapy Client";
    try {
      const client = await databases.getDocument(
        DB_ID,
        "users",
        booking.client_id,
      );
      if (client.full_name) clientName = client.full_name;
    } catch (clientErr) {
      console.log("⚠️ Client name fetch failed, using default name.");
    }

    if (!therapist.google_refresh_token) {
      console.log("❌ Abort: Therapist has no Google Refresh Token.");
      return { success: false, reason: "No Google connected" };
    }

    // FORMAT FOR GOOGLE: Explicitly defining the TimeZone
    const event = {
      summary: `Therapy Session with ${clientName}`,
      description: `TherapyConnect session.\nMode: ${booking.mode}\nLocation/Link: ${booking.mode === "online" ? therapist.meeting_link : therapist.clinic_address}`,
      start: {
        dateTime: booking.start_time,
        timeZone: "Asia/Kolkata", // Enforce IST
      },
      end: {
        dateTime: booking.end_time,
        timeZone: "Asia/Kolkata", // Enforce IST
      },
    };

    try {
      console.log("📡 Sending to Google...");
      await createGoogleEvent(therapist.google_access_token, event);
      console.log("✅ Success! Event added to Google Calendar.");
    } catch (e) {
      console.log("🔄 First attempt failed. Refreshing Token...");
      // Auto-refresh token if the first try failed (usually means token expired)
      const newTokens = await refreshGoogleToken(
        therapist.google_refresh_token,
      );

      // Save new access token to DB
      await databases.updateDocument(DB_ID, "users", therapist.$id, {
        google_access_token: newTokens.access_token,
      });

      // Try again with new token
      await createGoogleEvent(newTokens.access_token, event);
      console.log("✅ Success on 2nd try (after token refresh)!");
    }

    return { success: true };
  } catch (error) {
    console.error("🔥 CRITICAL GOOGLE PUSH ERROR:", error);
    return { success: false, error: error.message };
  }
}
