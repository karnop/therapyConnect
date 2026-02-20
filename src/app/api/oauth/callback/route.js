import { NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google";
import { createAdminClient } from "@/lib/appwrite";

const DB_ID = "therapy_connect_db";
const USERS_COLLECTION = "users";

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const userId = searchParams.get("state");

  // Create the base redirect URL
  const redirectUrl = new URL(request.url);
  redirectUrl.pathname = "/therapist/settings";

  if (error || !code || !userId) {
    redirectUrl.searchParams.set("google_error", "missing_params");
  } else {
    try {
      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(code);
      const { databases } = await createAdminClient();

      const updateData = { google_access_token: tokens.access_token };
      if (tokens.refresh_token) {
        updateData.google_refresh_token = tokens.refresh_token;
      }

      // Save tokens directly to DB
      await databases.updateDocument(
        DB_ID,
        USERS_COLLECTION,
        userId,
        updateData,
      );
      redirectUrl.searchParams.set("google_success", "true");
    } catch (err) {
      console.error("Google OAuth Error:", err);
      redirectUrl.searchParams.set("google_error", "server_error");
    }
  }

  // CRITICAL FIX: We return an HTML page that runs a JavaScript redirect.
  // This entirely bypasses the "Cross-Site Cookie Block" that was logging you out!
  return new NextResponse(
    `
        <!DOCTYPE html>
        <html>
            <head><title>Connecting to Google...</title></head>
            <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f9fafb;">
                <div style="text-align: center;">
                    <h2 style="color: #374151;">Connecting your calendar...</h2>
                    <p style="color: #6b7280; font-size: 14px;">Please wait a moment.</p>
                    <script>
                        // Execute client-side redirect to preserve cookies
                        window.location.href = "${redirectUrl.toString()}";
                    </script>
                </div>
            </body>
        </html>
    `,
    {
      headers: { "Content-Type": "text/html" },
    },
  );
}
