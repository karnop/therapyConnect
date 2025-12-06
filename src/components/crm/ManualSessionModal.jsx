"use client";

import { useState } from "react";
import { createManualSession } from "@/actions/crm";
import { X, CalendarPlus, Loader2, Save } from "lucide-react";

export default function ManualSessionModal({ clientId, onClose }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    formData.append("clientId", clientId);

    await createManualSession(formData);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative">
        <div className="bg-[#F2F5F4] p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <CalendarPlus className="text-secondary" size={20} />
              Log Past Session
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Add a session that happened outside the app.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Date
              </label>
              <input
                name="date"
                required
                type="date"
                className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-secondary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Time
              </label>
              <input
                name="time"
                required
                type="time"
                className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-secondary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Mode
            </label>
            <select
              name="mode"
              className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-secondary outline-none bg-white"
            >
              <option value="offline">In-Person (Clinic)</option>
              <option value="online">Online / Phone</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Quick Note (Optional)
            </label>
            <textarea
              name="notes"
              rows={2}
              className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-secondary outline-none resize-none"
              placeholder="Brief summary of the session..."
            />
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
            Add to Timeline
          </button>
        </form>
      </div>
    </div>
  );
}
