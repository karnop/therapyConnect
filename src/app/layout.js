import { Manrope } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createSessionClient } from "@/lib/appwrite";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "TherapyConnect",
  description: "Find your peace. Connect with top therapists in India.",
};

export default async function RootLayout({ children }) {
  // Fetch user session AND database profile to get the Role
  let user = null;

  try {
    const { account, databases } = await createSessionClient();
    const sessionUser = await account.get();

    // Fetch the detailed profile from DB to know if client/therapist/admin
    // We wrap this in a sub-try in case the DB document hasn't been created yet
    try {
      const profile = await databases.getDocument(
        "therapy_connect_db",
        "users",
        sessionUser.$id,
      );
      // Merge auth data with profile data
      user = {
        ...sessionUser,
        role: profile.role,
        full_name: profile.full_name,
      };
    } catch (dbError) {
      // Fallback: If DB fetch fails, assume client or incomplete setup
      user = { ...sessionUser, role: "client" };
    }
  } catch (error) {
    // User is not logged in
    user = null;
  }

  return (
    <html lang="en">
      <body
        className={`${manrope.variable} font-sans antialiased bg-background text-primary`}
      >
        <Navbar user={user} />
        <main className="min-h-screen md:pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
