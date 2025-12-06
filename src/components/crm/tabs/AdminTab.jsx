import { FileText, Download, Wallet } from "lucide-react";

export default function AdminTab({ history }) {
  // Simple calculation for billing
  const totalPaid =
    history.filter((s) => s.status === "confirmed").length * 2000;
  // Note: hardcoded price for MVP calculation, ideally fetch rate from session

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-2">
      {/* Billing Summary */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Wallet size={18} className="text-gray-400" /> Billing Overview
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 p-4 rounded-xl">
            <span className="text-xs text-green-600 font-bold uppercase">
              Total Revenue
            </span>
            <p className="text-2xl font-bold text-green-800 mt-1">
              ₹{totalPaid.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <span className="text-xs text-gray-500 font-bold uppercase">
              Total Sessions
            </span>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {history.length}
            </p>
          </div>
        </div>
      </div>

      {/* Documents (Placeholder) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText size={18} className="text-gray-400" /> Documents
        </h3>
        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-400 text-sm">No documents uploaded yet.</p>
          <button
            disabled
            className="mt-4 text-secondary text-xs font-bold opacity-50 cursor-not-allowed"
          >
            + Upload PDF (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}
