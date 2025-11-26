import { createSessionClient } from "@/lib/appwrite";
import { redirect } from "next/navigation";
import TherapistNav from "@/components/TherapistNav"; // Import the client component

// Helper to check role
async function checkTherapist() {
  try {
    const { account, databases } = await createSessionClient();
    const user = await account.get();

    // Fetch the user profile to check role
    const profile = await databases.getDocument(
      "therapy_connect_db",
      "users",
      user.$id
    );

    if (profile.role !== "therapist") {
      return false;
    }
    // Return the user profile data so we can display their name in the nav
    return profile;
  } catch (error) {
    return false;
  }
}

export default async function TherapistLayout({ children }) {
  const userProfile = await checkTherapist();

  if (!userProfile) {
    redirect("/dashboard"); // Kick them to client dashboard
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex">
      {/* 1. Navigation (Sidebar on Desktop, Bottom Bar on Mobile).
        We pass the user profile to display "Dr. Name"
      */}
      <TherapistNav user={userProfile} />

      {/* 2. Main Content Area 
        - md:ml-72: Pushes content right on desktop to clear sidebar
        - pb-24: Adds padding at bottom on mobile so content isn't hidden behind bottom bar
      */}
      <main className="flex-1 md:ml-72 p-6 md:p-12 pb-24 pt-24 md:pt-12 transition-all">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
