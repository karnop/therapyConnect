"use client";

import { useState, useEffect } from "react";
import { getClientBookings } from "@/actions/dashboard";
import { format, parseISO, isFuture } from "date-fns";
import {
  Video,
  MapPin,
  User,
  ArrowRight,
  Sparkles,
  Edit3,
  Wallet,
  Clock4,
  Heart,
  Loader2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PrepModal from "@/components/PrepModal";
import PaymentModal from "@/components/PaymentModal";

export default function ClientDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentBooking, setPaymentBooking] = useState(null);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-secondary" size={32} />
          <p className="text-gray-400 text-sm font-medium">
            Loading your wellness hub...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* --- HEADER & NAVIGATION --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">My Wellness Hub</h1>
            <p className="text-gray-500 mt-1">
              Your space to prepare and reflect.
            </p>
          </div>

          <div className="flex gap-3">
            {/* My Care Team Link */}
            <Link href="/dashboard/therapists">
              <button className="bg-white border border-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
                <Heart size={16} className="text-rose-500" />
                My Care Team
              </button>
            </Link>

            <Link href="/search">
              <button className="bg-secondary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#5A7A66] transition-colors flex items-center gap-2 shadow-lg shadow-secondary/20">
                Book Session <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>

        {/* --- UPCOMING SESSIONS --- */}
        <section className="mb-12">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
            Upcoming & Pending
          </h2>

          {upcomingBookings.length > 0 ? (
            <div className="grid gap-6">
              {upcomingBookings.map((booking) => (
                <ActiveTicket
                  key={booking.$id}
                  booking={booking}
                  onPrepClick={() => setSelectedBooking(booking)}
                  onPayClick={() => setPaymentBooking(booking)}
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

        {/* --- PAST SESSIONS HISTORY --- */}
        {pastBookings.length > 0 && (
          <section className="opacity-90 hover:opacity-100 transition-opacity">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              Past History
            </h2>
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <div
                  key={booking.$id}
                  className="bg-white p-5 rounded-2xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    {/* Date Box */}
                    <div className="bg-gray-50 p-3 rounded-xl text-center min-w-[70px]">
                      <span className="block text-xs font-bold text-gray-400 uppercase">
                        {format(parseISO(booking.start_time), "MMM")}
                      </span>
                      <span className="block text-xl font-bold text-gray-700">
                        {format(parseISO(booking.start_time), "d")}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-800">
                        {booking.therapist?.full_name}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        {booking.mode === "online" ? (
                          <Video size={12} />
                        ) : (
                          <MapPin size={12} />
                        )}
                        {format(parseISO(booking.start_time), "h:mm a")} -{" "}
                        {format(parseISO(booking.end_time), "h:mm a")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {booking.status === "confirmed" ? (
                      <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium border border-green-100">
                        Completed
                      </span>
                    ) : (
                      <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-medium">
                        {booking.status.replace("_", " ")}
                      </span>
                    )}
                    <button className="text-sm font-medium text-secondary hover:underline px-2">
                      View Notes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- MODALS --- */}
        {selectedBooking && (
          <PrepModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onSuccess={refreshData}
          />
        )}
        {paymentBooking && (
          <PaymentModal
            booking={paymentBooking}
            onClose={() => setPaymentBooking(null)}
            onSuccess={refreshData}
          />
        )}
      </div>
    </div>
  );
}

// "Active Ticket" Component
function ActiveTicket({ booking, onPrepClick, onPayClick }) {
  const isOnline = booking.mode === "online";
  const startTime = parseISO(booking.start_time);
  const status = booking.status; // pending_approval, awaiting_payment, payment_verification, confirmed, cancelled

  // Handle Cancelled/Declined visual state specially
  if (status === "cancelled") {
    return (
      <div className="bg-gray-50 p-6 rounded-3xl border border-gray-200 opacity-75 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
            <X size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-700">
              Request Declined / Cancelled
            </h3>
            <p className="text-sm text-gray-500">
              {booking.therapist?.full_name} • {format(startTime, "MMM d")}
            </p>
          </div>
        </div>
        <Link href="/search">
          <button className="text-sm font-medium text-secondary hover:underline">
            Book new slot
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row">
      {/* Left: Time & Type */}
      <div
        className={`text-white p-6 md:w-48 flex flex-col justify-between shrink-0 relative overflow-hidden ${
          status === "confirmed" ? "bg-[#2D2D2D]" : "bg-gray-400"
        }`}
      >
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

          {/* STATUS INDICATORS */}
          <div className="flex items-center gap-2 mt-4 text-xs font-medium">
            {status === "pending_approval" && (
              <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded flex items-center gap-1">
                <Clock4 size={12} /> Waiting for therapist approval
              </span>
            )}
            {status === "awaiting_payment" && (
              <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded flex items-center gap-1 animate-pulse">
                <Wallet size={12} /> Payment Required
              </span>
            )}
            {status === "payment_verification" && (
              <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded flex items-center gap-1">
                <Clock4 size={12} /> Verifying Payment...
              </span>
            )}
            {status === "confirmed" &&
              (booking.client_journal ? (
                <span className="text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                  <Sparkles size={12} /> Ready for session
                </span>
              ) : (
                <span className="text-gray-500 bg-gray-50 px-2 py-1 rounded flex items-center gap-1">
                  <Edit3 size={12} /> Prep recommended
                </span>
              ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto">
          {status === "pending_approval" && (
            <button
              disabled
              className="bg-gray-100 text-gray-400 px-6 py-3 rounded-xl font-bold cursor-not-allowed text-center"
            >
              Request Sent
            </button>
          )}

          {status === "awaiting_payment" && (
            <>
              <button
                onClick={onPayClick}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                <Wallet size={18} /> Complete Payment
              </button>
              <a
                href={`mailto:support@therapyconnect.in?subject=Payment Issue Booking ${booking.$id}`}
                className="text-xs text-center text-gray-400 hover:text-red-500 flex items-center justify-center gap-1"
              >
                <ShieldAlert size={12} /> Report Issue
              </a>
            </>
          )}

          {status === "payment_verification" && (
            <div className="text-center">
              <button
                disabled
                className="bg-purple-100 text-purple-600 px-6 py-3 rounded-xl font-bold cursor-not-allowed w-full"
              >
                Verifying...
              </button>
              <p className="text-[10px] text-gray-400 mt-2 max-w-[150px] leading-tight">
                Manual verification by therapist. This usually takes 2-4 hours.
              </p>
            </div>
          )}

          {status === "confirmed" && (
            <>
              {isOnline ? (
                <a
                  href={booking.therapist.meeting_link}
                  target="_blank"
                  className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors text-center flex items-center justify-center gap-2"
                >
                  <Video size={18} /> Join Call
                </a>
              ) : (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    booking.therapist?.clinic_address
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors text-center flex items-center justify-center gap-2"
                >
                  <MapPin size={18} /> View Address
                </a>
              )}

              <button
                onClick={onPrepClick}
                className="border border-gray-200 text-gray-600 px-6 py-3 rounded-xl font-medium hover:border-secondary hover:text-secondary transition-colors text-center flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                {booking.client_journal ? "Update Prep" : "Prepare"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper icon component
import { ShieldAlert } from "lucide-react";
