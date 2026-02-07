import { createSessionClient } from "@/lib/appwrite";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

async function checkAdmin() {
  try {
    const { account, databases } = await createSessionClient();
    const user = await account.get();

    // Fetch DB Profile to check Role
    const profile = await databases.getDocument(
      "therapy_connect_db",
      "users",
      user.$id,
    );

    if (profile.role !== "admin") {
      return null;
    }
    return profile;
  } catch (error) {
    return null;
  }
}

export default async function AdminLayout({ children }) {
  const adminProfile = await checkAdmin();

  if (!adminProfile) {
    redirect("/dashboard"); // Unauthorized -> Go to normal dashboard
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex font-sans text-slate-800">
      <AdminNav user={adminProfile} />

      <main className="flex-1 md:ml-64 p-6 md:p-10 pt-20 md:pt-10 transition-all">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
