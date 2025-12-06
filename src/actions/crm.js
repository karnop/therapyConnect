"use server";

import { createSessionClient, createAdminClient } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";

const DB_ID = "therapy_connect_db";
const BOOKINGS_COLLECTION = "bookings";
const USERS_COLLECTION = "users";
const CLIENT_RECORDS_COLLECTION = "client_records";
const DOCUMENTS_COLLECTION = "documents";
const BUCKET_ID = "69272be5003c066e0366";

export async function getMyClients() {
  const session = await createSessionClient();
  const user = await session.account.get();
  const { databases } = await createAdminClient();

  // 1. Fetch Bookings (Marketplace Clients)
  const bookings = await databases.listDocuments(DB_ID, BOOKINGS_COLLECTION, [
    Query.equal("therapist_id", user.$id),
    Query.limit(500),
    Query.orderDesc("start_time"),
  ]);

  // 2. Fetch Client Records (Offline/Ghost Clients)
  const records = await databases.listDocuments(
    DB_ID,
    CLIENT_RECORDS_COLLECTION,
    [Query.equal("therapist_id", user.$id), Query.limit(500)]
  );

  // 3. Merge Lists using a Map (Key = Client ID)
  const clientMap = new Map();

  // Process Records First (Offline Clients + Existing Charts)
  for (const record of records.documents) {
    clientMap.set(record.client_id, {
      id: record.client_id,
      lastSession: null, // Will update if bookings exist
      lastSessionId: null,
      sessionCount: 0,
      source: record.source,
      profile: null,
    });
  }

  // Process Bookings (Update stats & Add Marketplace Clients missing records)
  for (const booking of bookings.documents) {
    if (!clientMap.has(booking.client_id)) {
      // Found a client who booked but has no record yet
      clientMap.set(booking.client_id, {
        id: booking.client_id,
        lastSession: null,
        lastSessionId: null,
        sessionCount: 0,
        source: "marketplace",
        profile: null,
      });
    }

    const clientData = clientMap.get(booking.client_id);
    clientData.sessionCount++;

    // Update last session info
    if (
      !clientData.lastSession ||
      new Date(booking.start_time) > new Date(clientData.lastSession)
    ) {
      clientData.lastSession = booking.start_time;
      clientData.lastSessionId = booking.$id;
    }
  }

  // 4. Fetch Profiles for everyone
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
        return null; // Handle deleted users
      }
    })
  );

  return enrichedClients.filter(Boolean);
}

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

export async function getClientFullProfile(clientId) {
  const { databases } = await createAdminClient();
  const session = await createSessionClient();
  const therapist = await session.account.get();

  try {
    const userProfile = await databases.getDocument(
      DB_ID,
      USERS_COLLECTION,
      clientId
    );

    const records = await databases.listDocuments(
      DB_ID,
      CLIENT_RECORDS_COLLECTION,
      [
        Query.equal("therapist_id", therapist.$id),
        Query.equal("client_id", clientId),
        Query.limit(1),
      ]
    );

    let clientRecord = records.documents[0];

    if (!clientRecord) {
      clientRecord = await databases.createDocument(
        DB_ID,
        CLIENT_RECORDS_COLLECTION,
        ID.unique(),
        {
          therapist_id: therapist.$id,
          client_id: clientId,
          risk_status: "stable",
          source: "marketplace",
        }
      );
    }

    const now = new Date().toISOString();
    const upcoming = await databases.listDocuments(DB_ID, BOOKINGS_COLLECTION, [
      Query.equal("therapist_id", therapist.$id),
      Query.equal("client_id", clientId),
      Query.greaterThan("start_time", now),
      Query.orderAsc("start_time"),
      Query.limit(1),
    ]);

    let avatarUrl = null;
    if (userProfile.avatar_id) {
      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
      avatarUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${userProfile.avatar_id}/view?project=${projectId}`;
    }

    return {
      profile: { ...userProfile, avatarUrl },
      record: clientRecord,
      nextBooking: upcoming.documents[0] || null,
    };
  } catch (error) {
    console.error("Get Client Profile Error:", error);
    return null;
  }
}

export async function updateClientRisk(recordId, status) {
  const { databases } = await createAdminClient();
  try {
    await databases.updateDocument(DB_ID, CLIENT_RECORDS_COLLECTION, recordId, {
      risk_status: status,
    });
    revalidatePath("/therapist/client");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function updateClinicalRecord(recordId, formData) {
  const { databases } = await createAdminClient();

  try {
    await databases.updateDocument(DB_ID, CLIENT_RECORDS_COLLECTION, recordId, {
      presenting_problem: formData.get("presentingProblem"),
      medications: formData.get("medications"),
      emergency_contact: formData.get("emergencyContact"),
      homework_list: formData.get("homeworkList"),
    });
    revalidatePath("/therapist/client");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getClientHistory(clientId) {
  const { databases } = await createAdminClient();
  const session = await createSessionClient();
  const therapist = await session.account.get();

  const bookings = await databases.listDocuments(DB_ID, BOOKINGS_COLLECTION, [
    Query.equal("therapist_id", therapist.$id),
    Query.equal("client_id", clientId),
    Query.orderDesc("start_time"),
  ]);

  return bookings.documents;
}

export async function updateSessionNote(bookingId, type, content) {
  const { databases } = await createAdminClient();

  try {
    const updateData = {};
    updateData[type] = content;

    await databases.updateDocument(
      DB_ID,
      BOOKINGS_COLLECTION,
      bookingId,
      updateData
    );
    revalidatePath("/therapist/client");
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getClientDocuments(clientId) {
  return [];
}

export async function createOfflineClient(formData) {
  const { databases } = await createAdminClient();
  const session = await createSessionClient();
  const therapist = await session.account.get();

  const name = formData.get("name");
  const phone = formData.get("phone");
  const email = formData.get("email");

  const ghostId = ID.unique();

  try {
    await databases.createDocument(DB_ID, USERS_COLLECTION, ghostId, {
      user_id: ghostId,
      full_name: name,
      phone_number: phone,
      // Removed 'email' to match database schema
      role: "client",
      is_verified: false,
    });

    await databases.createDocument(
      DB_ID,
      CLIENT_RECORDS_COLLECTION,
      ID.unique(),
      {
        therapist_id: therapist.$id,
        client_id: ghostId,
        risk_status: "stable",
        source: "offline",
      }
    );

    revalidatePath("/therapist/clients");
    return { success: true };
  } catch (error) {
    console.error("Create Offline Client Error:", error);
    return { error: error.message };
  }
}

export async function createManualSession(formData) {
  const { databases } = await createAdminClient();
  const session = await createSessionClient();
  const therapist = await session.account.get();

  const clientId = formData.get("clientId");
  const date = formData.get("date");
  const time = formData.get("time");
  const mode = formData.get("mode"); // 'online' or 'offline'
  const notes = formData.get("notes"); // Optional initial note

  const startDateTime = new Date(`${date}T${time}`);
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default 60 mins

  try {
    await databases.createDocument(DB_ID, BOOKINGS_COLLECTION, ID.unique(), {
      client_id: clientId,
      therapist_id: therapist.$id,
      service_rate_id: "manual-entry", // Placeholder for manual records
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      status: "confirmed", // Auto-confirm manual entries
      mode: mode,
      payment_id: "offline_log",
      otp_code: "0000", // Not needed for historical data
      private_note: notes || "", // Pre-fill note if provided
    });

    revalidatePath(`/therapist/client/${clientId}`);
    return { success: true };
  } catch (error) {
    console.error("Manual Session Error:", error);
    return { error: error.message };
  }
}
