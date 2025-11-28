"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite";
import { Query } from "node-appwrite";

const DB_ID = "therapy_connect_db";
const BOOKINGS_COLLECTION = "bookings";
const USERS_COLLECTION = "users";
const BUCKET_ID = "69272be5003c066e0366";

// --- FOR THERAPISTS: GET MY CLIENTS ---
export async function getMyClients() {
  const session = await createSessionClient();
  const user = await session.account.get();
  const { databases } = await createAdminClient();

  // 1. Fetch bookings
  const bookings = await databases.listDocuments(DB_ID, BOOKINGS_COLLECTION, [
    Query.equal("therapist_id", user.$id),
    Query.limit(500),
    Query.orderDesc("start_time"), // Sort by newest so we hit latest first
  ]);

  // 2. Group by Client ID
  const clientMap = new Map();

  for (const booking of bookings.documents) {
    if (!clientMap.has(booking.client_id)) {
      clientMap.set(booking.client_id, {
        id: booking.client_id,
        lastSession: booking.start_time,
        lastSessionId: booking.$id, // SAVE THIS ID for linking
        sessionCount: 0,
        profile: null,
      });
    }

    const clientData = clientMap.get(booking.client_id);
    clientData.sessionCount++;
    // Since we sorted by DESC, the first time we see a client IS their last session.
    // But standard logic for robustness:
    if (new Date(booking.start_time) > new Date(clientData.lastSession)) {
      clientData.lastSession = booking.start_time;
      clientData.lastSessionId = booking.$id;
    }
  }

  // 3. Fetch Client Profiles
  const clients = Array.from(clientMap.values());

  const enrichedClients = await Promise.all(
    clients.map(async (c) => {
      try {
        const profile = await databases.getDocument(
          DB_ID,
          USERS_COLLECTION,
          c.id
        );
        return {
          ...c,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone_number,
        };
      } catch (e) {
        return null;
      }
    })
  );

  return enrichedClients.filter(Boolean);
}

// --- FOR CLIENTS: GET MY THERAPISTS ---
// (Keep existing getMyTherapists implementation as is)
export async function getMyTherapists() {
  const session = await createSessionClient();
  const user = await session.account.get();
  const { databases } = await createAdminClient();

  const bookings = await databases.listDocuments(DB_ID, BOOKINGS_COLLECTION, [
    Query.equal("client_id", user.$id),
    Query.limit(100),
  ]);

  const therapistMap = new Map();

  for (const booking of bookings.documents) {
    if (!therapistMap.has(booking.therapist_id)) {
      therapistMap.set(booking.therapist_id, {
        id: booking.therapist_id,
        lastSession: booking.start_time,
        sessionCount: 0,
        profile: null,
      });
    }

    const tData = therapistMap.get(booking.therapist_id);
    tData.sessionCount++;
    if (new Date(booking.start_time) > new Date(tData.lastSession)) {
      tData.lastSession = booking.start_time;
    }
  }

  const therapists = Array.from(therapistMap.values());

  const enrichedTherapists = await Promise.all(
    therapists.map(async (t) => {
      try {
        const profile = await databases.getDocument(
          DB_ID,
          USERS_COLLECTION,
          t.id
        );

        let avatarUrl = null;
        if (profile.avatar_id) {
          const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
          const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
          avatarUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${profile.avatar_id}/view?project=${projectId}`;
        }

        return {
          ...t,
          full_name: profile.full_name,
          specialties: profile.specialties,
          avatarUrl,
        };
      } catch (e) {
        return null;
      }
    })
  );

  return enrichedTherapists.filter(Boolean);
}
