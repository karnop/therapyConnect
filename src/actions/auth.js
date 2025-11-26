"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const DB_ID = "therapy_connect_db";
const USERS_COLLECTION_ID = "users";

export async function signup(formData) {
  const rawEmail = formData.get("email");
  const email = rawEmail ? rawEmail.toString().trim() : "";
  const password = formData.get("password");
  const fullName = formData.get("fullName");
  const phone = formData.get("phone");

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
    console.log("Signup Error : ", error);
    return { error: error.message };
  }

  redirect("/");
}

export async function login(formdata) {
  const email = formdata.get("email");
  const password = formdata.get("password");

  const { account } = await createAdminClient();

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

  redirect("/dashboard");
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
