"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const DB_ID = process.env.NEXT_PUBLIC_DB_ID;
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_USERS_COLLECTION_ID;

export async function signup(formData) {
  const rawEmail = formData.get("email");
  const email = rawEmail ? rawEmail.toString().trim() : "";
  const password = formData.get("password");
  const fullName = formData.get("fullName");
  const phone = formData.get("phone");

  const redirectTo = formData.get("redirect") || "/dashboard";
  const { account, databases } = await createAdminClient();

  try {
    // creating auth account
    const userId = ID.unique();
    await account.create(userId, email, password, fullName);

    // logging immideiately
    const session = await account.createEmailPasswordSession(email, password);

    // setting up cookie
    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    // creating user profile
    await databases.createDocument(DB_ID, USERS_COLLECTION_ID, userId, {
      user_id: userId,
      role: "client", // Default role
      full_name: fullName,
      phone_number: phone,
      is_verified: false,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    if (
      error.message.includes("email") ||
      error.type === "user_invalid_email"
    ) {
      return { error: "Invalid email address", field: "email" };
    }
    if (error.message.includes("password")) {
      return { error: error.message, field: "password" };
    }
    return { error: error.message };
  }

  redirect(redirectTo);
}

export async function login(formData) {
  const rawEmail = formData.get("email");
  const email = rawEmail ? rawEmail.toString().trim() : "";
  const password = formData.get("password");

  // Don't set a default string yet, we will determine it dynamically
  let redirectTo = formData.get("redirect");

  const { account, databases } = await createAdminClient();

  try {
    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    // --- NEW: Role-Based Redirect Logic ---
    // If there is no specific redirect intended (like /book/xyz), calculate the dashboard URL
    if (!redirectTo) {
      try {
        // Fetch the user profile to check the role
        const profile = await databases.getDocument(
          DB_ID,
          USERS_COLLECTION_ID,
          session.userId // The session object contains the userId
        );

        if (profile.role === "therapist") {
          redirectTo = "/therapist/dashboard";
        } else {
          redirectTo = "/dashboard";
        }
      } catch (e) {
        // Fallback if DB fetch fails
        redirectTo = "/dashboard";
      }
    }
  } catch (error) {
    console.error("Login Error:", error);
    return {
      error: "Invalid credentials. Please check your email or password.",
    };
  }

  redirect(redirectTo);
}

export async function logout() {
  const { account } = await createSessionClient();
  cookies().delete("appwrite-session");
  try {
    await account.deleteSession("current");
  } catch (error) {
    // Session might already be missing
  }
  redirect("/login");
}

export async function requestPasswordRecovery(formData) {
  const email = formData.get("email");
  const { account } = await createAdminClient();

  // The URL the user will be redirected to after clicking the email link
  // Appwrite appends ?userId=xyz&secret=abc to this URL automatically
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password`;

  try {
    await account.createRecovery(email, resetUrl);
    return { success: true };
  } catch (error) {
    console.error("Recovery Error:", error);
    // Security best practice: Don't reveal if email exists or not, just say success
    // But for debugging MVP, returning error is fine.
    return { error: "Failed to send recovery email. Please try again." };
  }
}

export async function resetPassword(formData) {
  const userId = formData.get("userId");
  const secret = formData.get("secret");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const { account } = await createAdminClient();

  try {
    await account.updateRecovery(userId, secret, password, password);
    return { success: true };
  } catch (error) {
    console.error("Reset Error:", error);
    return {
      error: "Failed to reset password. The link may be invalid or expired.",
    };
  }
}
