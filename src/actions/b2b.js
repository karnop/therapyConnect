"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";
import natural from "natural";

// Safely import your email utility
let sendEmail;
try {
  sendEmail = require("@/lib/email").sendEmail;
} catch (e) {
  sendEmail = null;
}

const DB_ID = process.env.NEXT_PUBLIC_DB_ID || "therapy_connect_db";
const B2B_LEADS_COLLECTION = "b2b_leads";
const COMPANIES_COLLECTION = "companies";
const USERS_COLLECTION = process.env.NEXT_PUBLIC_USERS_COLLECTION_ID || "users";
const REVIEWS_COLLECTION = "employee_reviews";

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

// 1. Validate Access Code (Called during employee registration)
export async function validateAccessCode(code) {
  const { databases } = await createAdminClient();

  try {
    const list = await databases.listDocuments(DB_ID, COMPANIES_COLLECTION, [
      Query.equal("access_code", code),
      Query.limit(1),
    ]);

    if (list.documents.length === 0) {
      return { error: "Invalid access code" };
    }

    const company = list.documents[0];
    if (!company.is_active) {
      return { error: "Company account is not active" };
    }

    return { 
      success: true, 
      companyId: company.$id,
      companyName: company.name,
      tier: company.tier
    };
  } catch (error) {
    console.error("Access Code Validation Error:", error);
    return { error: "An error occurred while validating code." };
  }
}

// 2. Fetch Corporate Therapists
export async function getCorporateTherapists() {
  const { databases } = await createAdminClient();

  try {
    const list = await databases.listDocuments(DB_ID, USERS_COLLECTION, [
      Query.equal("role", "therapist"),
      Query.equal("opts_in_corporate", true),
      Query.orderDesc("$createdAt"),
      Query.limit(50), // Fetching up to 50 for now
    ]);

    return { success: true, therapists: list.documents };
  } catch (error) {
    console.error("Fetch Corporate Therapists Error:", error);
    return { error: "Could not fetch corporate therapists." };
  }
}

// 3. Submit Anonymous Burnout Log (HIPAA compliant: no user_id)
export async function submitBurnoutLog(companyId, moodScore, burnoutScore, reviewText) {
  const { databases } = await createAdminClient();

  try {
    // Only storing company identifier and scores, completely anonymized.
    await databases.createDocument(DB_ID, REVIEWS_COLLECTION, ID.unique(), {
      company_id: companyId,
      mood_score: moodScore,
      burnout_score: burnoutScore,
      review_text: reviewText
    });

    return { success: true };
  } catch (error) {
    console.error("Submit Burnout Log Error:", error);
    return { error: "Failed to submit log." };
  }
}

// 4. Get HR Dashboard Stats & TF-IDF Word Cloud
export async function getHRDashboardStats(companyId) {
  const { databases } = await createAdminClient();

  try {
    // A. Fetch Company Details
    const company = await databases.getDocument(DB_ID, COMPANIES_COLLECTION, companyId);
    
    // B. Fetch Anonymous Reviews for this company
    const reviewsList = await databases.listDocuments(DB_ID, REVIEWS_COLLECTION, [
      Query.equal("company_id", companyId),
      Query.orderDesc("$createdAt"), // newest first
      Query.limit(200) // limit for processing
    ]);

    const reviews = reviewsList.documents;
    
    // Calculate Averages
    let totalMood = 0;
    let totalBurnout = 0;
    const documentsText = [];

    reviews.forEach(review => {
      totalMood += review.mood_score || 0;
      totalBurnout += review.burnout_score || 0;
      if (review.review_text) {
        documentsText.push(review.review_text);
      }
    });

    const averageMood = reviews.length > 0 ? (totalMood / reviews.length).toFixed(1) : 0;
    const averageBurnout = reviews.length > 0 ? (totalBurnout / reviews.length).toFixed(1) : 0;

    // C. TF-IDF Calculation for Word Cloud
    const tfidf = new natural.TfIdf();
    documentsText.forEach(doc => tfidf.addDocument(doc));

    const wordScores = {};

    // Get scores for all words across all documents
    documentsText.forEach((doc, index) => {
      const items = tfidf.listTerms(index);
      items.forEach(item => {
        // Filter out stop words typically handled by natural, but just to be safe
        if (item.term.length > 3) {
          if (!wordScores[item.term]) {
             wordScores[item.term] = 0;
          }
          wordScores[item.term] += item.tfidf;
        }
      });
    });

    // Sort to get top 15 words
    const topWords = Object.entries(wordScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(entry => ({ text: entry[0], value: Math.round(entry[1] * 10) }));

    return {
      success: true,
      stats: {
        companyName: company.name,
        tier: company.tier,
        usedPoolSessions: parseInt(company.used_pool_sessions || "0"),
        totalPoolSessions: parseInt(company.total_pool_sessions || "0"),
        averageMood,
        averageBurnout,
        totalReviews: reviews.length,
        wordCloud: topWords
      }
    };

  } catch (error) {
    console.error("HR Stats Error:", error);
    return { error: "Failed to load HR dashboard stats" };
  }
}

// 5. Get Current Logged In Profile
export async function getCurrentUserProfile() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();
    
    const { databases } = await createAdminClient();
    const profile = await databases.getDocument(DB_ID, USERS_COLLECTION, user.$id);
    
    let tier = null;
    let companyName = null;
    
    if (profile.company_id) {
       try {
         const company = await databases.getDocument(DB_ID, COMPANIES_COLLECTION, profile.company_id);
         tier = company.tier;
         companyName = company.name;
       } catch (e) {}
    }
    
    return { success: true, profile, tier, companyName };
  } catch (error) {
    return { error: error.message };
  }
}