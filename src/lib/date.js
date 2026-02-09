// Utility to enforce IST (Asia/Kolkata) formatting everywhere

export function formatTimeIST(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateIST(isoString, type = "short") {
  if (!isoString) return "";

  const options = {
    timeZone: "Asia/Kolkata",
  };

  if (type === "short") {
    // e.g. "Mon, Dec 12"
    options.weekday = "short";
    options.month = "short";
    options.day = "numeric";
  } else if (type === "long") {
    // e.g. "Monday, December 12th"
    options.weekday = "long";
    options.month = "long";
    options.day = "numeric";
  } else if (type === "month") {
    // e.g. "MMM"
    options.month = "short";
  } else if (type === "day") {
    // e.g. "12"
    options.day = "numeric";
  }

  return new Date(isoString).toLocaleDateString("en-US", options);
}

export function isTodayIST(isoString) {
  if (!isoString) return false;
  const date = new Date(isoString);
  const now = new Date();

  // Compare date strings in IST
  const dStr = date.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" });
  const nowStr = now.toLocaleDateString("en-US", { timeZone: "Asia/Kolkata" });

  return dStr === nowStr;
}

export function getGreetingIST() {
  // Get hour in IST
  const now = new Date();
  const istTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );
  const hour = istTime.getHours();

  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
}
