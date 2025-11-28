import { getTherapistDashboardData } from "@/actions/dashboard";
import { format, parseISO } from "date-fns";
import {
  Calendar,
  Video,
  MapPin,
  Sparkles,
  TrendingUp,
  Users,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default async function TherapistDashboard() {
  const { requests, upcoming, stats, therapistProfile } =
    await getTherapistDashboardData();

  const nextSession = upcoming[0];
  const otherSessions = upcoming.slice(1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Overview</h1>
        <p className="text-gray-500">Welcome back, Dr.</p>
      </div>

      {requests.length > 0 && (
        <Link href="/therapist/requests">
          <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center justify-between mb-8 cursor-pointer hover:bg-orange-100/50 transition-colors group">
            <div className="flex items-center gap-3 text-orange-800">
              <AlertCircle size={20} />
              <span className="font-semibold">
                You have {requests.length} pending booking requests.
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-orange-700 group-hover:gap-2 transition-all">
              Review Now <ArrowRight size={16} />
            </div>
          </div>
        </Link>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* UP NEXT CARD */}
          {nextSession ? (
            <div className="bg-[#2D2D2D] text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <span className="bg-white/10 text-white/90 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider animate-pulse">
                    Up Next
                  </span>
                  <div className="text-right">
                    <p className="text-3xl font-bold">
                      {format(parseISO(nextSession.start_time), "h:mm a")}
                    </p>
                    <p className="text-white/60 text-sm">
                      {format(
                        parseISO(nextSession.start_time),
                        "EEEE, MMMM do"
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-2xl font-bold">
                    {nextSession.client?.full_name?.[0] || "C"}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {nextSession.client?.full_name || "Client"}
                    </h2>
                    <p className="text-white/60 flex items-center gap-2 text-sm mt-1">
                      {nextSession.mode === "online" ? (
                        <Video size={14} />
                      ) : (
                        <MapPin size={14} />
                      )}
                      {nextSession.mode === "online"
                        ? "Online Session"
                        : "In-Person Visit"}
                    </p>
                  </div>
                </div>

                {/* CLIENT PREP (Conditional) */}
                {nextSession.is_shared && (
                  <div className="bg-white/10 p-4 rounded-xl border border-white/10 mb-6">
                    <div className="flex items-center gap-2 text-yellow-300 font-bold text-xs uppercase tracking-wider mb-2">
                      <Sparkles size={12} /> Client Prep Shared
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {nextSession.client_mood && (
                        <div>
                          <span className="text-white/50 block text-xs">
                            Mood Score
                          </span>
                          <span className="font-medium">
                            {nextSession.client_mood}/10
                          </span>
                        </div>
                      )}
                      {nextSession.client_intake && (
                        <div>
                          <span className="text-white/50 block text-xs">
                            Focus
                          </span>
                          <span className="font-medium truncate">
                            {nextSession.client_intake}
                          </span>
                        </div>
                      )}
                    </div>
                    {nextSession.client_journal && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <span className="text-white/50 block text-xs mb-1">
                          Journal Note
                        </span>
                        <p className="text-white/90 italic">
                          &apos;{nextSession.client_journal}&apos;
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {nextSession.mode === "online" ? (
                  // UPDATED: Using therapistProfile.meeting_link
                  <a
                    href={therapistProfile.meeting_link}
                    target="_blank"
                    className="bg-white text-primary px-6 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 w-full"
                  >
                    <Video size={20} /> Start Video Session
                  </a>
                ) : (
                  <div className="bg-white/10 p-4 rounded-xl text-center text-sm text-white/80">
                    Client scheduled to arrive at clinic.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                No Upcoming Sessions
              </h3>
              <p className="text-gray-500">Your schedule is clear for now.</p>
            </div>
          )}

          {/* Upcoming List */}
          {otherSessions.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-800 mb-4 text-lg">
                Upcoming Queue
              </h3>
              <div className="space-y-3">
                {otherSessions.map((session) => (
                  <Link
                    href={`/therapist/session/${session.$id}`}
                    key={session.$id}
                  >
                    <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:shadow-md transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center font-bold text-gray-500">
                          {session.client?.full_name?.[0]}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {session.client?.full_name}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-2">
                            <Calendar size={12} />{" "}
                            {format(
                              parseISO(session.start_time),
                              "MMM d, h:mm a"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-md font-medium ${
                            session.mode === "online"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-orange-50 text-orange-600"
                          }`}
                        >
                          {session.mode}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- RIGHT: FINANCIAL STATS --- */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-secondary/5 to-secondary/10 p-6 rounded-[2rem] border border-secondary/10">
            <h3 className="font-bold text-secondary mb-2">Earnings (MTD)</h3>
            <p className="text-4xl font-bold text-primary">
              ₹{stats.earnings.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-2 font-medium">
              Based on {stats.sessions} confirmed sessions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={18} className="text-gray-400" /> Practice Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Confirmed Sessions</span>
                <span className="font-bold">{stats.sessions}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Rate / Session</span>
                <span className="font-bold">₹{stats.price_per_session}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
