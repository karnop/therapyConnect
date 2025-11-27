import Link from "next/link";
import { Check, ArrowRight, LayoutDashboard, Home } from "lucide-react";

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-[2rem] shadow-2xl border border-gray-100 p-8 md:p-12 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>

        {/* Animated Checkmark */}
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-300">
          <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
            <Check className="text-white" size={32} strokeWidth={4} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-primary mb-3 tracking-tight">
          Booking Confirmed!
        </h1>
        <p className="text-gray-500 mb-10 leading-relaxed text-lg">
          You're all set. We've sent a confirmation to your email. You can find
          the session link and details in your dashboard.
        </p>

        <div className="space-y-4">
          <Link href="/dashboard">
            <button className="w-full bg-secondary hover:bg-[#5A7A66] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-3 group">
              <LayoutDashboard size={20} />
              Go to Dashboard
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </Link>

          <Link href="/">
            <button className="w-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2">
              <Home size={20} /> Return Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
