"use client";

import { useState, useMemo } from "react";
import {
  format,
  isSameDay,
  addDays,
  startOfToday,
  parseISO,
  startOfWeek,
  addWeeks,
  subWeeks,
  isBefore,
} from "date-fns";
import {
  Video,
  MapPin,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function BookingWidget({
  therapistId,
  price,
  slots,
  isOnline,
  location,
}) {
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  // We track the start of the visible week view
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfToday());

  // Generate a fixed 7-day window for stability
  const visibleDates = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) =>
      addDays(currentWeekStart, i)
    );
  }, [currentWeekStart]);

  const goToNextBlock = () => setCurrentWeekStart(addDays(currentWeekStart, 5));
  const goToPrevBlock = () => {
    const newStart = addDays(currentWeekStart, -5);
    if (!isBefore(newStart, startOfToday())) {
      setCurrentWeekStart(newStart);
    } else {
      setCurrentWeekStart(startOfToday());
    }
  };

  const isPrevDisabled =
    isSameDay(currentWeekStart, startOfToday()) ||
    isBefore(currentWeekStart, startOfToday());

  // Filter slots for the selected date
  const daySlots = slots.filter((slot) =>
    isSameDay(parseISO(slot.start_time), selectedDate)
  );

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden w-full md:sticky md:top-24 flex flex-col">
      {/* --- HEADER (Dark Theme) --- */}
      <div className="bg-[#2D2D2D] p-6 text-white shrink-0">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">
              Session Rate
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">₹{price}</span>
              <span className="text-white/60 text-sm font-medium">
                / 60 min
              </span>
            </div>
          </div>
          <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md">
            {isOnline ? (
              <Video className="text-blue-300" size={24} />
            ) : (
              <MapPin className="text-orange-300" size={24} />
            )}
          </div>
        </div>

        {/* --- ROBUST DATE PICKER (Grid Based) --- */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={goToPrevBlock}
            disabled={isPrevDisabled}
            className="p-2 hover:bg-white/10 rounded-full disabled:opacity-20 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Fixed Grid: Guarantees width fit */}
          <div className="grid grid-cols-5 gap-1.5 md:gap-2 flex-1">
            {visibleDates.map((date) => {
              const isSelected = isSameDay(date, selectedDate);
              const hasSlots = slots.some((s) =>
                isSameDay(parseISO(s.start_time), date)
              );

              return (
                <button
                  key={date.toString()}
                  onClick={() => setSelectedDate(date)}
                  className={`
                                flex flex-col items-center justify-center py-2 rounded-xl transition-all border border-transparent
                                ${
                                  isSelected
                                    ? "bg-white text-[#2D2D2D] shadow-lg font-bold scale-105 z-10"
                                    : hasSlots
                                    ? "bg-white/10 text-white hover:bg-white/20"
                                    : "opacity-40 hover:bg-white/5 text-white"
                                }
                            `}
                >
                  <span className="text-[9px] uppercase tracking-wide opacity-80">
                    {format(date, "EEE")}
                  </span>
                  <span className="text-lg leading-none mt-0.5">
                    {format(date, "d")}
                  </span>

                  {/* Simple Dot for availability */}
                  <div
                    className={`w-1 h-1 rounded-full mt-1.5 ${
                      hasSlots
                        ? isSelected
                          ? "bg-green-500"
                          : "bg-green-400"
                        : "bg-transparent"
                    }`}
                  ></div>
                </button>
              );
            })}
          </div>

          <button
            onClick={goToNextBlock}
            className="p-2 hover:bg-white/10 rounded-full transition-colors shrink-0"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* --- SLOTS BODY --- */}
      <div className="p-6 bg-white flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            {format(selectedDate, "EEEE, MMM do")}
          </h3>
          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
            {daySlots.length} slots
          </span>
        </div>

        {daySlots.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
            {daySlots.map((slot) => (
              <Link key={slot.$id} href={`/book/${slot.$id}`} className="group">
                <button className="w-full py-3 px-2 rounded-xl border border-gray-200 bg-white hover:border-secondary hover:bg-secondary/5 hover:text-secondary transition-all text-sm font-semibold text-gray-600 shadow-sm hover:shadow-md">
                  {format(parseISO(slot.start_time), "h:mm a")}
                </button>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 text-gray-300">
              <Calendar size={24} />
            </div>
            <p className="text-gray-500 text-sm font-medium">
              No slots available
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Try checking another date
            </p>
          </div>
        )}

        {/* Location Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          {isOnline ? (
            <div className="flex items-center justify-center gap-2 text-xs text-blue-600 font-medium bg-blue-50 py-2 rounded-lg">
              <Video size={14} />
              Video Link provided upon booking
            </div>
          ) : (
            <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 py-2 px-3 rounded-lg leading-relaxed">
              <MapPin size={14} className="shrink-0 mt-0.5" />
              <span>{location || "Clinic details sent after booking"}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
