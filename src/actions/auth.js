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

export async function login(formdata) {
  const email = formdata.get("email");
  const password = formdata.get("password");

  const { account } = await createAdminClient();
  const redirectTo = formdata.get("redirect") || "/dashboard";

  try {
    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });
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
