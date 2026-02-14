"use client";

import { createBooking } from "@/actions/booking";
import { useState } from "react";
import {
  Video,
  MapPin,
  Send,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-secondary hover:bg-[#5A7A66] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-6"
    >
      {pending ? (
        <>
          <Loader2 size={20} className="animate-spin" />
          Sending Request...
        </>
      ) : (
        <>
          <Send size={20} />
          Send Booking Request
          <ArrowRight
            size={18}
            className="group-hover:translate-x-1 transition-transform"
          />
        </>
      )}
    </button>
  );
}

export default function BookingForm({ slotId, price, therapist, duration }) {
  const hasOnline = !!therapist.meeting_link;
  const hasOffline = !!therapist.clinic_address;
  const [selectedMode, setSelectedMode] = useState(
    hasOnline ? "online" : "offline",
  );

  return (
    <form
      action={createBooking}
      className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg h-fit sticky top-24"
    >
      <input type="hidden" name="slotId" value={slotId} />
      <input type="hidden" name="mode" value={selectedMode} />
      {/* NEW: Pass duration to server action */}
      <input type="hidden" name="duration" value={duration} />

      <h2 className="text-xl font-bold text-primary mb-6">
        Select Session Mode
      </h2>

      <div className="space-y-3 mb-8">
        {hasOnline && (
          <div
            onClick={() => setSelectedMode("online")}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-4 relative ${selectedMode === "online" ? "border-secondary bg-secondary/5" : "border-gray-100 hover:border-gray-200"}`}
          >
            <div
              className={`p-2 rounded-full ${selectedMode === "online" ? "bg-white text-secondary" : "bg-gray-100 text-gray-400"}`}
            >
              <Video size={20} />
            </div>
            <div className="flex-1">
              <h3
                className={`font-bold text-sm ${selectedMode === "online" ? "text-secondary" : "text-gray-700"}`}
              >
                Video Call
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Join from anywhere via secure link.
              </p>
            </div>
            {selectedMode === "online" && (
              <CheckCircle2
                size={20}
                className="text-secondary absolute top-4 right-4"
              />
            )}
          </div>
        )}
        {hasOffline && (
          <div
            onClick={() => setSelectedMode("offline")}
            className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-4 relative ${selectedMode === "offline" ? "border-secondary bg-secondary/5" : "border-gray-100 hover:border-gray-200"}`}
          >
            <div
              className={`p-2 rounded-full ${selectedMode === "offline" ? "bg-white text-secondary" : "bg-gray-100 text-gray-400"}`}
            >
              <MapPin size={20} />
            </div>
            <div className="flex-1">
              <h3
                className={`font-bold text-sm ${selectedMode === "offline" ? "text-secondary" : "text-gray-700"}`}
              >
                In-Person Visit
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {therapist.clinic_address}, {therapist.metro_station}
              </p>
            </div>
            {selectedMode === "offline" && (
              <CheckCircle2
                size={20}
                className="text-secondary absolute top-4 right-4"
              />
            )}
          </div>
        )}
        {!hasOnline && !hasOffline && (
          <div className="p-4 bg-red-50 text-red-500 text-sm rounded-xl border border-red-100">
            Error: This therapist has not configured any location details yet.
          </div>
        )}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-gray-600 text-sm">
          <span>Session Fee</span>
          <span>₹{price}</span>
        </div>
        <div className="flex justify-between text-gray-600 text-sm">
          <span>Platform Fee</span>
          <span>₹0</span>
        </div>
        <div className="h-px bg-gray-100 my-2"></div>
        <div className="flex justify-between text-lg font-bold text-primary">
          <span>Total to Pay Later</span>
          <span>₹{price}</span>
        </div>
      </div>

      <SubmitButton />
      <p className="text-xs text-center text-gray-400 mt-4">
        *No payment required right now. Pay directly to therapist after
        approval.
      </p>
    </form>
  );
}
