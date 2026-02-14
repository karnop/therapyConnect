"use client";

import { useState, useMemo } from "react";
import {
  format,
  isSameDay,
  addDays,
  startOfToday,
  parseISO,
  isBefore,
} from "date-fns";
import {
  Video,
  MapPin,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { formatTimeIST } from "@/lib/date"; // Use IST helper

export default function BookingWidget({
  therapistId,
  price,
  slots,
  isOnline,
  location,
}) {
  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfToday());
  const [duration, setDuration] = useState(60);

  // Price adjustment logic
  const displayPrice =
    duration === 30
      ? Math.round(price * 0.6)
      : duration === 90
        ? Math.round(price * 1.5)
        : price;

  const visibleDates = useMemo(
    () => Array.from({ length: 5 }).map((_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart],
  );

  const goToNextBlock = () => setCurrentWeekStart(addDays(currentWeekStart, 5));
  const goToPrevBlock = () => {
    const newStart = addDays(currentWeekStart, -5);
    setCurrentWeekStart(
      isBefore(newStart, startOfToday()) ? startOfToday() : newStart,
    );
  };
  const isPrevDisabled = isSameDay(currentWeekStart, startOfToday());

  // --- FIXED SLOT LOGIC ---
  const getBookableSlots = () => {
    const dailySlots = slots.filter((slot) =>
      isSameDay(parseISO(slot.start_time), selectedDate),
    );
    dailySlots.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    const bookable = [];
    const requiredBlocks = duration / 30;

    // FIX: Condition changed to allow the loop to check enough start points
    // If length is 4, req is 2. i can be 0, 1, 2. (Indices 0, 1, 2).
    // i=2: check index 2 and 3. OK.
    // i=3: check index 3 and 4. (4 out of bounds).
    // So loop should run while i <= length - req
    for (let i = 0; i <= dailySlots.length - requiredBlocks; i++) {
      const startSlot = dailySlots[i];
      let isValidSequence = true;

      for (let j = 0; j < requiredBlocks; j++) {
        const current = dailySlots[i + j];
        if (current.is_booked) {
          isValidSequence = false;
          break;
        }

        // Check continuity
        if (j > 0) {
          const prev = dailySlots[i + j - 1];
          const expectedStart = new Date(prev.end_time).getTime();
          const actualStart = new Date(current.start_time).getTime();
          if (expectedStart !== actualStart) {
            isValidSequence = false;
            break;
          }
        }
      }

      if (isValidSequence) {
        bookable.push(startSlot);
      }
    }
    return bookable;
  };

  const availableSlots = getBookableSlots();

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-xl overflow-hidden w-full max-w-full md:sticky md:top-24 flex flex-col">
      {/* Header */}
      <div className="bg-[#2D2D2D] p-6 text-white shrink-0">
        <div className="flex gap-2 mb-6 bg-white/10 p-1 rounded-xl w-fit">
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                duration === d
                  ? "bg-white text-primary shadow-sm"
                  : "text-white/60 hover:text-white"
              }`}
            >
              {d} min
            </button>
          ))}
        </div>

        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">
              Total
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">₹{displayPrice}</span>
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

        {/* Date Grid */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={goToPrevBlock}
            disabled={isPrevDisabled}
            className="p-2 hover:bg-white/10 rounded-full disabled:opacity-20 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="grid grid-cols-5 gap-1.5 md:gap-2 flex-1">
            {visibleDates.map((date) => {
              const isSelected = isSameDay(date, selectedDate);
              const hasRawSlots = slots.some((s) =>
                isSameDay(parseISO(s.start_time), date),
              );
              return (
                <button
                  key={date.toString()}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all border border-transparent ${isSelected ? "bg-white text-[#2D2D2D] shadow-lg font-bold scale-105 z-10" : hasRawSlots ? "bg-white/10 text-white hover:bg-white/20" : "opacity-40 hover:bg-white/5 text-white"}`}
                >
                  <span className="text-[9px] uppercase tracking-wide opacity-80">
                    {format(date, "EEE")}
                  </span>
                  <span className="text-lg leading-none mt-0.5">
                    {format(date, "d")}
                  </span>
                  <div
                    className={`w-1 h-1 rounded-full mt-1.5 ${hasRawSlots ? (isSelected ? "bg-green-500" : "bg-green-400") : "bg-transparent"}`}
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

      {/* Body */}
      <div className="p-6 bg-white flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />{" "}
            {format(selectedDate, "EEEE, MMM do")}
          </h3>
          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
            {availableSlots.length} options
          </span>
        </div>

        {availableSlots.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
            {availableSlots.map((slot) => (
              <Link
                key={slot.$id}
                href={`/book/${slot.$id}?duration=${duration}`}
                className="group"
              >
                <button className="w-full py-3 px-2 rounded-xl border border-gray-200 bg-white hover:border-secondary hover:bg-secondary/5 hover:text-secondary transition-all text-sm font-semibold text-gray-600 shadow-sm hover:shadow-md">
                  {formatTimeIST(slot.start_time)}
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
              No {duration}-min blocks
            </p>
            <p className="text-gray-400 text-xs mt-1">
              Try a shorter duration or different date
            </p>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100">
          {isOnline ? (
            <div className="flex items-center justify-center gap-2 text-xs text-blue-600 font-medium bg-blue-50 py-2 rounded-lg">
              <Video size={14} /> Video Link provided upon booking
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
