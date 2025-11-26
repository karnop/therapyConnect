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
  description: "Find your peace. Connect with top therapists in Delhi NCR.",
};

export default async function RootLayout({ children }) {
  // Fetch user session server-side to pass to Navbar
  let user = null;
  try {
    const { account } = await createSessionClient();
    user = await account.get();
  } catch (error) {
    // User is not logged in, leave user as null
  }

  return (
    <html lang="en">
      <body
        className={`${manrope.variable} font-sans antialiased bg-background text-primary`}
      >
        <Navbar user={user} />
        <main className="min-h-screen pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
