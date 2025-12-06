"use client";

import { useState, useEffect } from "react";
import { createManualBooking } from "@/actions/schedule";
import { getMyClients } from "@/actions/crm";
import { X, CalendarPlus, Loader2, Save, User } from "lucide-react";

export default function CreateBookingModal({ onClose, onSuccess }) {
  const [isSaving, setIsSaving] = useState(false);
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);

  // Fetch clients for the dropdown
  useEffect(() => {
    getMyClients().then((data) => {
      setClients(data);
      setLoadingClients(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);

    const result = await createManualBooking(formData);

    setIsSaving(false);

    if (result?.error) {
      alert(result.error);
    } else {
      onSuccess(); // Refresh parent
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative">
        <div className="bg-[#F2F5F4] p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <CalendarPlus className="text-secondary" size={20} />
              New Appointment
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Book a slot for a client manually.
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
          {/* Client Dropdown */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Select Client
            </label>
            {loadingClients ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 p-3 border border-gray-100 rounded-xl bg-gray-50">
                <Loader2 className="animate-spin" size={16} /> Loading
                clients...
              </div>
            ) : clients.length > 0 ? (
              <div className="relative">
                <User
                  className="absolute left-3 top-3.5 text-gray-400"
                  size={18}
                />
                <select
                  name="clientId"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:border-secondary outline-none bg-white appearance-none cursor-pointer"
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name} (
                      {c.source === "offline" ? "Offline" : "Online"})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-xl">
                No clients found. Add a client in the "My Clients" page first.
              </div>
            )}
          </div>

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

          <button
            type="submit"
            disabled={isSaving || clients.length === 0}
            className="w-full bg-secondary hover:bg-[#5A7A66] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
}
