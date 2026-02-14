"use client";

import { useState, useEffect } from "react";
import {
  getTherapistDashboardData,
  handleBookingRequest,
  confirmBookingPayment,
} from "@/actions/dashboard";
import { format, parseISO, differenceInMinutes } from "date-fns"; // Added differenceInMinutes
import {
  Clock,
  Check,
  X,
  Calendar,
  Inbox,
  Wallet,
  Loader2,
} from "lucide-react";

// ... (Keep Exports, RequestsPage main component, VerificationCard same as before) ...
// Re-exporting RequestsPage component structure for completeness context, but logic changes are in RequestCard

export default function RequestsPage() {
  const [data, setData] = useState({ requests: [], verifications: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res = await getTherapistDashboardData();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refresh = () => {
    setLoading(true);
    fetchData();
  };

  if (loading && data.requests.length === 0 && data.verifications.length === 0)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-secondary" size={32} />
      </div>
    );

  return (
    <div className="pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Booking Inbox</h1>
        <p className="text-gray-500">Manage approvals and payments.</p>
      </div>

      {data.verifications.length > 0 && (
        <section className="mb-10 animate-in slide-in-from-bottom-2">
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Wallet size={16} /> Verify Payments ({data.verifications.length})
          </h2>
          <div className="space-y-4">
            {data.verifications.map((item) => (
              <VerificationCard
                key={item.$id}
                booking={item}
                onSuccess={refresh}
              />
            ))}
          </div>
        </section>
      )}

      <section className="animate-in slide-in-from-bottom-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Inbox size={16} /> New Requests ({data.requests.length})
        </h2>
        {data.requests.length > 0 ? (
          <div className="space-y-4">
            {data.requests.map((req) => (
              <RequestCard key={req.$id} request={req} onSuccess={refresh} />
            ))}
          </div>
        ) : (
          data.requests.length === 0 &&
          data.verifications.length === 0 && (
            <div className="bg-white p-16 rounded-3xl border-2 border-dashed border-gray-200 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <Inbox size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">All Caught Up</h3>
              <p className="text-gray-500">You have no pending items.</p>
            </div>
          )
        )}
      </section>
    </div>
  );
}

// ... (VerificationCard kept same) ...
function VerificationCard({ booking, onSuccess }) {
  const [actionState, setActionState] = useState(null);
  const handleVerify = async (isValid) => {
    setActionState(isValid ? "confirming" : "rejecting");
    const result = await confirmBookingPayment(booking.$id, isValid);
    if (result?.error) {
      alert("Error: " + result.error);
      setActionState(null);
    } else {
      onSuccess();
    }
  };
  return (
    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-lg font-bold text-blue-600">
          {booking.client?.full_name?.[0]}
        </div>
        <div>
          <h4 className="text-lg font-bold text-gray-900">
            {booking.client?.full_name}
          </h4>
          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1 bg-white px-3 py-1 rounded-lg border border-gray-200 w-fit">
            <span className="font-bold text-xs uppercase text-gray-400">
              Ref ID:
            </span>
            <span className="font-mono font-medium">
              {booking.transaction_id}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            For session on{" "}
            {format(parseISO(booking.start_time), "MMM d, h:mm a")}
          </p>
        </div>
      </div>
      <div className="flex gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-0 border-blue-100">
        <button
          onClick={() => handleVerify(false)}
          disabled={!!actionState}
          className="flex-1 md:flex-none w-full md:w-auto px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:text-red-600 hover:border-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {actionState === "rejecting" ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <X size={16} />
          )}{" "}
          Reject
        </button>
        <button
          onClick={() => handleVerify(true)}
          disabled={!!actionState}
          className="flex-1 md:flex-none w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
        >
          {actionState === "confirming" ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Check size={16} />
          )}{" "}
          Confirm Payment
        </button>
      </div>
    </div>
  );
}

// Updated RequestCard with Duration Badge
function RequestCard({ request, onSuccess }) {
  const [actionState, setActionState] = useState(null);
  const duration = differenceInMinutes(
    parseISO(request.end_time),
    parseISO(request.start_time),
  );

  const handleAction = async (action) => {
    if (
      !confirm(
        action === "accept"
          ? "Accept this request?"
          : "Decline and remove this request?",
      )
    )
      return;
    setActionState(action === "accept" ? "accepting" : "declining");
    const result = await handleBookingRequest(request.$id, action);
    if (result?.error) {
      alert("Error: " + result.error);
      setActionState(null);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-[#F2F5F4] rounded-full flex items-center justify-center text-lg font-bold text-secondary">
          {request.client?.full_name?.[0] || "?"}
        </div>
        <div>
          <h4 className="text-lg font-bold text-gray-900">
            {request.client?.full_name || "Unknown Client"}
          </h4>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />{" "}
              {format(parseISO(request.start_time), "EEEE, MMM d")}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />{" "}
              {format(parseISO(request.start_time), "h:mm a")}
            </span>

            {/* DURATION BADGE */}
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-bold uppercase tracking-wide border border-blue-100">
              {duration} Mins
            </span>

            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium uppercase tracking-wide">
              {request.mode}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 w-full md:w-auto border-t md:border-0 pt-4 md:pt-0 border-gray-100">
        <button
          onClick={() => handleAction("decline")}
          disabled={!!actionState}
          className="flex-1 md:flex-none w-full md:w-auto px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {actionState === "declining" ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <X size={16} />
          )}{" "}
          Decline
        </button>
        <button
          onClick={() => handleAction("accept")}
          disabled={!!actionState}
          className="flex-1 md:flex-none w-full md:w-auto px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {actionState === "accepting" ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Check size={16} />
          )}{" "}
          Accept
        </button>
      </div>
    </div>
  );
}
