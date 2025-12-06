"use client";

import { X, ClipboardList, BookOpen } from "lucide-react";

export function HomeworkModal({ homeworkItems, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative">
        <div className="bg-[#F2F5F4] p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <ClipboardList className="text-secondary" size={20} /> My Homework
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {homeworkItems.length > 0 ? (
            homeworkItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-100 p-4 rounded-2xl shadow-sm"
              >
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  From {item.therapistName}
                </p>
                <div className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">
                  {item.tasks}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">
              No homework assigned yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function NotesModal({ booking, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative">
        <div className="bg-blue-50 p-6 border-b border-blue-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
            <BookOpen className="text-blue-600" size={20} /> Session Summary
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-full text-blue-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Notes from {booking.therapist?.full_name}
          </p>
          <div className="text-gray-700 text-base leading-relaxed whitespace-pre-line">
            {booking.shared_summary || "No summary provided for this session."}
          </div>
        </div>
      </div>
    </div>
  );
}
