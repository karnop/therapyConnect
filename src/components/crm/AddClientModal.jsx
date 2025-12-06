"use client";

import { useState } from "react";
import { createOfflineClient } from "@/actions/crm";
import { X, UserPlus, Loader2, Save } from "lucide-react";

export default function AddClientModal({ onClose }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    await createOfflineClient(formData);
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="bg-[#F2F5F4] p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <UserPlus className="text-secondary" size={20} />
              Add Offline Client
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Add a client from your private practice.
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
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Client Name
            </label>
            <input
              name="name"
              required
              type="text"
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-secondary outline-none text-sm transition-all"
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              name="phone"
              required
              type="tel"
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-secondary outline-none text-sm transition-all"
              placeholder="+91 9876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email (Optional)
            </label>
            <input
              name="email"
              type="email"
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-secondary outline-none text-sm transition-all"
              placeholder="client@example.com"
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
            Add to My List
          </button>
        </form>
      </div>
    </div>
  );
}
