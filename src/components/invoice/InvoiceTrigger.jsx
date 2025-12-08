"use client";

import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import InvoiceModal from "./InvoiceModal";
import { getInvoiceSettings } from "@/actions/invoice";

export default function InvoiceTrigger({
  booking,
  client,
  therapist,
  variant = "button",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOpen = async (e) => {
    e.preventDefault(); // Prevent link clicks if inside a link
    e.stopPropagation();
    setLoading(true);
    const data = await getInvoiceSettings();
    setSettings(data);
    setLoading(false);
    setIsOpen(true);
  };

  return (
    <>
      {variant === "button" ? (
        <button
          onClick={handleOpen}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 hover:border-secondary hover:text-secondary px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <FileText size={14} />
          )}
          Generate Invoice
        </button>
      ) : (
        // Icon Variant for tight spaces
        <button
          onClick={handleOpen}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-secondary hover:bg-gray-100 rounded-lg transition-all"
          title="Generate Invoice"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <FileText size={16} />
          )}
        </button>
      )}

      {isOpen && (
        <InvoiceModal
          booking={booking}
          client={client}
          therapist={therapist}
          invoiceSettings={settings}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
