"use client";

import { useState } from "react";
import { submitPaymentProof } from "@/actions/dashboard";
import { X, Wallet, CheckCircle2, Copy, Loader2, Send } from "lucide-react";

export default function PaymentModal({ booking, onClose, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const instructions =
    booking.therapist?.payment_instructions ||
    "Please contact the therapist for payment details.";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await submitPaymentProof(formData);
    setIsSubmitting(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="bg-[#F2F5F4] p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-primary flex items-center gap-2">
              <Wallet className="text-secondary" size={20} />
              Complete Payment
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Send proof to confirm your slot.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions Box */}
          <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100">
            <h4 className="text-blue-800 font-bold text-sm mb-2 uppercase tracking-wide">
              Pay To:
            </h4>
            <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">
              {instructions}
            </p>
            {/* Visual cue for UPI */}
            <div className="mt-3 flex gap-2">
              <span className="px-2 py-1 bg-white rounded text-[10px] font-bold text-gray-500 border border-blue-100">
                UPI
              </span>
              <span className="px-2 py-1 bg-white rounded text-[10px] font-bold text-gray-500 border border-blue-100">
                Bank Transfer
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="bookingId" value={booking.$id} />

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Transaction ID / Reference No.
              </label>
              <input
                name="transactionId"
                required
                type="text"
                className="w-full p-3 rounded-xl border border-gray-200 focus:border-secondary outline-none text-sm bg-gray-50 focus:bg-white transition-all"
                placeholder="e.g. UPI Ref: 3049xxxxxxxx"
              />
              <p className="text-xs text-gray-400 mt-2">
                This is used to verify your payment with the therapist.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-secondary hover:bg-[#5A7A66] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Send size={20} />
              )}
              Submit Proof
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
