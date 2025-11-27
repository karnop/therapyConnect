"use client";

import { useState, useEffect } from "react";
import {
  createSlot,
  getMySlots,
  deleteSlot,
  generateBulkSlots,
} from "@/actions/schedule";
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
  differenceInCalendarDays,
} from "date-fns";

export default function SchedulePage() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Local error state

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modal State
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Fetch Data
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

  // Filter slots for the SELECTED DATE
  const daySlots = slots.filter((slot) =>
    isSameDay(parseISO(slot.start_time), selectedDate)
  );

  // Filter slots for the MONTH
  const getSlotsForDay = (date) => {
    return slots.filter((slot) => isSameDay(parseISO(slot.start_time), date));
  };

  // --- HANDLERS ---
  const handleDelete = async (id) => {
    if (confirm("Remove this slot?")) {
      setSlots((prev) => prev.filter((s) => s.$id !== id));
      await deleteSlot(id);
    }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const time = formData.get("time");

    // Construct Date Objects
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const startDateTime = new Date(`${dateStr}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);
    const now = new Date();

    // 1. VALIDATION: Past Date Check
    if (startDateTime < now) {
      setError("You cannot add slots in the past.");
      return;
    }

    // 2. VALIDATION: Overlap Check (Frontend)
    const hasOverlap = daySlots.some((slot) => {
      const slotStart = new Date(slot.start_time);
      const slotEnd = new Date(slot.end_time);
      // Overlap formula
      return startDateTime < slotEnd && endDateTime > slotStart;
    });

    if (hasOverlap) {
      setError("This time overlaps with an existing slot (slots are 1 hour).");
      return;
    }

    // If valid, call server
    const result = await createSlot(formData);
    if (result.error) {
      setError(result.error);
    } else {
      fetchSlots();
      e.target.reset();
    }
  };

  // Disable "Add" button if selected date is strictly in the past (yesterday or before)
  // We allow 'today' because the user might want to add a slot for later today.
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
          {/* Month Nav */}
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

          {/* Grid */}
          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
              <div key={d} className="text-xs font-bold text-gray-400">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((day, idx) => {
              const hasSlots = getSlotsForDay(day).length > 0;
              const isSelected = isSameDay(day, selectedDate);
              // Visual cue for past dates
              const isPast = isBefore(day, startOfToday());

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDate(day);
                    setError(null); // Clear errors on date change
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
                  {/* Dot indicator if slots exist */}
                  {hasSlots && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 bg-green-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* --- RIGHT: TIMELINE VIEW --- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Selected Date Header */}
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
                {daySlots.length} slots open
              </p>
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Slots Grid */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-h-[300px]">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-gray-300" />
              </div>
            ) : daySlots.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {daySlots.map((slot) => (
                  <div
                    key={slot.$id}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-secondary/30 bg-gray-50 hover:bg-white transition-all group"
                  >
                    <span className="font-semibold text-gray-700">
                      {format(parseISO(slot.start_time), "h:mm a")}
                    </span>
                    {slot.is_booked ? (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                        Booked
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDelete(slot.$id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <CalIcon className="mx-auto text-gray-200 mb-2" size={48} />
                <p className="text-gray-400">No slots added for this day.</p>
              </div>
            )}
          </div>

          {/* Quick Add Single Slot */}
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
                className="bg-gray-900 text-white px-6 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 font-medium"
              >
                <Plus size={18} /> Add
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* --- BULK GENERATOR MODAL --- */}
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

// Sub-component for Bulk Form
function BulkGeneratorForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [bulkError, setBulkError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setBulkError(null);

    const formData = new FormData(e.currentTarget);

    // 3. VALIDATION: Check 14 day limit on Frontend
    const start = new Date(formData.get("startDate"));
    const end = new Date(formData.get("endDate"));
    const today = startOfToday();

    // Basic sanity checks
    if (isBefore(start, today)) {
      setBulkError("Start date cannot be in the past.");
      setLoading(false);
      return;
    }

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

    // Handle Checkboxes manually
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
