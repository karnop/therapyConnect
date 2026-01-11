"use client";

import { useEffect, useState } from "react";
import {
  getInvoiceSettings,
  updateInvoiceSettings,
  getBillableSessions,
} from "@/actions/invoice";
import { getTherapistData } from "@/actions/therapist";
import {
  FileBadge,
  Wallet,
  Save,
  Loader2,
  FileText,
  FilePlus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import InvoiceModal from "@/components/invoice/InvoiceModal";
import { format, parseISO, isSameDay, addDays, subDays } from "date-fns";

export default function InvoicesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({});
  const [allSessions, setAllSessions] = useState([]); // Store all fetched sessions
  const [filteredSessions, setFilteredSessions] = useState([]); // Store daily view
  const [therapistProfile, setTherapistProfile] = useState(null);

  // Date State
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showCustomModal, setShowCustomModal] = useState(false);

  useEffect(() => {
    const init = async () => {
      const [invSettings, billable, tData] = await Promise.all([
        getInvoiceSettings(),
        getBillableSessions(),
        getTherapistData(),
      ]);

      setSettings(invSettings || {});
      setAllSessions(billable || []);
      if (tData) setTherapistProfile(tData.profile);

      setLoading(false);
    };
    init();
  }, []);

  // Filter sessions whenever selectedDate or allSessions changes
  useEffect(() => {
    const daily = allSessions.filter((session) =>
      isSameDay(parseISO(session.start_time), selectedDate)
    );
    setFilteredSessions(daily);
  }, [selectedDate, allSessions]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    await updateInvoiceSettings(formData);
    setSaving(false);
    alert("Invoice settings saved!");
  };

  // Date Nav Handlers
  const prevDay = () => setSelectedDate((d) => subDays(d, 1));
  const nextDay = () => setSelectedDate((d) => addDays(d, 1));

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-secondary" />
      </div>
    );

  return (
    <div className="pb-20 space-y-8">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Invoices & Billing
          </h1>
          <p className="text-gray-500">
            Configure your legal details and generate bills.
          </p>
        </div>
        <button
          onClick={() => setShowCustomModal(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <FilePlus size={18} /> Create Custom Invoice
        </button>
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
                  Business Address (For Bill Header)
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

        {/* --- RIGHT: DAILY BILLING VIEW --- */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <FileText size={18} className="text-gray-400" /> Daily Billing
            </h3>

            {/* Date Navigator */}
            <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl">
              <button
                onClick={prevDay}
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 transition-all"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="relative">
                <div className="flex items-center gap-2 px-2 text-sm font-bold text-gray-700 min-w-[120px] justify-center cursor-pointer">
                  <CalendarIcon size={14} className="text-secondary" />
                  {format(selectedDate, "MMM dd, yyyy")}
                </div>
                {/* Hidden native date picker overlay for quick jump */}
                <input
                  type="date"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) =>
                    e.target.value && setSelectedDate(new Date(e.target.value))
                  }
                />
              </div>

              <button
                onClick={nextDay}
                className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-gray-500 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {filteredSessions.length > 0 ? (
            <div className="space-y-3">
              {filteredSessions.map((session) => (
                <div
                  key={session.$id}
                  className="p-4 rounded-xl border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                >
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {session.clientName}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      {format(parseISO(session.start_time), "h:mm a")}
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className="capitalize">{session.mode}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedBooking(session)}
                    className="bg-white border border-gray-200 text-gray-600 hover:text-secondary hover:border-secondary px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    Generate
                  </button>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-100 mt-4 text-center">
                <p className="text-xs text-gray-400">
                  Showing {filteredSessions.length} billable session(s)
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm text-gray-300">
                <CalendarIcon size={20} />
              </div>
              <p className="text-gray-500 text-sm font-medium">
                No sessions found.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                There were no confirmed bookings on <br />{" "}
                {format(selectedDate, "MMMM do")}.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Modal (From History) */}
      {selectedBooking && (
        <InvoiceModal
          booking={selectedBooking}
          therapist={therapistProfile}
          invoiceSettings={settings}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {/* Custom Invoice Modal */}
      {showCustomModal && (
        <InvoiceModal
          isCustom={true}
          therapist={therapistProfile}
          invoiceSettings={settings}
          onClose={() => setShowCustomModal(false)}
        />
      )}
    </div>
  );
}
