import { getPublicProfile, getAvailableSlots } from "@/actions/public";
import BookingWidget from "@/components/BookingWidget";
import {
  MapPin,
  BadgeCheck,
  Shield,
  Video,
  GraduationCap,
  Sparkles,
  Train,
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function TherapistProfilePage({ params }) {
  const { id } = params;

  // Parallel Data Fetching
  const [profile, slots] = await Promise.all([
    getPublicProfile(id),
    getAvailableSlots(id),
  ]);

  if (!profile) return notFound();

  // Basic derivation
  const isOnline = !!profile.meeting_link;
  const firstName = profile.full_name.split(" ")[0];

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-20">
      {/* 1. Hero / Header Section */}
      <div className="bg-white border-b border-gray-200 relative overflow-hidden">
        {/* Soft decorative background gradient */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.full_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#F2F5F4] flex items-center justify-center text-5xl text-secondary/30 font-bold">
                    {firstName[0]}
                  </div>
                )}
              </div>
              {/* Verification Badge */}
              <div
                className="absolute -bottom-3 -right-3 bg-white p-2.5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100"
                title="Verified Professional"
              >
                <BadgeCheck
                  className="text-secondary fill-secondary/10"
                  size={28}
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 pt-2">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1.5 bg-[#F2F5F4] text-gray-600 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 border border-gray-200/50">
                  <Shield size={14} />
                  Verified License
                </span>
                {isOnline && (
                  <span className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 border border-blue-100">
                    <Video size={14} />
                    Accepts Online Calls
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4 tracking-tight">
                {profile.full_name}
              </h1>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-500 font-medium mb-8">
                <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200/60 shadow-sm text-sm">
                  <MapPin size={16} className="text-orange-500" />
                  <span className="text-gray-700">
                    {profile.clinic_address}
                  </span>
                </div>
                {profile.metro_station ? (
                  <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200/60 shadow-sm text-sm">
                    <Train size={16} className="text-orange-500" />
                    <span className="text-gray-700">
                      {profile.metro_station}, Delhi
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-sm">
                    <MapPin size={16} />
                    Delhi NCR
                  </div>
                )}
              </div>

              {/* Specialties Pills */}
              <div className="flex flex-wrap gap-2">
                {profile.specialties?.map((tag, i) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-full shadow-sm hover:border-secondary hover:text-secondary transition-colors cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Left Column: Bio & Details */}
          <div className="lg:col-span-2 space-y-12">
            {/* About Section */}
            <section>
              <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                About {firstName}
              </h2>
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div className="prose prose-lg prose-gray max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                  {profile.bio || (
                    <span className="text-gray-400 italic">
                      This therapist hasn't added a detailed bio yet.
                    </span>
                  )}
                </div>
              </div>
            </section>

            {/* Professional Details (Real Data Only) */}
            <section>
              <h3 className="text-lg font-bold text-primary mb-6">
                Professional Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:border-secondary/30 transition-colors">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center shrink-0 text-green-600">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">
                      Verified Professional
                    </h4>
                    <p className="text-sm text-gray-500 mt-1 leading-snug">
                      Identity and RCI credentials verified by TherapyConnect.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:border-secondary/30 transition-colors">
                  <div className="w-12 h-12 bg-[#F2F5F4] rounded-2xl flex items-center justify-center shrink-0 text-secondary">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Area of Focus</h4>
                    <p className="text-sm text-gray-500 mt-1 leading-snug">
                      Specializes in{" "}
                      {profile.specialties?.[0] || "Mental Wellness"} and{" "}
                      {profile.specialties?.[1] || "Personal Growth"}.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Safety Guarantee */}
            <div className="bg-gradient-to-br from-[#F2F5F4] to-white p-6 rounded-2xl border border-gray-100 flex gap-4 items-start">
              <div className="bg-white p-2 rounded-full shadow-sm">
                <Shield className="text-secondary shrink-0" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-primary text-sm">
                  Your privacy is our priority
                </h4>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-lg">
                  TherapyConnect ensures all your personal information and
                  session details remain 100% confidential. We verify every
                  therapist to ensure a safe environment.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Widget */}
          <div className="lg:col-span-1">
            <BookingWidget
              therapistId={id}
              price={profile.price}
              slots={slots}
              isOnline={isOnline}
              location={profile.clinic_address}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
