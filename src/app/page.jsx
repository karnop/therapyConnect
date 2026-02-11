"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  ArrowRight,
  Shield,
  Video,
  CheckCircle2,
  Play,
  Star,
  Calendar,
} from "lucide-react";
import Link from "next/link";

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const floatAnimation = {
  y: [0, -15, 0],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

const floatAnimationDelayed = {
  y: [0, 15, 0],
  transition: {
    duration: 7,
    repeat: Infinity,
    ease: "easeInOut",
    delay: 1,
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] overflow-x-hidden selection:bg-secondary/20">
      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Background Texture (Dot Grid) */}
        <div
          className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#CBD5E1 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        {/* Abstract Background Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] mix-blend-multiply animate-blob"></div>
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-orange-100/40 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-2000"></div>
        </div>

        {/* --- ORBIT ELEMENTS (Floating Cards - Desktop Only) --- */}
        <div className="hidden lg:block absolute inset-0 z-10 pointer-events-none">
          {/* Left Card: Therapist Profile */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute top-1/3 left-4 xl:left-12"
          >
            <motion.div
              animate={floatAnimation}
              className="bg-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 backdrop-blur-sm flex items-center gap-4 w-64 pointer-events-auto hover:scale-105 transition-transform cursor-default"
            >
              <div className="relative w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                {/* Placeholder Avatar */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100"></div>
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">Dr. Manav M.</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Star size={10} className="text-yellow-400 fill-yellow-400" />
                  Anxiety Specialist
                </p>
              </div>
              <div className="ml-auto w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center text-secondary">
                <Play size={12} fill="currentColor" />
              </div>
            </motion.div>
          </motion.div>

          {/* Right Card: Success Notification */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="absolute top-1/4 right-4 xl:right-12"
          >
            <motion.div
              animate={floatAnimationDelayed}
              className="bg-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 backdrop-blur-sm flex items-center gap-4 w-auto pointer-events-auto hover:scale-105 transition-transform cursor-default"
            >
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">
                  Session Confirmed
                </p>
                <p className="text-xs text-gray-500">Tomorrow, 4:00 PM</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Left: Trust Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="absolute bottom-20 left-20 xl:left-32"
          >
            <motion.div
              animate={floatAnimationDelayed}
              className="bg-white/80 px-4 py-2 rounded-full shadow-sm border border-gray-100 text-xs font-medium text-gray-500 flex items-center gap-2 backdrop-blur-md"
            >
              <Shield size={14} className="text-secondary" /> 100% Private &
              Secure
            </motion.div>
          </motion.div>
        </div>

        {/* CENTER CONTENT */}
        <div className="relative z-20 flex flex-col items-center text-center max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm mb-8 hover:border-secondary/30 transition-colors cursor-default"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold text-gray-600 tracking-wide uppercase">
              Live in India
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-bold text-primary tracking-tight mb-6"
          >
            Find your{" "}
            <span className="text-secondary italic font-serif">safe space</span>{" "}
            <br className="hidden md:block" />
            without the chaos.
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-lg md:text-xl text-gray-500 max-w-2xl mb-12 leading-relaxed"
          >
            Connect with verified therapists who understand your culture,
            language, and life. Online from home, or in-person near the Metro.
          </motion.p>

          {/* SUPER SEARCH CAPSULE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full max-w-3xl relative z-30"
          >
            <HeroSearchBar />
          </motion.div>

          {/* TRUST BAR */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-16 pt-8 border-t border-gray-200/60 w-full flex flex-wrap justify-center gap-8 md:gap-16 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500"
          >
            {/* Dummy Logos / Trust Signals */}
            <div className="flex items-center gap-2 font-semibold text-sm text-gray-600">
              <Shield size={18} /> RCI Registered
            </div>
            <div className="flex items-center gap-2 font-semibold text-sm text-gray-600">
              <Shield size={18} /> HIPAA Compliant
            </div>
            <div className="flex items-center gap-2 font-semibold text-sm text-gray-600">
              <Shield size={18} /> 100% Private
            </div>
            <div className="flex items-center gap-2 font-semibold text-sm text-gray-600">
              <Shield size={18} /> Verified Pros
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. CONCERNS GRID (Browse by feeling) */}
      <section className="py-20 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              What&apos;s on your mind?
            </h2>
            <p className="text-gray-500">
              You don&apos;t need a diagnosis to start. Just start where you
              are.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {[
              {
                label: "Anxiety",
                icon: "🌪️",
                color: "bg-blue-50 text-blue-600",
              },
              {
                label: "Work Stress",
                icon: "💼",
                color: "bg-orange-50 text-orange-600",
              },
              {
                label: "Relationships",
                icon: "❤️",
                color: "bg-red-50 text-red-600",
              },
              {
                label: "Depression",
                icon: "☁️",
                color: "bg-gray-100 text-gray-600",
              },
              {
                label: "Grief",
                icon: "🕯️",
                color: "bg-purple-50 text-purple-600",
              },
              {
                label: "Self Esteem",
                icon: "✨",
                color: "bg-yellow-50 text-yellow-600",
              },
              {
                label: "Trauma",
                icon: "❤️‍🩹",
                color: "bg-rose-50 text-rose-600",
              },
              {
                label: "Sleep",
                icon: "🌙",
                color: "bg-indigo-50 text-indigo-600",
              },
            ].map((item) => (
              <Link href={`/search?query=${item.label}`} key={item.label}>
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  className="p-6 rounded-3xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all cursor-pointer group bg-[#FAFAF8] hover:bg-white"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 ${item.color} group-hover:scale-110 transition-transform`}
                  >
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-primary">
                    {item.label}
                  </h3>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. VIBE MATCH FEATURE */}
      <section className="py-24 bg-[#2D2D2D] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 mb-6 backdrop-blur-md">
                <Video size={16} className="text-blue-300" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  The Vibe Check
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Don&apos;t just read a bio. <br />
                <span className="text-blue-300">Watch them speak.</span>
              </h2>
              <p className="text-white/60 text-lg mb-8 leading-relaxed">
                Therapy is about connection. We require every therapist to
                upload a video introduction so you can gauge their energy,
                voice, and vibe before you ever spend a rupee.
              </p>
              <Link href="/search">
                <button className="bg-white text-gray-900 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors inline-flex items-center gap-2">
                  Browse Video Profiles <ArrowRight size={18} />
                </button>
              </Link>
            </div>

            <div className="order-1 md:order-2 relative">
              {/* Mock Video Card */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-4 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500"
              >
                <div className="aspect-[4/5] bg-gray-200 rounded-2xl relative overflow-hidden group">
                  {/* Placeholder Abstract Image instead of video */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center cursor-pointer group-hover:scale-110 transition-transform">
                      <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[20px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent text-white">
                    <p className="font-bold text-lg">Dr. Ananya Gupta</p>
                    <p className="text-xs opacity-80">
                      Clinical Psychologist • 15s Intro
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HYBRID PROMISE */}
      <section className="py-24 bg-[#F2F5F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Therapy that fits your life.
            </h2>
            <p className="text-gray-500 text-lg">
              Whether you prefer the comfort of your couch or a quiet clinic, we
              have verified options for both.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm flex flex-col items-start"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                <Video size={32} />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-3">
                Online Sessions
              </h3>
              <p className="text-gray-500 mb-8 flex-1 leading-relaxed">
                Secure, encrypted video calls. Perfect for busy professionals or
                those who prefer privacy. Join from anywhere in Delhi.
              </p>
              <Link
                href="/search?mode=online"
                className="font-bold text-blue-600 flex items-center gap-2 hover:gap-4 transition-all"
              >
                Find Online Therapists <ArrowRight size={18} />
              </Link>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm flex flex-col items-start"
            >
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
                <MapPin size={32} />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-3">
                In-Person Clinics
              </h3>
              <p className="text-gray-500 mb-8 flex-1 leading-relaxed">
                Verified clinics near Metro stations. Filter by &apos;Near Hauz
                Khas&apos; or &apos;South Delhi&apos; to find a space accessible
                to you.
              </p>
              <Link
                href="/search?mode=offline"
                className="font-bold text-orange-600 flex items-center gap-2 hover:gap-4 transition-all"
              >
                Find Clinics Nearby <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. CTA SECTION */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-secondary rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to talk?
            </h2>
            <p className="text-white/80 text-xl max-w-2xl mx-auto mb-10">
              The first step is often the hardest. We&apos;ve made it as simple
              as possible. No phone calls, no waiting lists.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/search">
                <button className="bg-white text-secondary px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors w-full sm:w-auto">
                  Book First Session
                </button>
              </Link>
              <Link href="/about">
                <button className="bg-transparent border border-white/30 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors w-full sm:w-auto">
                  How it Works
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// --- SUB-COMPONENT: HERO SEARCH BAR ---
function HeroSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("all"); // 'online', 'offline', 'all'

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.append("query", query);
    if (mode !== "all") params.append("mode", mode);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white p-2 rounded-full shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col md:flex-row gap-2"
    >
      {/* Input 1: Keyword */}
      <div className="flex-1 relative px-4 md:border-r border-gray-100">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2 mb-0.5 ml-2">
          Concern
        </label>
        <div className="flex items-center gap-2">
          <Search size={18} className="text-secondary shrink-0" />
          <input
            type="text"
            placeholder="Anxiety, Stress, etc."
            className="w-full py-2 bg-transparent outline-none text-gray-800 font-medium placeholder:font-normal"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Input 2: Mode Dropdown */}
      <div className="flex-1 relative px-4">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-2 mb-0.5 ml-2">
          Preference
        </label>
        <div className="flex items-center gap-2">
          {mode === "online" ? (
            <Video size={18} className="text-blue-500 shrink-0" />
          ) : (
            <MapPin size={18} className="text-orange-500 shrink-0" />
          )}
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="w-full py-2 bg-transparent outline-none text-gray-800 font-medium cursor-pointer appearance-none"
          >
            <option value="all">Any Location</option>
            <option value="online">Online Video</option>
            <option value="offline">In-Person Clinic</option>
          </select>
        </div>
      </div>

      {/* Search Button */}
      <button
        type="submit"
        className="bg-secondary hover:bg-[#5A7A66] text-white rounded-full px-8 py-3 md:py-0 font-bold transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 group"
      >
        <Search
          size={20}
          className="group-hover:scale-110 transition-transform"
        />
        <span className="md:hidden">Search</span>
      </button>
    </form>
  );
}
