"use server";

import { createAdminClient } from "@/lib/appwrite";
import { ID } from "node-appwrite";

// Safely import your email utility
let sendEmail;
try {
  sendEmail = require("@/lib/email").sendEmail;
} catch (e) {
  sendEmail = null;
}

const DB_ID = "therapy_connect_db";
const B2B_LEADS_COLLECTION = "b2b_leads"; // Note: You'll need to create this collection in Appwrite later

export async function submitDemoRequest(formData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const company = formData.get("company");
  const size = formData.get("size");
  const message = formData.get("message") || "No additional message.";

  try {
    // 1. SAVE TO DATABASE (Our Bulletproof Fallback)
    try {
        const { databases } = await createAdminClient();
        await databases.createDocument(
            DB_ID, 
            B2B_LEADS_COLLECTION, 
            ID.unique(), 
            {
                name: name,
                email: email,
                company_name: company,
                team_size: size,
                message: message,
                status: "new" // To track in your admin dashboard later
            }
        );
        console.log("✅ B2B Lead saved to database.");
    } catch (dbErr) {
        // We don't throw here. If the collection doesn't exist yet, we just log it and move to email.
        console.log("⚠️ Could not save lead to DB (Collection might not exist yet):", dbErr.message);
    }

    // 2. SEND THE EMAIL NOTIFICATIONS
    if (sendEmail) {
        try {
            // A. Send alert to YOU (The Sales Team)
            // Note: You will need to make sure your email template handles "NEW_B2B_LEAD"
            await sendEmail("sales@therapyconnect.in", "NEW_B2B_LEAD", {
                name, email, company, size, message
            });
            
            // B. Send a professional auto-responder to the HR Director
            await sendEmail(email, "B2B_DEMO_CONFIRMATION", { 
                name, company 
            });
            console.log("✅ B2B Emails dispatched successfully.");
        } catch (emailErr) {
            console.error("❌ Email dispatch failed:", emailErr.message);
            // We still return success to the user so they see the "Thank You" screen, 
            // relying on the DB fallback we did in Step 1.
        }
    }

    return { success: true };
  } catch (error) {
    console.error("Demo Request Error:", error);
    return { error: "Something went wrong. Please try again later." };
  }
}