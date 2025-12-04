"use client";

import { useState, useEffect } from "react";
import { createSlot, getMySlots, deleteSlot } from "@/actions/schedule"; // Ensure this path matches your project structure
import {
  Plus,
  Trash2,
  Calendar as CalIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Sparkles,
  X,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
  isBefore,
  startOfToday,
  differenceInCalendarDays, // FIXED: Imported this function
} from "date-fns";
import Link from "next/link";

export default function SchedulePage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Loading state for Quick Add action
  const [createLoading, setCreateLoading] = useState(false);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showBulkModal, setShowBulkModal] = useState(false);

  const fetchSlots = async () => {
    const data = await getMySlots();
    setSlots(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // --- CALENDAR LOGIC ---
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const daySlots = slots.filter((slot) =>
    isSameDay(parseISO(slot.start_time), selectedDate)
  );

  const getSlotsForDay = (date) => {
    return slots.filter((slot) => isSameDay(parseISO(slot.start_time), date));
  };

  // --- HANDLERS ---
  const handleDelete = async (id) => {
    // Optimistic UI update
    const previousSlots = [...slots];
    setSlots((prev) => prev.filter((s) => s.$id !== id));

    const result = await deleteSlot(id);
    if (result?.error) {
      alert(result.error);
      setSlots(previousSlots); // Rollback if server fails
    }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    setError(null);
    setCreateLoading(true); // Start loader

    const formData = new FormData(e.currentTarget);
    const time = formData.get("time");

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const startDateTime = new Date(`${dateStr}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
    const now = new Date();

    // Validation checks
    if (startDateTime < now) {
      setError("You cannot add slots in the past.");
      setCreateLoading(false);
      return;
    }

    const hasOverlap = daySlots.some((slot) => {
      const slotStart = new Date(slot.start_time);
      const slotEnd = new Date(slot.end_time);
      return startDateTime < slotEnd && endDateTime > slotStart;
    });

    if (hasOverlap) {
      setError("Overlaps with an existing slot.");
      setCreateLoading(false);
      return;
    }

    // Execute Server Action
    const result = await createSlot(formData);

    setCreateLoading(false); // Stop loader

    if (result.error) {
      setError(result.error);
    } else {
      fetchSlots();
      e.target.reset();
    }
  };

  const isPastDate = isBefore(selectedDate, startOfToday());

  return (
    <div className="relative">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Schedule Manager</h1>
          <p className="text-gray-500 mt-1">
            Click a date to manage availability.
          </p>
        </div>
        <button
          onClick={() => setShowBulkModal(true)}
          className="bg-primary text-white px-6 py-3 rounded-xl shadow-soft hover:shadow-lg flex items-center gap-2 transition-all hover:bg-gray-800"
        >
          <Sparkles size={18} className="text-yellow-400" />
          Auto-Generate Slots
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* --- LEFT: CALENDAR VIEW --- */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="font-bold text-lg">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
              <div key={d} className="text-xs font-bold text-gray-400">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((day, idx) => {
              const dailySlots = getSlotsForDay(day);
              const hasSlots = dailySlots.length > 0;
              const hasBookings = dailySlots.some((s) => s.is_booked);

              const isSelected = isSameDay(day, selectedDate);
              const isPast = isBefore(day, startOfToday());

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDate(day);
                    setError(null);
                  }}
                  className={`
                                relative h-10 w-10 rounded-full flex items-center justify-center text-sm transition-all
                                ${
                                  !isSameMonth(day, currentMonth)
                                    ? "text-gray-300"
                                    : isPast
                                    ? "text-gray-300 bg-gray-50"
                                    : "text-gray-700"
                                }
                                ${
                                  isSelected
                                    ? "bg-secondary text-white shadow-md shadow-secondary/30 scale-110"
                                    : "hover:bg-gray-50"
                                }
                                ${
                                  isToday(day) && !isSelected
                                    ? "border border-secondary text-secondary"
                                    : ""
                                }
                            `}
                >
                  {format(day, "d")}
                  {hasSlots && !isSelected && (
                    <span
                      className={`absolute bottom-1 w-1 h-1 rounded-full ${
                        hasBookings ? "bg-orange-400" : "bg-green-500"
                      }`}
                    ></span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex gap-4 mt-6 justify-center text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Open
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>{" "}
              Booked
            </div>
          </div>
        </div>

        {/* --- RIGHT: TIMELINE VIEW --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4 bg-[#F2F5F4] p-4 rounded-2xl border border-gray-200/50">
            <div className="bg-white p-3 rounded-xl shadow-sm text-center min-w-[70px]">
              <span className="block text-xs uppercase text-gray-500 font-bold">
                {format(selectedDate, "EEE")}
              </span>
              <span className="block text-2xl font-bold text-secondary">
                {format(selectedDate, "d")}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-primary">
                Availability for {format(selectedDate, "MMMM do")}
              </h3>
              <p className="text-sm text-gray-500">
                {daySlots.length} slots total
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium animate-in fade-in">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-h-[300px]">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-gray-300" />
              </div>
            ) : daySlots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {daySlots.map((slot) => {
                  const isConfirmed = slot.status === "confirmed";
                  const isPending = [
                    "pending_approval",
                    "awaiting_payment",
                    "payment_verification",
                  ].includes(slot.status);
                  const isAvailable = !slot.is_booked;

                  let borderClass = "border-gray-100";
                  let bgClass = "bg-white";
                  let statusLabel = "Available";

                  if (isConfirmed) {
                    borderClass = "border-green-200";
                    bgClass = "bg-green-50/50";
                    statusLabel = "Confirmed";
                  } else if (isPending) {
                    borderClass = "border-yellow-200";
                    bgClass = "bg-yellow-50/50";
                    statusLabel = "Pending Request";
                  } else if (slot.status === "unknown_booking") {
                    borderClass = "border-gray-200";
                    bgClass = "bg-gray-100 opacity-50";
                    statusLabel = "Unavailable";
                  }

                  return (
                    <div
                      key={slot.$id}
                      className={`p-4 rounded-xl border ${borderClass} ${bgClass} flex justify-between items-center transition-all`}
                    >
                      <div>
                        <p className="font-bold text-gray-800 text-lg">
                          {format(parseISO(slot.start_time), "h:mm a")}
                        </p>
                        <p
                          className={`text-xs font-medium ${
                            isConfirmed
                              ? "text-green-600"
                              : isPending
                              ? "text-yellow-600"
                              : "text-gray-400"
                          }`}
                        >
                          {statusLabel}
                        </p>
                      </div>

                      {isAvailable ? (
                        <button
                          onClick={() => handleDelete(slot.$id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                          title="Delete Slot"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : // If booked/pending, show link to session if valid bookingId exists
                      slot.bookingId ? (
                        <Link
                          href={`/therapist/session/${slot.bookingId}`}
                          className="text-gray-400 hover:text-secondary p-2"
                        >
                          <ExternalLink size={18} />
                        </Link>
                      ) : (
                        <div className="w-8"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <CalIcon className="mx-auto text-gray-200 mb-2" size={48} />
                <p className="text-gray-400">No slots added for this day.</p>
              </div>
            )}
          </div>

          <div
            className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-sm ${
              isPastDate ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-sm text-gray-700 uppercase tracking-wider">
                Quick Add
              </h4>
              {isPastDate && (
                <span className="text-xs text-red-400 font-medium">
                  Cannot add slots to past dates
                </span>
              )}
            </div>

            <form onSubmit={handleQuickAdd} className="flex gap-4">
              <input
                type="hidden"
                name="date"
                value={format(selectedDate, "yyyy-MM-dd")}
              />
              <input
                type="time"
                name="time"
                required
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none"
              />
              <button
                type="submit"
                disabled={createLoading}
                className="bg-gray-900 text-white px-6 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {createLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <Plus size={18} /> Add
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowBulkModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400"
            >
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-primary mb-2">
              Bulk Generate Slots
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Create specific hours for multiple days at once.
            </p>
            <BulkGeneratorForm
              onSuccess={() => {
                fetchSlots();
                setShowBulkModal(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// BulkGeneratorForm component
function BulkGeneratorForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [bulkError, setBulkError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setBulkError(null);

    const formData = new FormData(e.currentTarget);

    const start = new Date(formData.get("startDate"));
    const end = new Date(formData.get("endDate"));
    const today = startOfToday();

    if (isBefore(start, today)) {
      setBulkError("Start date cannot be in the past.");
      setLoading(false);
      return;
    }

    // FIXED: differenceInCalendarDays is now imported at the top of the file
    if (differenceInCalendarDays(end, start) > 14) {
      setBulkError(
        "You can only generate slots for a maximum of 14 days at a time."
      );
      setLoading(false);
      return;
    }

    if (end < start) {
      setBulkError("End date cannot be before start date.");
      setLoading(false);
      return;
    }

    const selectedDays = [];
    e.currentTarget
      .querySelectorAll('input[name="day"]:checked')
      .forEach((cb) => {
        selectedDays.push(cb.value);
      });
    formData.append("selectedDays", selectedDays.join(","));

    if (selectedDays.length === 0) {
      setBulkError("Please select at least one day of the week.");
      setLoading(false);
      return;
    }

    // You need to ensure generateBulkSlots is imported or passed down
    // Assuming it's imported from the same actions file as createSlot in your original code
    // If not, make sure to import { generateBulkSlots } from "@/actions/schedule";
    // For this snippet to work fully, I'll assume the import exists in the hidden part or is global.
    // Re-importing it here to be safe if this is a copy-paste:
    const { generateBulkSlots } = require("@/actions/schedule");

    const result = await generateBulkSlots(formData);

    setLoading(false);
    if (result?.error) {
      setBulkError(result.error);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {bulkError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
          {bulkError}
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
          Repeat On
        </label>
        <div className="flex justify-between">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, idx) => (
            <label
              key={d}
              className="flex flex-col items-center gap-1 cursor-pointer"
            >
              <input
                type="checkbox"
                name="day"
                value={idx}
                className="w-4 h-4 accent-secondary"
              />
              <span className="text-xs text-gray-600">{d}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            From Time
          </label>
          <input
            type="time"
            name="startTime"
            defaultValue="09:00"
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
            To Time
          </label>
          <input
            type="time"
            name="endTime"
            defaultValue="17:00"
            required
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-secondary text-white py-3 rounded-xl font-bold hover:bg-[#5A7A66] transition-colors flex justify-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" /> : "Generate Slots"}
      </button>
    </form>
  );
}
