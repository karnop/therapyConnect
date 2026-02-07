"use server";

import { createAdminClient } from "@/lib/appwrite";
import { Query } from "node-appwrite";

const DB_ID = "therapy_connect_db";
const BOOKINGS_COLLECTION = "bookings";
const SLOTS_COLLECTION = "slots";
const USERS_COLLECTION = "users";
const RATES_COLLECTION = "service_rates";

export async function getAnalyticsData() {
  const { databases } = await createAdminClient();

  try {
    // 1. Define Timeframe (Last 30 Days)
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // 2. Fetch Data (Parallel for speed)
    // Note: Max limit is usually 5000 in Appwrite, plenty for MVP
    const [bookingsRes, slotsRes, ratesRes, therapistsRes] = await Promise.all([
      databases.listDocuments(DB_ID, BOOKINGS_COLLECTION, [
        Query.greaterThanEqual("start_time", thirtyDaysAgo.toISOString()),
        Query.limit(5000),
      ]),
      databases.listDocuments(DB_ID, SLOTS_COLLECTION, [
        Query.greaterThanEqual("start_time", thirtyDaysAgo.toISOString()),
        Query.limit(5000),
      ]),
      databases.listDocuments(DB_ID, RATES_COLLECTION, [Query.limit(5000)]),
      databases.listDocuments(DB_ID, USERS_COLLECTION, [
        Query.equal("role", "therapist"),
        Query.limit(5000),
      ]),
    ]);

    const bookings = bookingsRes.documents;
    const slots = slotsRes.documents;
    const rates = ratesRes.documents;
    const therapists = therapistsRes.documents;

    // --- CALCULATE KPI 1: GMV ---
    // Map therapist ID to their price
    const priceMap = {};
    rates.forEach((r) => {
      priceMap[r.therapist_id] = r.price_inr;
    });

    let gmv = 0;
    const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
    confirmedBookings.forEach((b) => {
      gmv += priceMap[b.therapist_id] || 2000; // Fallback to 2000 if rate missing
    });

    // --- CALCULATE KPI 2: FILL RATE ---
    // Total Slots vs Booked Slots
    const totalSlots = slots.length;
    const filledSlots = slots.filter((s) => s.is_booked).length;
    const fillRate =
      totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

    // --- CALCULATE KPI 3: GHOST RATE ---
    // Requests that were Declined vs Total Requests
    const totalRequests = bookings.length;
    const failedRequests = bookings.filter((b) =>
      ["cancelled", "declined"].includes(b.status),
    ).length;
    const ghostRate =
      totalRequests > 0
        ? Math.round((failedRequests / totalRequests) * 100)
        : 0;

    // --- CALCULATE KPI 4: REPEAT RATE ---
    const clientCounts = {};
    bookings.forEach((b) => {
      clientCounts[b.client_id] = (clientCounts[b.client_id] || 0) + 1;
    });
    const totalClients = Object.keys(clientCounts).length;
    const returningClients = Object.values(clientCounts).filter(
      (count) => count > 1,
    ).length;
    const repeatRate =
      totalClients > 0
        ? Math.round((returningClients / totalClients) * 100)
        : 0;

    // --- DATA FOR GRAPHS ---

    // A. Growth Chart (Last 30 Days Line)
    const dailyStats = {}; // { "Oct 1": { confirmed: 2, requests: 5 } }

    // Initialize map for all days
    for (
      let d = new Date(thirtyDaysAgo);
      d <= now;
      d.setDate(d.getDate() + 1)
    ) {
      const key = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      dailyStats[key] = { name: key, confirmed: 0, all: 0 };
    }

    bookings.forEach((b) => {
      const dateKey = new Date(b.start_time).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (dailyStats[dateKey]) {
        dailyStats[dateKey].all += 1;
        if (b.status === "confirmed") dailyStats[dateKey].confirmed += 1;
      }
    });
    const growthData = Object.values(dailyStats);

    // B. Vibe Split (Pie)
    const onlineCount = bookings.filter((b) => b.mode === "online").length;
    const offlineCount = bookings.filter((b) => b.mode === "offline").length;
    const pieData = [
      { name: "Online Video", value: onlineCount, fill: "#3b82f6" }, // Blue
      { name: "In-Person", value: offlineCount, fill: "#f97316" }, // Orange
    ];

    // C. Peak Hours (Bar)
    const hourCounts = Array(24)
      .fill(0)
      .map((_, i) => ({ hour: i, count: 0 }));
    bookings.forEach((b) => {
      const h = new Date(b.start_time).getHours();
      if (hourCounts[h]) hourCounts[h].count += 1;
    });
    // Filter to business hours (8 AM - 9 PM) for cleaner chart
    const heatData = hourCounts
      .filter((h) => h.hour >= 8 && h.hour <= 21)
      .map((h) => ({
        name: `${h.hour}:00`,
        sessions: h.count,
      }));

    // --- ACTIONABLE LISTS ---
    // "At Risk" Therapists (Zero bookings in 30 days)
    const activeTherapistIds = new Set(bookings.map((b) => b.therapist_id));
    const atRiskTherapists = therapists
      .filter((t) => !activeTherapistIds.has(t.$id))
      .map((t) => ({ id: t.$id, name: t.full_name, phone: t.phone_number }));

    return {
      kpi: { gmv, fillRate, ghostRate, repeatRate },
      graphs: { growth: growthData, pie: pieData, heat: heatData },
      lists: { atRiskTherapists },
    };
  } catch (error) {
    console.error("Analytics Error:", error);
    return null;
  }
}
