import { getTherapistDashboardData } from "@/actions/dashboard";
import { format, parseISO, isToday } from "date-fns";
import {
  Calendar,
  Video,
  MapPin,
  Sparkles,
  Users,
  ArrowRight,
  AlertCircle,
  Clock,
  ChevronRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import {
  formatTimeIST,
  formatDateIST,
  isTodayIST,
  getGreetingIST,
} from "@/lib/date";

export default async function TherapistDashboard() {
  const data = await getTherapistDashboardData();

  // Guard against null data if fetch fails completely
  if (!data)
    return <div className="p-10 text-center">Loading Dashboard...</div>;

  const {
    requests = [],
    upcoming = [],
    stats = {},
    therapistProfile = {},
  } = data;

  const nextSession = upcoming[0];
  const otherSessions = upcoming.slice(1);
  const firstName = therapistProfile?.full_name?.split(" ")[0] || "Doctor";
  // Safe date formatting
  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="pb-20">
      {/* 1. WELCOME HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
            {todayDate}
          </p>
          <h1 className="text-3xl font-bold text-gray-900">
            Good {getGreetingIST()}, {firstName}
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm text-xs font-bold text-gray-600 uppercase tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Practice Online
        </div>
      </div>

      {/* 2. NOTIFICATIONS */}
      {requests.length > 0 && (
        <Link href="/therapist/requests">
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-xl flex items-center justify-between mb-10 cursor-pointer hover:bg-orange-100 transition-all shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-lg shadow-sm text-orange-600">
                <AlertCircle size={20} />
              </div>
              <div>
                <span className="font-bold text-gray-900 block text-sm">
                  Pending Requests
                </span>
                <span className="text-gray-600 text-xs">
                  You have {requests.length} client request
                  {requests.length > 1 ? "s" : ""} waiting for approval.
                </span>
              </div>
            </div>
            <ArrowRight size={18} className="text-orange-400" />
          </div>
        </Link>
      )}

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* --- LEFT: MAIN SCHEDULE --- */}
        <div className="lg:col-span-2 space-y-8">
          {/* UP NEXT: PRO CARD */}
          {nextSession ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <Clock size={14} className="text-secondary" />
                  {isTodayIST(nextSession.start_time)
                    ? "Happening Today"
                    : "Next Session"}
                </h3>
                <span className="text-gray-900 font-mono font-bold">
                  {formatTimeIST(nextSession.start_time)}
                </span>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Client Profile */}
                  <div className="flex-1">
                    <div className="flex items-start gap-5 mb-6">
                      <div className="w-16 h-16 bg-[#2D2D2D] rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                        {/* SAFE CHECK: client might be null if user deleted */}
                        {nextSession.client?.full_name?.[0] || "?"}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {nextSession.client?.full_name || "Unknown Client"}
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-medium uppercase tracking-wide ${nextSession.mode === "online" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"}`}
                          >
                            {nextSession.mode}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 font-medium">
                            60 Min Session
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Dossier Snapshot */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          Mood Score
                        </span>
                        <div className="flex items-end gap-2 mt-1">
                          <span className="text-xl font-bold text-gray-900">
                            {nextSession.client_mood || "-"}
                            <span className="text-sm text-gray-400">/10</span>
                          </span>
                          {nextSession.client_mood && (
                            <div
                              className={`h-1.5 flex-1 rounded-full mb-1.5 ${nextSession.client_mood < 5 ? "bg-red-200" : "bg-green-200"}`}
                            >
                              <div
                                className={`h-full rounded-full ${nextSession.client_mood < 5 ? "bg-red-500" : "bg-green-500"}`}
                                style={{
                                  width: `${nextSession.client_mood * 10}%`,
                                }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">
                          Focus Area
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-1 truncate">
                          {nextSession.client_intake || "General Check-in"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="w-full md:w-48 shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-100 md:pl-8 pt-6 md:pt-0">
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Actions
                      </p>
                      {nextSession.mode === "online" ? (
                        <a
                          href={therapistProfile.meeting_link || "#"}
                          target="_blank"
                          className="w-full bg-[#2D2D2D] text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          <Video size={16} /> Join Room
                        </a>
                      ) : (
                        <div className="w-full bg-gray-100 text-gray-500 px-4 py-3 rounded-xl font-bold text-sm text-center border border-gray-200">
                          Wait for Arrival
                        </div>
                      )}
                      <Link href={`/therapist/session/${nextSession.$id}`}>
                        <button className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2">
                          <Activity size={16} /> Full Dossier
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Schedule Clear
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                No immediate upcoming sessions.
              </p>
              <Link
                href="/therapist/schedule"
                className="inline-block mt-4 text-sm font-bold text-secondary hover:underline"
              >
                Manage Availability
              </Link>
            </div>
          )}

          {/* UPCOMING AGENDA */}
          {otherSessions.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm uppercase tracking-wide">
                Agenda
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                  {otherSessions.length}
                </span>
              </h3>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100">
                {otherSessions.map((session) => (
                  <Link
                    href={`/therapist/session/${session.$id}`}
                    key={session.$id}
                    className="block group hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="flex flex-col items-center min-w-[50px]">
                          <span className="text-xs font-bold text-gray-400 uppercase">
                            {formatDateIST(session.start_time, "month")}
                          </span>
                          <span className="text-xl font-bold text-gray-900">
                            {formatDateIST(session.start_time, "day")}
                          </span>
                        </div>
                        <div className="w-px h-10 bg-gray-200"></div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm group-hover:text-secondary transition-colors">
                            {session.client?.full_name || "Unknown Client"}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />{" "}
                              {formatTimeIST(session.start_time)}
                            </span>
                            <span className="capitalize">• {session.mode}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {session.is_shared && (
                          <span className="bg-yellow-50 text-yellow-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <Sparkles size={10} /> PREP
                          </span>
                        )}
                        <ChevronRight
                          size={18}
                          className="text-gray-300 group-hover:text-secondary transition-colors"
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- RIGHT: ANALYTICS WIDGETS --- */}
        <div className="lg:col-span-1 space-y-6">
          {/* Activity Card */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                <Activity size={16} /> Activity
              </div>
              <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-md">
                MTD
              </span>
            </div>

            <div className="mb-2">
              <p className="text-5xl font-bold text-gray-900 tracking-tight">
                {stats?.sessions || 0}
              </p>
              <p className="text-sm font-medium text-gray-400 mt-2">
                Total sessions this month
              </p>
            </div>
          </div>

          {/* Practice Overview */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Users size={16} className="text-gray-400" /> Practice Info
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium">
                    Current Rate
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    ₹{stats?.price_per_session || 0}
                  </span>
                </div>
                <Link
                  href="/therapist/settings"
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  Edit
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <Link href="/therapist/settings">
                <button className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                  Manage Profile
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
