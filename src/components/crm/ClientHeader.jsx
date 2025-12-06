"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Phone,
  Calendar,
  MoreVertical,
  AlertTriangle,
  ShieldCheck,
  AlertOctagon,
  MessageCircle,
} from "lucide-react";
import { updateClientRisk } from "@/actions/crm";
import Image from "next/image";

// Safety Level Config
const RISK_LEVELS = {
  stable: {
    label: "Stable",
    color: "bg-green-100 text-green-700 border-green-200",
    icon: ShieldCheck,
  },
  moderate: {
    label: "Monitor",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: AlertTriangle,
  },
  high: {
    label: "High Risk",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: AlertOctagon,
  },
};

export default function ClientHeader({ data }) {
  const { profile, record, nextBooking } = data;
  const [currentRisk, setCurrentRisk] = useState(
    record.risk_status || "stable"
  );
  const [isRiskMenuOpen, setIsRiskMenuOpen] = useState(false);

  const RiskIcon = RISK_LEVELS[currentRisk].icon;

  const handleRiskChange = async (status) => {
    setCurrentRisk(status); // Optimistic update
    setIsRiskMenuOpen(false);
    await updateClientRisk(record.$id, status);
  };

  const handleWhatsApp = () => {
    const phone = profile.phone_number?.replace(/\D/g, ""); // Clean number
    if (phone) window.open(`https://wa.me/${phone}`, "_blank");
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* LEFT: Profile & Context */}
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-sm shrink-0">
              {profile.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.full_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-gray-400">
                  {profile.full_name?.[0]}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">
                  {profile.full_name}
                </h1>
                {/* Source Tag */}
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md border border-gray-200">
                  {record.source}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm mt-1">
                {/* Next Appointment Indicator */}
                {nextBooking ? (
                  <span className="text-gray-600 flex items-center gap-1.5">
                    <Calendar size={14} className="text-secondary" />
                    Next:{" "}
                    <span className="font-medium">
                      {format(
                        parseISO(nextBooking.start_time),
                        "MMM d, h:mm a"
                      )}
                    </span>
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1.5">
                    <Calendar size={14} /> No future booking
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Actions & Risk */}
          <div className="flex items-center gap-3">
            {/* 1. Risk Toggle (The Traffic Light) */}
            <div className="relative">
              <button
                onClick={() => setIsRiskMenuOpen(!isRiskMenuOpen)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-bold transition-all ${RISK_LEVELS[currentRisk].color}`}
              >
                <RiskIcon size={16} />
                {RISK_LEVELS[currentRisk].label}
              </button>

              {isRiskMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-3 py-2 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                    Set Safety Status
                  </div>
                  {Object.entries(RISK_LEVELS).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => handleRiskChange(key)}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          key === "stable"
                            ? "bg-green-500"
                            : key === "moderate"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      {val.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-gray-200 mx-1"></div>

            {/* 2. Quick Actions */}
            <button
              onClick={handleWhatsApp}
              className="p-2.5 rounded-lg border border-gray-200 text-gray-600 hover:text-green-600 hover:border-green-200 hover:bg-green-50 transition-all"
              title="Open WhatsApp"
            >
              <MessageCircle size={18} />
            </button>

            {/* Placeholder for 'Book for Client' (Manual Booking) */}
            <button className="bg-secondary text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-[#5A7A66] transition-colors flex items-center gap-2 shadow-sm">
              <Calendar size={16} /> Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
