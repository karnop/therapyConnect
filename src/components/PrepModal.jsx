"use client";

import { useState } from "react";
import { updateBookingPrep } from "@/actions/dashboard";
import { X, Sparkles, Lock, Share2, Loader2, Save } from "lucide-react";

export default function PrepModal({ booking, onClose, onSuccess }) {
  const [isSaving, setIsSaving] = useState(false);

  // Initialize state from props
  const [mood, setMood] = useState(booking.client_mood || 5);
  const [share, setShare] = useState(booking.is_shared || false);
  const [journal, setJournal] = useState(booking.client_journal || "");
  const [intake, setIntake] = useState(booking.client_intake || "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const formData = new FormData();
    formData.append("bookingId", booking.$id);
    formData.append("mood", mood);
    formData.append("journal", journal);
    formData.append("intake", intake);
    if (share) formData.append("isShared", "on");

    await updateBookingPrep(formData);

    setIsSaving(false);
    onSuccess(); // Trigger parent refresh
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="bg-[#F2F5F4] p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
              <Sparkles className="text-secondary" size={20} />
              Session Prep
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Get ready for your session.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 1. Mood Slider */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-4">
              How are you feeling right now?
            </label>
            <div className="flex items-center gap-4">
              <span className="text-2xl">☁️</span>
              <input
                type="range"
                min="1"
                max="10"
                value={mood}
                onChange={(e) => setMood(parseInt(e.target.value))}
                className="w-full accent-secondary h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-2xl">☀️</span>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2 font-medium">
              {mood <= 3 ? "Not great" : mood <= 7 ? "Okay" : "Feeling good"} (
              {mood}/10)
            </p>
          </div>

          {/* 2. Journal / Intake */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                What&apos;s on your mind? (Journal)
              </label>
              <textarea
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-secondary outline-none text-sm bg-gray-50 focus:bg-white transition-all"
                placeholder="I'm feeling anxious about..."
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Focus for this session (Intake)
              </label>
              <input
                value={intake}
                onChange={(e) => setIntake(e.target.value)}
                type="text"
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-secondary outline-none text-sm bg-gray-50 focus:bg-white transition-all"
                placeholder="e.g. Work stress, Relationship issues..."
              />
            </div>
          </div>

          {/* 3. Privacy Toggle */}
          <div className="bg-blue-50 p-4 rounded-xl flex items-center justify-between border border-blue-100">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${
                  share
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {share ? <Share2 size={18} /> : <Lock size={18} />}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">
                  Share with Therapist?
                </p>
                <p className="text-xs text-gray-500">
                  {share
                    ? "Dr. will see these notes."
                    : "These notes are private to you."}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={share}
                onChange={(e) => setShare(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-secondary hover:bg-[#5A7A66] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            Save Preparation
          </button>
        </form>
      </div>
    </div>
  );
}
