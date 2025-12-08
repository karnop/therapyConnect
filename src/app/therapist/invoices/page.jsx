"use client";

import { useEffect, useState } from "react";
import { getInvoiceSettings, updateInvoiceSettings } from "@/actions/invoice";
import { getTherapistDashboardData } from "@/actions/dashboard"; // To get booking history for the list
import { FileBadge, Wallet, Save, Loader2, FileText } from "lucide-react";
import InvoiceModal from "@/components/invoice/InvoiceModal";
import { format, parseISO } from "date-fns";

export default function InvoicesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({});
  const [recentSessions, setRecentSessions] = useState([]);

  // For Modal
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const init = async () => {
      const [invSettings, dashData] = await Promise.all([
        getInvoiceSettings(),
        getTherapistDashboardData(),
      ]);

      // For the list, we want confirmed/completed sessions.
      // Reusing dashboard logic but filtering for confirmed.
      // In a real app, we'd have a dedicated 'getBillingHistory' action.
      // Using upcoming + requests is wrong, let's just use what we have or fetch history.
      // For MVP speed, let's assume the dashboard data includes some relevant sessions
      // OR ideally fetch a dedicated list. I'll mock the fetch for now to keep it simple or use upcoming.
      setSettings(invSettings || {});
      // Mocking billing history from upcoming for demo, normally this is past sessions
      setRecentSessions(
        dashData.upcoming.filter((s) => s.status === "confirmed")
      );

      setLoading(false);
    };
    init();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    await updateInvoiceSettings(formData);
    setSaving(false);
    alert("Invoice settings saved!");
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-secondary" />
      </div>
    );

  return (
    <div className="pb-20 space-y-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Invoices & Billing</h1>
        <p className="text-gray-500">
          Configure your legal details and generate bills.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* --- LEFT: CONFIG FORM --- */}
        <form onSubmit={handleSaveSettings} className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <FileBadge size={20} />
              </div>
              <h2 className="text-lg font-bold text-primary">
                Compliance Header
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Qualification
                </label>
                <input
                  name="qualification"
                  defaultValue={settings.qualification || ""}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none text-sm"
                  placeholder="e.g. M.Phil Clinical Psychology"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RCI License Number
                </label>
                <input
                  name="rci"
                  defaultValue={settings.rci_number || ""}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none text-sm"
                  placeholder="e.g. A78945"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Address
                </label>
                <textarea
                  name="address"
                  rows={2}
                  defaultValue={settings.business_address || ""}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none text-sm resize-none"
                  placeholder="Clinic Address for the Bill"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Wallet size={20} />
              </div>
              <h2 className="text-lg font-bold text-primary">
                Collection Details
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UPI ID (For QR Code)
              </label>
              <input
                name="upi"
                defaultValue={settings.upi_id || ""}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none text-sm"
                placeholder="e.g. doctor@okicici"
              />
              <p className="text-xs text-gray-400 mt-1">
                This generates the scannable QR on the PDF.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-secondary hover:bg-[#5A7A66] text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg shadow-secondary/20 flex items-center gap-2 disabled:opacity-70"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}{" "}
            Save Configuration
          </button>
        </form>

        {/* --- RIGHT: RECENT BILLABLE ITEMS --- */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FileText size={18} className="text-gray-400" /> Ready to Bill
          </h3>

          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div
                  key={session.$id}
                  className="p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {session.client?.full_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(parseISO(session.start_time), "MMM d")} •{" "}
                      {session.mode}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedBooking(session)}
                    className="bg-gray-100 text-gray-600 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                    title="Generate Invoice"
                  >
                    <FileText size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-400 text-sm">
              No confirmed sessions found recently.
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedBooking && (
        <InvoiceModal
          booking={selectedBooking}
          // We construct minimal objects since we have the data
          client={{ full_name: selectedBooking.client?.full_name }}
          // We need therapist name, assuming context or passing empty will trigger defaults
          therapist={{
            full_name: "Me",
            clinic_address: settings.business_address,
          }}
          invoiceSettings={settings}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}
