"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  ShieldCheck, 
  BarChart3, 
  ArrowRight, 
  Users, 
  Lock, 
  Zap,
  Calendar,
  HeartHandshake,
  Globe,
  ChevronRight,
  Video,
  GraduationCap,
  BookOpen,
  Activity,
  HeartPulse,
  PhoneCall,
  UserCheck,
  FileText,
  MapPin,
  Mic,
  BrainCircuit
} from "lucide-react";

export default function UniversityLandingPage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#2D2D2D] font-sans selection:bg-[#2563EB] selection:text-white overflow-hidden">
      
      {/* --- NAV BAR --- */}
      <nav className="fixed top-0 left-0 right-0 bg-[#FAFAF8]/80 backdrop-blur-md z-50 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href={"/for-universities"}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-bold">T</div>
              <span className="text-xl font-bold tracking-tight">TherapyConnect <span className="text-gray-400 font-medium">University</span></span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="/login" className="hover:text-[#2563EB] transition-colors">Log in</Link>
            <Link href="/for-universities/demo" className="bg-[#2D2D2D] text-white px-5 py-2.5 rounded-full hover:bg-black transition-all shadow-md">
              Partner with Us
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#2563EB]/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <motion.div 
          className="flex-1 space-y-8 z-10"
          initial="hidden" animate="visible" variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-600">UGC Mandate Compliant</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[1.1]">
            Elevate Student <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#1E40AF]">
              Well-Being.
            </span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg lg:text-xl text-gray-500 max-w-xl leading-relaxed">
            A comprehensive, hybrid mental health ecosystem designed to support your students and help your institution seamlessly comply with the new UGC mental health and well-being mandate.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/for-universities/demo" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-4 rounded-2xl font-bold text-center transition-all shadow-lg shadow-[#2563EB]/20 flex items-center justify-center gap-2">
              Transform Your Campus <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          className="flex-1 relative w-full h-[500px] perspective-1000"
          initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          <motion.div 
            className="absolute right-0 top-10 w-full max-w-[500px] bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_rgb(0,0,0,0.08)] p-8 z-20"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          >
            <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600"><ShieldCheck size={24} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Compliance Status</p>
                  <p className="font-bold text-indigo-900 text-lg">UGC Mandate Met</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm font-medium text-gray-600"><CheckCircle /> Dedicated Counselors On-Boarded</div>
              <div className="flex items-center gap-3 text-sm font-medium text-gray-600"><CheckCircle /> 24/7 Crisis Intervention Active</div>
              <div className="flex items-center gap-3 text-sm font-medium text-gray-600"><CheckCircle /> Wellness Dashboard Integrated</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* --- UGC MANDATE FOCUS --- */}
      <section className="py-24 px-6 max-w-7xl mx-auto relative border-t border-gray-200/60">
        <div className="text-center max-w-4xl mx-auto mb-16 relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-[#2D2D2D]">We handle the compliance, so you can focus on education.</h2>
          <p className="text-xl text-gray-500 leading-relaxed font-medium">The new UGC mandate requires robust mental health infrastructure on campus. We provide an end-to-end ecosystem that fulfills every requirement—from clinical support to detailed administrative reporting.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6"><FileText size={24} /></div>
            <h3 className="text-xl font-bold mb-3">NAAC/NIRF Ready Reporting</h3>
            <p className="text-gray-500">Monthly 5-page PDF executive summaries structured specifically to support your NAAC and NIRF documentation requirements.</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-6"><ShieldCheck size={24} /></div>
            <h3 className="text-xl font-bold mb-3">Privacy-First Architecture</h3>
            <p className="text-gray-500">All administrative data is aggregated and anonymized. Raw student venting text is never stored or shown to the institution.</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6"><BarChart3 size={24} /></div>
            <h3 className="text-xl font-bold mb-3">Intelligence Dashboard</h3>
            <p className="text-gray-500">Real-time data for administrators, featuring an Org Wellness Index, Department Burnout Matrix, and stress-theme word clouds.</p>
          </div>
        </div>
      </section>

      {/* --- SERVICES GRID --- */}
      <section className="py-24 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-[90rem] mx-auto">
          <div className="mb-16 max-w-3xl">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 text-[#2D2D2D] leading-[1.1]">
              A complete mental health ecosystem.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Category 1: Clinical */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-[#F8FAFC] rounded-[2.5rem] p-10 border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <HeartPulse className="text-red-500" size={28} />
                <h3 className="text-2xl font-bold">Clinical & Professional Support</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-lg mb-2 flex items-center gap-2"><UserCheck size={18} className="text-blue-500"/> One-on-One Therapy</h4>
                  <p className="text-gray-600 text-sm">Access to verified, RCI-registered, HIPAA-compliant professionals for online or in-person sessions.</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2 flex items-center gap-2"><Zap size={18} className="text-yellow-500"/> {"\"Vibe Match\" Discovery"}</h4>
                  <p className="text-gray-600 text-sm">Filter therapists by specialty, session type, and language (including Hindi and Punjabi) for the perfect fit.</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2 flex items-center gap-2"><Activity size={18} className="text-red-500"/> Crisis Intervention</h4>
                  <p className="text-gray-600 text-sm">Immediate handling for severe cases with professional pathways for sensitive crises like blackmail or addiction.</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2 flex items-center gap-2"><PhoneCall size={18} className="text-indigo-500"/> Night Owl Helpline</h4>
                  <p className="text-gray-600 text-sm">A dedicated late-night support line for students, included in our higher-tier partnership models.</p>
                </div>
              </div>
            </div>

            {/* Category 2: Digital Tools */}
            <div className="col-span-1 bg-[#1E293B] text-white rounded-[2.5rem] p-10 border border-gray-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none"></div>
              <div className="flex items-center gap-3 mb-8 relative z-10">
                <BrainCircuit className="text-blue-400" size={28} />
                <h3 className="text-2xl font-bold">Student Digital Tools</h3>
              </div>
              <div className="space-y-6 relative z-10">
                <div>
                  <h4 className="font-bold text-lg mb-1 text-blue-300">Daily Wellness Monitoring</h4>
                  <p className="text-gray-400 text-sm">{"5-second \"Daily Mood Check-In\" and guided breathing exercises for acute stress."}</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 text-blue-300">{"The \"Frustration Zone\""}</h4>
                  <p className="text-gray-400 text-sm">An anonymous venting space designed for pure catharsis without institutional visibility.</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 text-blue-300">Seamless Booking</h4>
                  <p className="text-gray-400 text-sm">One-tap session booking with integrated calendars and double-booking protection.</p>
                </div>
              </div>
            </div>

            {/* Category 3: On-Campus */}
            <div className="col-span-1 bg-[#FFFBEB] rounded-[2.5rem] p-10 border border-amber-100">
               <div className="flex items-center gap-3 mb-8">
                <MapPin className="text-amber-500" size={28} />
                <h3 className="text-2xl font-bold text-amber-950">On-Campus Services</h3>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-lg mb-1 text-amber-900">Hybrid Engagement</h4>
                  <p className="text-amber-800/70 text-sm">{"Not just an app. We provide physical wellness starter kits and host \"Sem End Mela\" events with live music & games."}</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 text-amber-900">Educational Workshops</h4>
                  <p className="text-amber-800/70 text-sm">60-minute in-person sessions on critical topics like exam anxiety and sleep hygiene.</p>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1 text-amber-900">Orientation Programs</h4>
                  <p className="text-amber-800/70 text-sm">Annual presentations and workshops held right during student orientation weeks.</p>
                </div>
              </div>
            </div>

             {/* Category 4: Admin Insights (Visual Focus) */}
             <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-gradient-to-br from-[#0F172A] to-[#1E1B4B] text-white rounded-[2.5rem] p-10 relative overflow-hidden group">
               <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md mb-8 border border-white/10">
                    <BarChart3 size={24} className="text-indigo-300" />
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Administrative Intelligence</h3>
                  <p className="text-indigo-200 text-lg leading-relaxed max-w-xl font-medium">
                    Go beyond basic reporting. Our dashboard provides actionable insights into campus mental health trends while strictly protecting student privacy.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                        <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">Metric</p>
                        <p className="text-lg font-bold">Org Wellness Index</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                        <p className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-1">Analysis</p>
                        <p className="text-lg font-bold">Department Burnout Matrix</p>
                    </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <footer className="bg-[#0A0A0A] pt-32 pb-24 px-6 text-center relative z-10">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6">Support your students.<br/>Secure your compliance.</h2>
        <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">Join leading institutions in building a resilient, healthy, and thriving campus ecosystem.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
          <Link href="/for-universities/demo" className="flex-1 bg-[#2563EB] text-white px-8 py-5 rounded-full font-bold text-lg hover:bg-[#1D4ED8] transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-[#2563EB]/20 border border-[#2563EB]/50">
            Schedule a Consultation <ChevronRight size={20} />
          </Link>
        </div>
      </footer>

    </div>
  );
}

// Mini Icon component for inline usage in Hero
function CheckCircle() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
  );
}
