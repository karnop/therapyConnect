import { getMyTherapists } from "@/actions/crm";
import Image from "next/image";
import Link from "next/link";
import { User, ArrowRight, ArrowLeft } from "lucide-react";

export default async function MyTherapistsPage() {
  const therapists = await getMyTherapists();

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* NEW: Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-secondary mb-6 font-medium transition-colors"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">My Care Team</h1>
          <p className="text-gray-500 mt-1">
            Professionals you have worked with.
          </p>
        </div>

        {/* ... (Rest of the component remains identical to previous version) ... */}
        {therapists.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {therapists.map((t) => (
              <div
                key={t.id}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-16 h-16 shrink-0">
                    {t.avatarUrl ? (
                      <Image
                        src={t.avatarUrl}
                        alt={t.full_name}
                        fill
                        className="object-cover rounded-2xl"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                        <User size={24} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-primary leading-tight">
                      {t.full_name}
                    </h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mt-1">
                      {t.specialties?.[0] || "Therapist"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sessions</span>
                    <span className="font-bold">{t.sessionCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Last Visit</span>
                    <span className="font-medium text-gray-900">
                      {new Date(t.lastSession).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Link href={`/profile/${t.id}`} className="mt-auto">
                  <button className="w-full bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary hover:text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                    Book Again <ArrowRight size={16} />
                  </button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-16 rounded-3xl border border-dashed border-gray-200 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <User size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              No Therapists Yet
            </h3>
            <p className="text-gray-500 mb-6">
              You haven&apos;t booked any sessions yet.
            </p>
            <Link href="/search">
              <button className="bg-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-[#5A7A66] transition-colors">
                Find a Therapist
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
