import { getTherapistDashboardData } from "@/actions/dashboard";
import { getDashboardGoogleEvents } from "@/actions/integrations";
import { parseISO, differenceInMinutes } from "date-fns";
import {
  Calendar as CalendarIcon,
  Video,
  MapPin,
  Sparkles,
  Users,
  ArrowRight,
  AlertCircle,
  Clock,
  ChevronRight,
  Activity,
  ExternalLink,
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
  if (!data) return <div className="p-10 text-center">Loading...</div>;

  const {
    requests = [],
    upcoming = [],
    stats = {},
    therapistProfile = {},
  } = data;

  // 1. FETCH GOOGLE EVENTS
  const rawGoogleEvents = await getDashboardGoogleEvents();

  // 2. FORMAT GOOGLE EVENTS
  const formattedGoogleEvents = rawGoogleEvents
    .map((ge) => ({
      $id: ge.id,
      isGoogle: true,
      start_time: ge.start?.dateTime || ge.start?.date,
      end_time: ge.end?.dateTime || ge.end?.date,
      client: { full_name: ge.summary || "Busy (Google Calendar)" },
      mode: "Google Event",
    }))
    .filter((ge) => ge.start_time);

  // 3. THE MAGIC: MERGE AND SORT EVERYTHING CHRONOLOGICALLY
  const allAgendaItems = [...upcoming, ...formattedGoogleEvents].sort(
    (a, b) => new Date(a.start_time) - new Date(b.start_time),
  );

  // Now the "Next Session" could be a Google Event OR a Platform Event!
  const nextSession = allAgendaItems[0];
  const otherSessions = allAgendaItems.slice(1);

  const firstName = therapistProfile?.full_name?.split(" ")[0] || "Partner";
  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const getDuration = (start, end) => {
    if (!start || !end) return 60;
    return differenceInMinutes(parseISO(end), parseISO(start));
  };

  return (
    <div className="pb-20">
      {/* HEADER */}
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

      {/* NOTIFICATIONS */}
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
                  You have {requests.length} client requests waiting.
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
          {/* UP NEXT CARD (Dynamic UI based on source) */}
          {nextSession ? (
            nextSession.isGoogle ? (
              // --- GOOGLE EVENT UI ---
              <div className="bg-white rounded-3xl border border-blue-100 shadow-md overflow-hidden relative">
                <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                <div className="bg-blue-50/50 px-6 py-4 border-b border-blue-100 flex justify-between items-center pl-8">
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                    <CalendarIcon size={14} /> From Google Calendar
                  </h3>
                  <span className="text-blue-900 font-mono font-bold bg-white px-3 py-1 rounded-lg border border-blue-100 shadow-sm">
                    {formatTimeIST(nextSession.start_time)}
                  </span>
                </div>
                <div className="p-6 md:p-8 pl-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner border border-blue-100">
                      <ExternalLink size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {nextSession.client?.full_name}
                      </h2>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wide bg-gray-100 text-gray-600">
                          External Event
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-sm text-gray-500 font-medium">
                          {getDuration(
                            nextSession.start_time,
                            nextSession.end_time,
                          )}{" "}
                          Min Block
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // --- PLATFORM EVENT UI (Rich Data) ---
              <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden relative">
                <div className="absolute top-0 left-0 w-2 h-full bg-secondary"></div>
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center pl-8">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Clock size={14} className="text-secondary" />{" "}
                    {isTodayIST(nextSession.start_time)
                      ? "Happening Today"
                      : "Next Session"}
                  </h3>
                  <span className="text-gray-900 font-mono font-bold bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
                    {formatTimeIST(nextSession.start_time)}
                  </span>
                </div>
                <div className="p-6 md:p-8 pl-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                      <div className="flex items-start gap-5 mb-6">
                        <div className="w-16 h-16 bg-[#2D2D2D] rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                          {nextSession.client?.full_name?.[0] || "?"}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {nextSession.client?.full_name || "Unknown"}
                          </h2>
                          <div className="flex items-center gap-3 mt-2">
                            <span
                              className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wide ${nextSession.mode === "online" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"}`}
                            >
                              {nextSession.mode}
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-sm text-gray-500 font-medium">
                              {getDuration(
                                nextSession.start_time,
                                nextSession.end_time,
                              )}{" "}
                              Min Session
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Mood Score
                          </span>
                          <div className="flex items-end gap-2 mt-2">
                            <span className="text-2xl font-bold text-gray-900 leading-none">
                              {nextSession.client_mood || "-"}
                              <span className="text-sm text-gray-400">/10</span>
                            </span>
                            {nextSession.client_mood && (
                              <div
                                className={`h-1.5 flex-1 rounded-full mb-1 ${nextSession.client_mood < 5 ? "bg-red-200" : "bg-green-200"}`}
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
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            Focus Area
                          </span>
                          <p className="text-sm font-medium text-gray-900 mt-2 truncate">
                            {nextSession.client_intake || "General Check-in"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="w-full md:w-48 shrink-0 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gray-100 md:pl-8 pt-6 md:pt-0">
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                          Actions
                        </p>
                        {nextSession.mode === "online" ? (
                          <a
                            href={therapistProfile.meeting_link || "#"}
                            target="_blank"
                            className="w-full bg-[#2D2D2D] text-white px-4 py-3.5 rounded-xl font-bold text-sm hover:bg-black transition-all shadow-md flex items-center justify-center gap-2"
                          >
                            <Video size={16} /> Join Room
                          </a>
                        ) : (
                          <div className="w-full bg-gray-100 text-gray-500 px-4 py-3.5 rounded-xl font-bold text-sm text-center border border-gray-200">
                            Wait for Arrival
                          </div>
                        )}
                        <Link href={`/therapist/session/${nextSession.$id}`}>
                          <button className="w-full bg-white border border-gray-200 text-gray-700 px-4 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2">
                            <Activity size={16} /> Full Dossier
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-gray-200 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Schedule Clear
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                No upcoming sessions or Google events.
              </p>
              <Link
                href="/therapist/schedule"
                className="inline-block mt-4 text-sm font-bold text-secondary hover:underline"
              >
                Manage Availability
              </Link>
            </div>
          )}

          {/* COMBINED AGENDA LIST */}
          {otherSessions.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm uppercase tracking-wide">
                Upcoming Timeline
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">
                  {otherSessions.length}
                </span>
              </h3>
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm divide-y divide-gray-100 overflow-hidden">
                {otherSessions.map((session, idx) => (
                  <div
                    key={session.$id || idx}
                    className={`block transition-colors ${session.isGoogle ? "hover:bg-blue-50/30" : "hover:bg-gray-50 group"}`}
                  >
                    <div className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        {/* Date Box */}
                        <div
                          className={`flex flex-col items-center min-w-[55px] p-2 rounded-xl ${session.isGoogle ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-700"}`}
                        >
                          <span className="text-[10px] font-bold uppercase opacity-70">
                            {formatDateIST(session.start_time, "month")}
                          </span>
                          <span className="text-xl font-black leading-none mt-0.5">
                            {formatDateIST(session.start_time, "day")}
                          </span>
                        </div>

                        <div>
                          <p
                            className={`font-bold text-sm truncate max-w-[200px] md:max-w-xs ${session.isGoogle ? "text-gray-700" : "text-gray-900 group-hover:text-secondary transition-colors"}`}
                          >
                            {session.client?.full_name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1.5">
                            <span className="flex items-center gap-1 font-medium text-gray-700">
                              <Clock size={12} />{" "}
                              {formatTimeIST(session.start_time)}
                            </span>
                            <span className="text-gray-300">•</span>

                            {session.isGoogle ? (
                              <span className="text-blue-600 font-bold flex items-center gap-1 uppercase tracking-wider text-[10px]">
                                <CalendarIcon size={10} /> Google
                              </span>
                            ) : (
                              <span className="text-gray-500 font-medium flex items-center gap-1 uppercase tracking-wider text-[10px]">
                                {getDuration(
                                  session.start_time,
                                  session.end_time,
                                )}
                                m Platform
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {!session.isGoogle && session.is_shared && (
                          <span className="hidden md:flex bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold items-center gap-1">
                            <Sparkles size={10} /> Prep Ready
                          </span>
                        )}
                        {!session.isGoogle && (
                          <Link href={`/therapist/session/${session.$id}`}>
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-all text-gray-400">
                              <ChevronRight size={18} />
                            </div>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- RIGHT: ANALYTICS WIDGETS --- */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <div className="flex items-center justify-between mb-6 relative">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider">
                <Activity size={16} /> Activity
              </div>
              <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-md uppercase tracking-wider">
                This Month
              </span>
            </div>
            <div className="mb-2 relative">
              <p className="text-6xl font-black text-gray-900 tracking-tighter">
                {stats?.sessions || 0}
              </p>
              <p className="text-sm font-medium text-gray-500 mt-2">
                Platform sessions completed
              </p>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
              <Users size={16} className="text-gray-400" /> Practice Info
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">
                    Standard Rate
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    ₹{stats?.price_per_session || 0}
                  </span>
                </div>
                <Link
                  href="/therapist/settings"
                  className="text-xs font-bold text-secondary bg-secondary/10 px-3 py-1.5 rounded-lg hover:bg-secondary/20 transition-colors"
                >
                  Edit
                </Link>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <Link href="/therapist/settings">
                <button className="w-full py-3 rounded-xl border-2 border-gray-100 text-sm font-bold text-gray-600 hover:border-gray-200 hover:bg-gray-50 transition-all">
                  Manage Profile Settings
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
