"use client";

import { useState, useEffect } from "react";
import { getClientBookings } from "@/actions/dashboard";
import { format, parseISO, isFuture } from "date-fns";
import {
  Video,
  MapPin,
  Clock,
  User,
  ArrowRight,
  Sparkles,
  Edit3,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PrepModal from "@/components/PrepModal";

export default function ClientDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const refreshData = () => {
    setLoading(true);
    getClientBookings().then((data) => {
      setBookings(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshData();
  }, []);

  const upcomingBookings = bookings.filter((b) =>
    isFuture(parseISO(b.end_time))
  );
  const pastBookings = bookings.filter((b) => !isFuture(parseISO(b.end_time)));

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">My Wellness Hub</h1>
            <p className="text-gray-500 mt-1">
              Your space to prepare and reflect.
            </p>
          </div>
          <Link href="/search">
            <button className="hidden md:flex bg-secondary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#5A7A66] transition-colors items-center gap-2">
              Book New Session <ArrowRight size={16} />
            </button>
          </Link>
        </div>

        {/* --- UPCOMING SESSIONS --- */}
        <section className="mb-12">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
            Upcoming
          </h2>

          {upcomingBookings.length > 0 ? (
            <div className="grid gap-6">
              {upcomingBookings.map((booking) => (
                <ActiveTicket
                  key={booking.$id}
                  booking={booking}
                  onPrepClick={() => setSelectedBooking(booking)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-200 text-center">
              <p className="text-gray-500 mb-4">
                You have no upcoming sessions scheduled.
              </p>
              <Link href="/search">
                <button className="text-secondary font-semibold hover:underline">
                  Find a Therapist
                </button>
              </Link>
            </div>
          )}
        </section>

        {/* --- PAST SESSIONS --- */}
        {pastBookings.length > 0 && (
          <section className="opacity-80 hover:opacity-100 transition-opacity">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              Past History
            </h2>
            <div className="grid gap-4">
              {pastBookings.map((booking) => (
                <div
                  key={booking.$id}
                  className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between text-gray-500"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-700">
                      {format(parseISO(booking.start_time), "MMM d")}
                    </span>
                    <span>{booking.therapist?.full_name}</span>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    Completed
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- MODAL --- */}
        {selectedBooking && (
          <PrepModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onSuccess={refreshData} // Callback to refresh data
          />
        )}
      </div>
    </div>
  );
}

// "Active Ticket" Component
function ActiveTicket({ booking, onPrepClick }) {
  const isOnline = booking.mode === "online";
  const startTime = parseISO(booking.start_time);

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row">
      {/* Left: Time & Type */}
      <div className="bg-[#2D2D2D] text-white p-6 md:w-48 flex flex-col justify-between shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>

        <div>
          <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
            {isOnline ? "Online" : "In-Person"}
          </span>
          <div className="text-3xl font-bold mt-1">
            {format(startTime, "d")}
          </div>
          <div className="text-lg text-white/80">
            {format(startTime, "MMM")}
          </div>
        </div>

        <div className="mt-6 md:mt-0">
          <p className="text-2xl font-bold">{format(startTime, "h:mm a")}</p>
          <p className="text-xs text-white/50">{format(startTime, "EEEE")}</p>
        </div>
      </div>

      {/* Right: Details & Action */}
      <div className="p-6 md:p-8 flex-1 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
              {booking.therapist?.avatarUrl ? (
                <Image
                  src={booking.therapist.avatarUrl}
                  alt="T"
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="w-6 h-6 m-2 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg text-primary">
                {booking.therapist?.full_name}
              </h3>
              <p className="text-xs text-gray-500">Licensed Therapist</p>
            </div>
          </div>

          {/* Prep Status Indicator */}
          <div className="flex items-center gap-2 mt-4 text-xs font-medium">
            {booking.client_journal || booking.client_mood ? (
              <span className="text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                <Sparkles size={12} /> Ready for session
              </span>
            ) : (
              <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded flex items-center gap-1">
                <Edit3 size={12} /> Prep recommended
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto">
          {/* Primary Action */}
          {isOnline ? (
            <a
              href={booking.therapist.meeting_link}
              target="_blank"
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors text-center flex items-center justify-center gap-2"
            >
              <Video size={18} /> Join Call
            </a>
          ) : (
            <button className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold cursor-default text-center flex items-center justify-center gap-2">
              <MapPin size={18} /> View Address
            </button>
          )}

          {/* Secondary Action: Prep */}
          <button
            onClick={onPrepClick}
            className="border border-gray-200 text-gray-600 px-6 py-3 rounded-xl font-medium hover:border-secondary hover:text-secondary transition-colors text-center flex items-center justify-center gap-2"
          >
            <Sparkles size={18} />
            {booking.client_journal ? "Update Prep" : "Prepare"}
          </button>
        </div>
      </div>
    </div>
  );
}
