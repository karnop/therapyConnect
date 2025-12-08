"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";
import { format } from "date-fns";
import {
  X,
  Download,
  FileText,
  Loader2,
  ShieldCheck,
  FileCheck,
} from "lucide-react";

export default function InvoiceModal({
  booking,
  client,
  therapist,
  invoiceSettings,
  onClose,
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [useInitials, setUseInitials] = useState(false);
  const [serviceName, setServiceName] = useState("Psychotherapy Session");

  const rci = invoiceSettings?.rci_number || "Pending";
  const qual = invoiceSettings?.qualification || "Clinical Psychologist";
  const address =
    invoiceSettings?.business_address ||
    therapist.clinic_address ||
    "Delhi NCR";
  const upiId = invoiceSettings?.upi_id;

  // FIX: Ensure Therapist Name is real
  const therapistName =
    therapist.full_name && therapist.full_name !== "Me (Therapist)"
      ? therapist.full_name
      : "Dr. Therapist"; // Fallback

  const generatePDF = async () => {
    setIsGenerating(true);
    const doc = new jsPDF();

    const invoiceDate = new Date();
    const invoiceNo = `INV-${format(invoiceDate, "yyyyMMdd")}-${booking.$id
      .substring(0, 4)
      .toUpperCase()}`;
    const clientName = useInitials
      ? client.full_name
          .split(" ")
          .map((n) => n[0])
          .join(".")
      : client.full_name;

    // --- DESIGN SYSTEM ---
    const primaryColor = [107, 142, 120]; // #6B8E78 (Sage Green)
    const grayColor = [100, 100, 100];
    const lightGray = [245, 245, 245];

    // --- 1. HEADER (Green Bar) ---
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 40, "F"); // Full width header

    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, "bold");
    doc.text("INVOICE", 20, 25);

    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(`Receipt #${invoiceNo}`, 190, 25, { align: "right" });

    // --- 2. THERAPIST INFO ---
    let y = 60;
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "bold");
    doc.text(therapistName, 20, y);

    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.setFont(undefined, "normal");
    doc.text(qual, 20, y);
    y += 5;
    doc.text(`RCI License: ${rci}`, 20, y);
    y += 5;
    // Handle multi-line address
    const splitAddress = doc.splitTextToSize(address, 80);
    doc.text(splitAddress, 20, y);

    // --- 3. PATIENT INFO (Right Side) ---
    y = 60;
    doc.setFontSize(10);
    doc.setTextColor(...grayColor);
    doc.text("Bill To:", 140, y);

    y += 6;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "bold");
    doc.text(clientName, 140, y);

    y += 6;
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.setTextColor(...grayColor);
    doc.text(`Date: ${format(invoiceDate, "dd MMM yyyy")}`, 140, y);

    // --- 4. TABLE ---
    y = 100;

    // Header Row
    doc.setFillColor(...lightGray);
    doc.rect(20, y, 170, 10, "F");

    doc.setFont(undefined, "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Service", 25, y + 6);
    doc.text("Session Date", 110, y + 6);
    doc.text("Amount", 185, y + 6, { align: "right" });

    // Data Row
    y += 18;
    doc.setFont(undefined, "normal");
    doc.text(serviceName, 25, y);
    doc.text(format(new Date(booking.start_time), "dd MMM yyyy"), 110, y);
    const amount = booking.amount || 2000;
    doc.text(`INR ${amount}`, 185, y, { align: "right" });

    // Line
    y += 10;
    doc.setDrawColor(220, 220, 220);
    doc.line(20, y, 190, y);

    // Total
    y += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Total", 140, y);
    doc.text(`INR ${amount}`, 185, y, { align: "right" });

    // --- 5. QR CODE ---
    if (upiId) {
      y += 20;
      try {
        const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
          therapistName
        )}&am=${amount}&cu=INR`;
        const qrDataUrl = await QRCode.toDataURL(upiString, { width: 100 });
        doc.addImage(qrDataUrl, "PNG", 20, y, 30, 30);

        doc.setFontSize(9);
        doc.setTextColor(...grayColor);
        doc.setFont(undefined, "normal");
        doc.text("Scan to Pay", 20, y + 35);
        doc.text(`UPI: ${upiId}`, 20, y + 40);
      } catch (e) {
        console.error(e);
      }
    }

    // --- 6. FOOTER ---
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "This is a computer-generated invoice. Not valid for medico-legal purposes unless signed.",
      105,
      280,
      { align: "center" }
    );
    doc.text("Generated via TherapyConnect", 105, 285, { align: "center" });

    doc.save(`${invoiceNo}.pdf`);
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative">
        <div className="bg-[#2D2D2D] p-6 flex justify-between items-center text-white">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileCheck size={20} className="text-secondary" />
              Professional Invoice
            </h3>
            <p className="text-xs text-white/60 mt-1">
              Generate a compliant PDF for your client.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {(!rci || !upiId) && (
            <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 flex gap-3 text-sm text-yellow-800">
              <ShieldCheck className="shrink-0" size={18} />
              <p>
                Settings incomplete (RCI/UPI missing).{" "}
                <a href="/therapist/settings" className="font-bold underline">
                  Update
                </a>
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Service Description
              </label>
              <input
                type="text"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:border-secondary outline-none"
              />
            </div>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={useInitials}
                onChange={(e) => setUseInitials(e.target.checked)}
                className="w-5 h-5 accent-secondary"
              />
              <div>
                <span className="block text-sm font-bold text-gray-700">
                  Anonymize Client
                </span>
                <span className="block text-xs text-gray-500">
                  Use initials (e.g. &apos;R.S.&apos;) on bill.
                </span>
              </div>
            </label>
          </div>

          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="w-full bg-secondary hover:bg-[#5A7A66] text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Download size={20} />
            )}{" "}
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
