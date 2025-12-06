"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Calendar,
  Video,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Sparkles,
  Plus,
} from "lucide-react";
import { updateSessionNote } from "@/actions/crm";
import ManualSessionModal from "@/components/crm/ManualSessionModal";

export default function TimelineTab({ history, clientId }) {
  // NOTE: Added clientId prop
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2 relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800 text-lg">Session History</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-white border border-gray-200 text-gray-600 hover:text-secondary hover:border-secondary px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
        >
          <Plus size={16} /> Log Session
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm">No sessions recorded yet.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-secondary text-xs font-bold mt-2 hover:underline"
          >
            Log your first session manually
          </button>
        </div>
      ) : (
        <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 pb-12">
          {history.map((session) => (
            <TimelineItem key={session.$id} session={session} />
          ))}
        </div>
      )}

      {showAddModal && (
        <ManualSessionModal
          clientId={clientId}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}

function TimelineItem({ session }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [privateNote, setPrivateNote] = useState(session.private_note || "");
  const [isSaving, setIsSaving] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await updateSessionNote(session.$id, "private_note", privateNote);
    setIsSaving(false);
  };

  return (
    <div className="relative pl-8 group">
      {/* Timeline Dot */}
      <div
        className={`absolute -left-[9px] top-0 w-5 h-5 rounded-full border-4 transition-colors ${
          session.payment_id === "offline_log"
            ? "bg-white border-gray-400"
            : "bg-white border-secondary"
        }`}
      ></div>

      <div
        className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
          isExpanded
            ? "border-secondary/30 ring-1 ring-secondary/10"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        {/* Header */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors gap-2"
        >
          <div>
            <h4 className="font-bold text-gray-900">
              {format(parseISO(session.start_time), "EEEE, MMMM do, yyyy")}
            </h4>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Calendar size={12} />{" "}
                {format(parseISO(session.start_time), "h:mm a")}
              </span>
              <span className="flex items-center gap-1 capitalize">
                {session.mode === "online" ? (
                  <Video size={12} />
                ) : (
                  <MapPin size={12} />
                )}
                {session.mode}
              </span>
              {session.payment_id === "offline_log" && (
                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">
                  Manual Log
                </span>
              )}
            </div>
          </div>

          {session.client_mood && (
            <div className="text-right flex items-center gap-2 sm:block bg-secondary/5 px-3 py-1 rounded-lg sm:bg-transparent sm:p-0">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mr-2 sm:mr-0">
                Mood
              </span>
              <span className="font-bold text-secondary text-lg">
                {session.client_mood}/10
              </span>
            </div>
          )}
        </div>

        {/* Expanded Notes */}
        {isExpanded && (
          <div className="border-t border-gray-100 p-6 bg-gray-50/50 space-y-6 animate-in slide-in-from-top-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <Lock size={12} /> Private Clinical Note
                </label>
                <button
                  onClick={() => setShowPrivate(!showPrivate)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title={showPrivate ? "Hide Note" : "Reveal Note"}
                >
                  {showPrivate ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={privateNote}
                  onChange={(e) => setPrivateNote(e.target.value)}
                  className={`w-full p-4 rounded-xl border border-gray-200 focus:border-secondary outline-none text-sm leading-relaxed transition-all ${
                    !showPrivate
                      ? "blur-sm select-none pointer-events-none opacity-50"
                      : "bg-white"
                  }`}
                  placeholder="Enter clinical observations here..."
                  rows={4}
                />
                {!showPrivate && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => setShowPrivate(true)}
                      className="bg-white/80 border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-white backdrop-blur-sm"
                    >
                      <Eye size={16} className="inline mr-2" /> Click to Reveal
                    </button>
                  </div>
                )}
              </div>

              {showPrivate && (
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="text-secondary hover:text-primary text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    {isSaving ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Save size={12} />
                    )}{" "}
                    Save Note
                  </button>
                </div>
              )}
            </div>

            {(session.client_journal || session.client_intake) && (
              <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                <div className="flex items-center gap-2 text-blue-600 mb-3 text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={12} /> Client Prep Data
                </div>
                {session.client_intake && (
                  <div className="mb-3">
                    <span className="text-gray-400 text-xs uppercase block mb-1">
                      Focus
                    </span>
                    <p className="text-sm text-gray-800 font-medium">
                      {session.client_intake}
                    </p>
                  </div>
                )}
                {session.client_journal && (
                  <div>
                    <span className="text-gray-400 text-xs uppercase block mb-1">
                      Journal
                    </span>
                    <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
                      "{session.client_journal}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
