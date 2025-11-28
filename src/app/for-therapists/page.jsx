"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { submitTherapistApplication } from "@/actions/marketing";
import {
  CheckCircle2,
  DollarSign,
  Calendar,
  Shield,
  ArrowRight,
  Loader2,
  Users,
} from "lucide-react";

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function ForTherapistsPage() {
  const [status, setStatus] = useState("idle"); // idle, submitting, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    const formData = new FormData(e.currentTarget);
    const result = await submitTherapistApplication(formData);

    if (result.success) {
      setStatus("success");
      e.target.reset();
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* 1. HERO SECTION */}
      <section className="bg-[#2D2D2D] text-white pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider mb-6 text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Accepting Partners in Delhi NCR
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Focus on healing. <br />
              <span className="text-secondary italic">We handle the rest.</span>
            </h1>
            <p className="text-lg text-white/60 mb-8 max-w-xl leading-relaxed">
              The all-in-one practice management platform for independent
              therapists. Zero commissions. Guaranteed payments. Direct client
              connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#apply"
                className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                Join as Partner <ArrowRight size={18} />
              </a>
              <div className="flex items-center gap-4 px-6 text-sm font-medium text-white/50">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-400" /> No Fees
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-400" /> Verified
                  Clients
                </span>
              </div>
            </div>
          </motion.div>

          {/* Hero Visual / Form Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-3xl"></div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-3xl shadow-2xl relative">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-xs text-white/50 uppercase font-bold">
                    Projected Earnings
                  </p>
                  <p className="text-3xl font-bold">₹85,000</p>
                </div>
                <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-lg text-xs font-bold">
                  +12% vs Last Month
                </div>
              </div>
              {/* Mock Bars */}
              <div className="flex items-end gap-3 h-32 mb-4">
                {[40, 60, 45, 70, 50, 80, 65].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-white/10 rounded-t-lg hover:bg-secondary/80 transition-colors"
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>
              <div className="bg-white/10 p-4 rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center font-bold">
                  R
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">New Booking Request</p>
                  <p className="text-xs text-white/50">
                    Rahul S. • Anxiety • 4:00 PM
                  </p>
                </div>
                <button className="bg-white text-black px-3 py-1 rounded-lg text-xs font-bold">
                  Accept
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. VALUE PROPS */}
      <section className="py-24 px-4 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why independent therapists choose us
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              We are not an agency. We are a technology partner that gives you
              the tools to run your own practice efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: DollarSign,
                title: "Zero Commissions",
                desc: "You keep 100% of your session fees. We charge a simple monthly SaaS fee (Free during Beta).",
              },
              {
                icon: Shield,
                title: "Guaranteed Payments",
                desc: "Stop chasing clients for UPI transfers. Our 'Request & Pay' flow ensures you are paid before the session starts.",
              },
              {
                icon: Calendar,
                title: "Smart Scheduling",
                desc: "Set your hours for Online and In-Person clinics separately. Syncs automatically to prevent double bookings.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-14 h-14 bg-[#F2F5F4] rounded-2xl flex items-center justify-center text-secondary mb-6">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. APPLICATION FORM */}
      <section id="apply" className="py-24 px-4 bg-white relative">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-secondary/5 to-[#F2F5F4] rounded-[3rem] p-8 md:p-16 border border-secondary/10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Join the Partner Network
            </h2>
            <p className="text-gray-500">
              We are currently onboarding verified therapists in Delhi NCR for
              our Early Access program.
            </p>
          </div>

          {status === "success" ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Application Received!
              </h3>
              <p className="text-green-700">
                We will verify your details and contact you within 24 hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="max-w-xl mx-auto space-y-6"
            >
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  name="name"
                  required
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none"
                  placeholder="Dr. Aditi Sharma"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    name="email"
                    required
                    type="email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none"
                    placeholder="doctor@example.com"
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
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  name="experience"
                  required
                  type="number"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none"
                  placeholder="e.g. 5"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  LinkedIn or Profile URL
                </label>
                <input
                  name="linkedin"
                  required
                  type="url"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-secondary hover:bg-[#5A7A66] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
              >
                {status === "submitting" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Submit Application"
                )}
              </button>

              <p className="text-xs text-center text-gray-400">
                By submitting, you agree to our Terms of Service. Verification
                required.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
