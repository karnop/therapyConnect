import { getTherapistDashboardData } from "@/actions/dashboard";
import { getDashboardGoogleEvents } from "@/actions/integrations";
import { parseISO, differenceInMinutes } from "date-fns";
import {
  Calendar as CalendarIcon,
  Video,
  MapPin,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Clock,
  Activity,
  Plug,
  ChevronRight,
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
  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </div>
    );

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

  // 3. MERGE AND SORT EVERYTHING CHRONOLOGICALLY
  const allAgendaItems = [...upcoming, ...formattedGoogleEvents].sort(
    (a, b) => new Date(a.start_time) - new Date(b.start_time),
  );

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
    <div className="pb-24 max-w-7xl mx-auto">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 mt-4">
        <div>
          <p className="text-secondary text-xs font-bold uppercase tracking-[0.2em] mb-2">
            {todayDate}
          </p>
          <h1 className="text-4xl font-bold text-primary tracking-tight">
            Good {getGreetingIST()}, {firstName}.
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-gray-200/50 shadow-sm w-fit">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </div>
          <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
            Accepting Sessions
          </span>
        </div>
      </div>

      {/* --- NOTIFICATIONS --- */}
      {requests.length > 0 && (
        <Link href="/therapist/requests">
          <div className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] mb-10 flex items-center justify-between hover:border-secondary/30 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                <AlertCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-primary text-sm">
                  Action Required
                </h3>
                <p className="text-gray-500 text-sm mt-0.5">
                  You have {requests.length} pending booking request
                  {requests.length > 1 ? "s" : ""} waiting for approval.
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors text-gray-400 shrink-0">
              <ArrowRight size={18} />
            </div>
          </div>
        </Link>
      )}

      {/* --- MAIN GRID --- */}
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LEFT COLUMN (8 Cols) */}
        <div className="lg:col-span-8 space-y-12">
          {/* UP NEXT SECTION */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Happening Next
              </h2>
            </div>

            {nextSession ? (
              nextSession.isGoogle ? (
                // --- PREMIUM GOOGLE EVENT CARD ---
                <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-blue-100/50 shadow-[0_8px_30px_rgb(59,130,246,0.05)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-100/50 shrink-0 shadow-inner">
                        <CalendarIcon size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                          <Plug size={12} /> Google Calendar
                        </p>
                        <h3 className="text-2xl font-bold text-primary tracking-tight truncate max-w-[250px] md:max-w-md">
                          {nextSession.client?.full_name}
                        </h3>
                      </div>
                    </div>
                    <div className="text-left md:text-right border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                      <p className="text-xl font-bold text-primary">
                        {formatTimeIST(nextSession.start_time)}
                      </p>
                      <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wider">
                        {getDuration(
                          nextSession.start_time,
                          nextSession.end_time,
                        )}{" "}
                        Mins
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // --- PREMIUM PLATFORM EVENT CARD ---
                <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-[#2D2D2D] rounded-full flex items-center justify-center text-white text-3xl font-light shadow-xl shadow-primary/10 shrink-0">
                        {nextSession.client?.full_name?.[0] || "?"}
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-primary tracking-tight truncate max-w-[200px] md:max-w-sm">
                          {nextSession.client?.full_name || "Unknown"}
                        </h3>
                        <p className="text-gray-500 font-medium mt-2 flex items-center gap-2 text-sm">
                          <Clock size={16} className="text-secondary" />
                          {formatTimeIST(nextSession.start_time)} •{" "}
                          {getDuration(
                            nextSession.start_time,
                            nextSession.end_time,
                          )}{" "}
                          Mins
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-3 pt-2 md:pt-0">
                      <span className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 border border-gray-100">
                        {nextSession.mode === "online" ? (
                          <Video size={14} />
                        ) : (
                          <MapPin size={14} />
                        )}
                        {nextSession.mode}
                      </span>
                      {nextSession.mode === "online" && (
                        <a
                          href={therapistProfile.meeting_link || "#"}
                          target="_blank"
                          className="text-sm font-bold text-secondary hover:text-primary transition-colors flex items-center gap-1"
                        >
                          Join Room <ArrowRight size={14} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Minimalist Dossier Snapshot */}
                  <div className="bg-[#FAFAF8] rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row gap-8 relative z-10">
                    <div className="flex-1 md:border-r border-gray-200/60 md:pr-8">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">
                        Focus Area
                      </p>
                      <p className="text-sm text-primary font-medium leading-relaxed">
                        {nextSession.client_intake ||
                          "General check-in and ongoing progress review."}
                      </p>
                    </div>
                    <div className="md:w-1/3 flex flex-col justify-center">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2">
                        Current Mood
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-3xl font-light text-primary leading-none">
                          {nextSession.client_mood || "-"}
                        </span>
                        {nextSession.client_mood && (
                          <div className="h-1.5 flex-1 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className="h-full bg-secondary rounded-full"
                              style={{
                                width: `${nextSession.client_mood * 10}%`,
                              }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-100 flex items-center relative z-10">
                    <Link
                      href={`/therapist/session/${nextSession.$id}`}
                      className="text-gray-500 hover:text-primary text-sm font-bold transition-colors flex items-center gap-2"
                    >
                      Open Full Dossier <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              )
            ) : (
              // --- EMPTY STATE ---
              <div className="bg-white p-16 rounded-[2rem] border border-dashed border-gray-200 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                  <CalendarIcon size={32} strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">
                  Schedule Clear
                </h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  You have no upcoming sessions or Google events for the
                  foreseeable future.
                </p>
                <Link
                  href="/therapist/schedule"
                  className="mt-8 text-sm font-bold text-white bg-secondary px-6 py-3 rounded-xl hover:bg-[#4A6A56] transition-colors shadow-sm"
                >
                  Manage Availability
                </Link>
              </div>
            )}
          </section>

          {/* UPCOMING TIMELINE */}
          {otherSessions.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-8 mt-4">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Future Agenda
                </h2>
              </div>

              {/* The sleek vertical timeline */}
              <div className="relative pl-4 md:pl-0">
                {/* The Line */}
                <div className="absolute left-[27px] md:left-[119px] top-6 bottom-6 w-px bg-gray-200/60 z-0"></div>

                <div className="space-y-6 relative z-10">
                  {otherSessions.map((session, idx) => (
                    <div
                      key={session.$id || idx}
                      className="relative flex flex-col md:flex-row md:items-start gap-6 group"
                    >
                      {/* Desktop Time Column */}
                      <div className="hidden md:block w-24 text-right pt-5 shrink-0">
                        <p className="text-sm font-bold text-primary">
                          {formatTimeIST(session.start_time)}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                          {formatDateIST(session.start_time, "month")}{" "}
                          {formatDateIST(session.start_time, "day")}
                        </p>
                      </div>

                      {/* Timeline Node */}
                      <div className="absolute left-[-17px] md:static w-14 flex justify-center pt-6 shrink-0 z-10">
                        <div
                          className={`w-3 h-3 rounded-full border-2 border-white ring-4 ring-[#FAFAF8] ${session.isGoogle ? "bg-blue-400" : "bg-secondary"}`}
                        ></div>
                      </div>

                      {/* Event Card */}
                      <Link
                        href={
                          session.isGoogle
                            ? "#"
                            : `/therapist/session/${session.$id}`
                        }
                        className={`flex-1 block bg-white p-6 rounded-2xl border transition-all duration-300 ${session.isGoogle ? "border-blue-50 hover:border-blue-100 hover:shadow-[0_4px_20px_rgb(59,130,246,0.04)] cursor-default" : "border-gray-100 hover:border-secondary/20 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] cursor-pointer"}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            {/* Mobile Time (Hidden on Desktop) */}
                            <p className="md:hidden text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                              {formatDateIST(session.start_time, "short")} •{" "}
                              {formatTimeIST(session.start_time)}
                            </p>

                            <h4 className="font-bold text-primary tracking-tight">
                              {session.client?.full_name}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                              {session.isGoogle ? (
                                <span className="text-blue-500 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                                  <CalendarIcon size={10} /> Google
                                </span>
                              ) : (
                                <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                                  Platform Event
                                </span>
                              )}
                              <span className="text-gray-300">•</span>
                              <span className="font-medium">
                                {getDuration(
                                  session.start_time,
                                  session.end_time,
                                )}{" "}
                                Mins
                              </span>
                            </div>
                          </div>

                          {!session.isGoogle && (
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-secondary group-hover:text-white transition-colors text-gray-300">
                              <ChevronRight size={16} />
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* --- RIGHT COLUMN (4 Cols) --- */}
        <div className="lg:col-span-4 space-y-6">
          {/* Dark Mode Activity Widget */}
          <div className="bg-[#2D2D2D] rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-gray-900/10">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Activity size={120} strokeWidth={1} />
            </div>
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
              This Month
            </p>
            <div className="mb-2 relative z-10">
              <p className="text-7xl font-light tracking-tighter mb-1">
                {stats?.sessions || 0}
              </p>
              <p className="text-sm text-white/70 font-medium">
                Platform sessions completed
              </p>
            </div>
          </div>

          {/* Sleek Settings Widget */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">
              Practice Setup
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-4 border-b border-gray-50">
                <span className="text-sm font-medium text-gray-500">
                  Standard Rate
                </span>
                <span className="text-base font-bold text-primary">
                  ₹{stats?.price_per_session || 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-4 border-b border-gray-50">
                <span className="text-sm font-medium text-gray-500">
                  Integration
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${rawGoogleEvents.length > 0 ? "text-blue-500" : "text-gray-300"}`}
                >
                  {rawGoogleEvents.length > 0 ? "Active" : "None"}
                </span>
              </div>
            </div>

            <Link
              href="/therapist/settings"
              className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors w-full py-3 bg-gray-50 rounded-xl hover:bg-gray-100"
            >
              Manage Settings
            </Link>
          </div>

          {/* Help/Support Block */}
          <div className="bg-[#FAFAF8] rounded-[2rem] p-8 border border-gray-100 text-center">
            <p className="text-sm font-medium text-gray-600 leading-relaxed mb-4">
              Need help setting up your availability or payments?
            </p>
            <a
              href="mailto:support@therapyconnect.com"
              className="text-sm font-bold text-primary hover:text-secondary transition-colors underline underline-offset-4"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
