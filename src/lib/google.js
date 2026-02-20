export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/oauth/callback`;

export function getGoogleAuthUrl(userId) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.append("client_id", GOOGLE_CLIENT_ID);
  url.searchParams.append("redirect_uri", REDIRECT_URI);
  url.searchParams.append("response_type", "code");
  url.searchParams.append(
    "scope",
    "https://www.googleapis.com/auth/calendar.events",
  );
  url.searchParams.append("access_type", "offline");
  url.searchParams.append("prompt", "consent");

  if (userId) url.searchParams.append("state", userId);
  return url.toString();
}

export async function exchangeCodeForTokens(code) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });
  if (!response.ok) throw new Error("Failed to exchange Google token");
  return await response.json();
}

// NEW: Refreshes token if it expired
export async function refreshGoogleToken(refreshToken) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!response.ok) throw new Error("Failed to refresh token");
  return await response.json();
}

// NEW: Pull Events
export async function getGoogleEventsList(accessToken, timeMin, timeMax) {
  const query = new URLSearchParams({
    timeMin: timeMin,
    timeMax: timeMax,
    singleEvents: "true",
    orderBy: "startTime",
  });
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${query.toString()}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  if (!response.ok) throw new Error(`Google API error: ${response.status}`);
  return await response.json();
}

// NEW: Push Event
export async function createGoogleEvent(accessToken, event) {
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    },
  );

  // CRITICAL FIX: Extract the exact error message from Google
  if (!response.ok) {
    const errorText = await response.text();
    console.error("🚫 Google API Rejected Event:", errorText);
    throw new Error(`Google API error: ${response.status} - ${errorText}`);
  }

  return await response.json();
}
