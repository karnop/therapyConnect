import { getClientFullProfile } from "@/actions/crm";
import ClientHeader from "@/components/crm/ClientHeader"; // Import the header
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ClientFileLayout({ children, params }) {
  const { id } = params;

  // Fetch Full "Medical File" Data
  const data = await getClientFullProfile(id);

  if (!data) return notFound();

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* 1. Breadcrumb / Back Navigation */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3">
        <Link
          href="/therapist/clients"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-secondary uppercase tracking-wider transition-colors"
        >
          <ArrowLeft size={14} /> Back to Client List
        </Link>
      </div>

      {/* 2. Sticky Header (Risk, Name, Actions) */}
      <ClientHeader data={data} />

      {/* 3. Tab Content (The Children) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
