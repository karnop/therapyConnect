"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Smile, Frown, Activity, CalendarDays, BookOpen, Send, CheckCircle2 } from "lucide-react";
import { submitBurnoutLog, getCurrentUserProfile } from "@/actions/b2b";
import Link from "next/link";

export default function EmployeeDashboard() {
  const [profileData, setProfileData] = useState(null);
  const [mood, setMood] = useState(5);
  const [burnout, setBurnout] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [department, setDepartment] = useState("Unspecified");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const departments = ["Unspecified", "Engineering", "Sales", "Marketing", "HR", "Operations", "Finance", "Product", "Support"];

  useEffect(() => {
    async function load() {
      const res = await getCurrentUserProfile();
      if (res.success && res.profile.company_id) {
        setProfileData({
          companyId: res.profile.company_id,
          tier: res.tier || "tier1"
        });
      }
    }
    load();
  }, []);

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!profileData?.companyId) {
      alert("Profile loading, please wait...");
      return;
    }
    setIsSubmitting(true);
    const res = await submitBurnoutLog(profileData.companyId, mood, burnout, reviewText, department);
    setIsSubmitting(false);
    if (res.success) {
      setSubmitted(true);
    } else {
      alert(res.error || "Failed to submit. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 font-sans overflow-hidden">

      {/* HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 pb-6 gap-4"
      >
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">
            Welcome back.
          </h1>
          <p className="text-slate-500">Your secure, anonymous wellbeing space.</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-secondary font-bold text-sm uppercase tracking-wider">Corporate Access Active</p>
          <p className="text-slate-400 text-xs mt-1 uppercase">Tier: {profileData?.tier || "loading..."}</p>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: DAILY LOG (HIPAA ANONYMOUS) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-slate-100">
              <Activity size={120} />
            </div>

            <h2 className="text-2xl font-bold mb-4 text-slate-900">Daily Wellbeing Log</h2>
            <p className="text-sm text-slate-500 mb-8 max-w-lg leading-relaxed">
              This data is strictly anonymized. It helps your company understand overall team burnout without ever linking to your identity.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 text-center flex flex-col items-center shadow-inner"
              >
                <CheckCircle2 className="text-emerald-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-emerald-900 mb-2">Log Submitted Safely</h3>
                <p className="text-emerald-700 text-sm">Thank you for sharing your experience today.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleLogSubmit} className="space-y-8 relative z-10">

                {/* MOOD & BURNOUT SLIDERS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <label className="flex justify-between text-sm font-bold text-slate-700 mb-4">
                      <span>How are you feeling?</span>
                      <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{mood}/10</span>
                    </label>
                    <input
                      type="range"
                      min="1" max="10"
                      value={mood}
                      onChange={(e) => setMood(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-xs font-semibold text-slate-400 mt-3 pt-1">
                      <span className="flex items-center gap-1"><Frown size={14} /> Low</span>
                      <span className="flex items-center gap-1">Great <Smile size={14} /></span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <label className="flex justify-between text-sm font-bold text-slate-700 mb-4">
                      <span>Current Burnout Level</span>
                      <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">{burnout}/10</span>
                    </label>
                    <input
                      type="range"
                      min="1" max="10"
                      value={burnout}
                      onChange={(e) => setBurnout(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                    <div className="flex justify-between text-xs font-semibold text-slate-400 mt-3 pt-1">
                      <span>Energized</span>
                      <span>Exhausted</span>
                    </div>
                  </div>
                </div>

                {/* FRUSTRATION / REVIEW TEXT */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Order your thoughts (Frustration Area)
                  </label>
                  <textarea
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Type whatever is on your mind. Vent, complain, or praise. It is completely anonymous."
                    className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary transition resize-none placeholder:text-slate-400 mb-6"
                  />

                  {/* Department Dropdown */}
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    Optional: Your Department <span className="font-normal text-slate-500">(For aggregate trends)</span>
                  </label>
                  <select 
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-slate-800 shadow-sm focus:ring-2 focus:ring-secondary focus:outline-none"
                  >
                    {departments.map(dept => <option key={dept} value={dept}>{dept === "Unspecified" ? "Prefer not to say" : dept}</option>)}
                  </select>
                </div>

                <button
                  disabled={isSubmitting}
                  className="bg-secondary hover:bg-secondary text-white font-bold px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition w-full shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                  type="submit"
                >
                  {isSubmitting ? "Encrypting & Submitting..." : "Submit Anonymous Log"}
                  {!isSubmitting && <Send size={18} />}
                </button>
              </form>
            )}
          </div>
        </motion.div>

        {/* RIGHT COLUMN: ACTION PANELS */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* INSTANT BOOKING WIDGET */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 hover:border-secondary hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-secondary group-hover:scale-110 transition-transform">
              <CalendarDays size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Instant Booking</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Use your company&apos;s pre-paid wellness pool to book a session immediately. No credit card required.
            </p>
            <Link href="/search?corporate=true" className="block w-full">
              <button className="w-full py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold hover:bg-secondary hover:text-white hover:border-secondary transition-colors">
                View Corporate Therapists
              </button>
            </Link>
          </div>

          {/* DIGITAL RESOURCES */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 hover:border-secondary hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-secondary group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Wellness Assessments</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Access the curated library of PDFs and monthly organizational wellness indices.
            </p>
            <button className="w-full py-3 rounded-xl bg-secondary text-white font-bold hover:bg-secondary hover:text-white hover:border-secondary transition-colors shadow-lg shadow-blue-600/20">
              Open Library
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
