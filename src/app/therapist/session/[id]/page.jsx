import { getSessionDetails } from "@/actions/dashboard";
import { format, parseISO, isPast } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  User,
  Video,
  MapPin,
  Sparkles,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import InvoiceTrigger from "@/components/invoice/InvoiceTrigger";

export default async function SessionDetailsPage({ params }) {
  const { id } = params;
  const data = await getSessionDetails(id);

  if (!data) return notFound();

  const { booking, client, history, therapist } = data;
  const isOnline = booking.mode === "online";

  return (
    <div className="pb-20">
      {/* Back Button */}
      <Link
        href="/therapist/dashboard"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-secondary mb-6 transition-colors"
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      {booking.status === "confirmed" && (
        <InvoiceTrigger
          booking={booking}
          client={client}
          therapist={therapist}
        />
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* --- LEFT: CLIENT DOSSIER & PREP --- */}
        <div className="lg:col-span-2 space-y-8">
          {/* 1. Client Card (Same as before) */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
            <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold">
              {client.full_name?.[0]}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">
                {client.full_name}
              </h1>
              <div className="flex gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <User size={14} /> ID: {client.user_id.substring(0, 8)}...
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} /> Total Sessions: {history.length}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Session Prep (Same as before) */}
          <div className="bg-[#2D2D2D] text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="relative z-10">
              <h2 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-400" />
                Client Preparation
              </h2>

              {booking.is_shared ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/10 p-4 rounded-xl">
                      <span className="text-xs text-white/50 uppercase font-bold">
                        Mood Check
                      </span>
                      <div className="text-2xl font-bold mt-1">
                        {booking.client_mood}/10
                      </div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-xl">
                      <span className="text-xs text-white/50 uppercase font-bold">
                        Session Focus
                      </span>
                      <div className="text-lg font-medium mt-1 truncate">
                        {booking.client_intake || "General Check-in"}
                      </div>
                    </div>
                  </div>

                  {booking.client_journal && (
                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                      <span className="text-xs text-white/50 uppercase font-bold block mb-2">
                        Journal Note
                      </span>
                      <p className="text-white/90 italic leading-relaxed">
                        &apos;{booking.client_journal}&apos;
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/5 p-6 rounded-xl border border-white/5 text-center">
                  <p className="text-white/60">
                    Client has not shared preparation notes for this session.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3. Session Info */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Logistics</h3>
            <div className="flex gap-8 text-sm">
              <div>
                <span className="block text-gray-400 text-xs font-bold uppercase">
                  Date & Time
                </span>
                <span className="font-medium text-gray-900 block mt-1">
                  {format(parseISO(booking.start_time), "EEEE, MMM do")}
                </span>
                <span className="text-gray-600 block">
                  {format(parseISO(booking.start_time), "h:mm a")} -{" "}
                  {format(parseISO(booking.end_time), "h:mm a")}
                </span>
              </div>
              <div>
                <span className="block text-gray-400 text-xs font-bold uppercase">
                  Mode
                </span>
                <span className="font-medium text-gray-900 block mt-1 capitalize flex items-center gap-2">
                  {isOnline ? <Video size={16} /> : <MapPin size={16} />}
                  {booking.mode}
                </span>
              </div>
            </div>

            {isOnline && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                {/* UPDATED: Using therapist.meeting_link */}
                <a
                  href={therapist.meeting_link}
                  target="_blank"
                  className="bg-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-[#5A7A66] transition-colors inline-flex items-center gap-2"
                >
                  <Video size={18} /> Launch Video Call
                </a>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT: INTERACTION HISTORY (Same as before) --- */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-full max-h-[800px] overflow-y-auto">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Calendar size={18} className="text-gray-400" />
              Session History
            </h3>

            <div className="space-y-6 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
              {history.map((session, idx) => {
                const isCurrent = session.$id === booking.$id;
                return (
                  <div key={session.$id} className="relative pl-10">
                    <div
                      className={`absolute left-2 top-1.5 w-4 h-4 rounded-full border-2 ${
                        isCurrent
                          ? "bg-secondary border-secondary"
                          : "bg-white border-gray-300"
                      }`}
                    ></div>

                    <div
                      className={`p-3 rounded-xl border ${
                        isCurrent
                          ? "border-secondary/30 bg-secondary/5"
                          : "border-gray-100"
                      }`}
                    >
                      <p
                        className={`font-bold text-sm ${
                          isCurrent ? "text-secondary" : "text-gray-700"
                        }`}
                      >
                        {format(parseISO(session.start_time), "MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {format(parseISO(session.start_time), "h:mm a")} •{" "}
                        {session.mode}
                      </p>
                      {!isCurrent && (
                        <Link
                          href={`/therapist/session/${session.$id}`}
                          className="text-[10px] text-gray-400 hover:text-primary mt-2 block font-medium"
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
