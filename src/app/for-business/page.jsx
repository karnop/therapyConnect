"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  ShieldCheck, 
  BarChart3, 
  Coffee, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Lock, 
  Zap,
  Calendar,
  HeartHandshake,
  Globe,
  ChevronRight,
  Video
} from "lucide-react";

export default function BusinessLandingPage() {
  // Animation Variants for tasteful, premium reveals
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#2D2D2D] font-sans selection:bg-[#5A7A66] selection:text-white overflow-hidden">
      
      {/* --- NAV BAR (Minimalist for Landing Page) --- */}
      <nav className="fixed top-0 left-0 right-0 bg-[#FAFAF8]/80 backdrop-blur-md z-50 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href={"/for-business"}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#5A7A66] flex items-center justify-center text-white font-bold">T</div>
            <span className="text-xl font-bold tracking-tight">TherapyConnect <span className="text-gray-400 font-medium">Business</span></span>
          </div>
            </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="/for-business/pricing" className="hover:text-[#5A7A66] transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-[#5A7A66] transition-colors">Log in</Link>
            <Link href="/for-business/demo" className="bg-[#2D2D2D] text-white px-5 py-2.5 rounded-full hover:bg-black transition-all shadow-md">
              Book a Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-20 lg:pt-48 lg:pb-32 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        {/* Background Glows */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#5A7A66]/10 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        {/* Left Copy */}
        <motion.div 
          className="flex-1 space-y-8 z-10"
          initial="hidden" animate="visible" variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-600">The 2% EAP problem, solved.</span>
          </motion.div>
          
          <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[1.1]">
            Build a resilient <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5A7A66] to-[#3A5A46]">
              workforce.
            </span>
          </motion.h1>
          
          <motion.p variants={fadeUp} className="text-lg lg:text-xl text-gray-500 max-w-xl leading-relaxed">
            Traditional corporate wellness programs have a 3% utilization rate. We built a frictionless, data-driven platform that your employees will actually use.
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link href="/for-business/demo" className="bg-[#5A7A66] hover:bg-[#4A6A56] text-white px-8 py-4 rounded-2xl font-bold text-center transition-all shadow-lg shadow-[#5A7A66]/20 flex items-center justify-center gap-2">
              Get Started <ArrowRight size={18} />
            </Link>
            <Link href="/for-business/pricing" className="bg-white hover:bg-gray-50 text-[#2D2D2D] border border-gray-200 px-8 py-4 rounded-2xl font-bold text-center transition-all flex items-center justify-center">
              View Pricing
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Visual (Abstract Dashboard Mockup) */}
        <motion.div 
          className="flex-1 relative w-full h-[500px] perspective-1000"
          initial={{ opacity: 0, scale: 0.9, rotateY: 10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          {/* Main Dashboard Card */}
          <motion.div 
            className="absolute right-0 top-10 w-full max-w-[500px] bg-white rounded-[2rem] border border-gray-100 shadow-[0_20px_60px_rgb(0,0,0,0.08)] p-6 z-20"
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          >
            <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500"><BarChart3 size={20} /></div>
                <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Company Weather Report</p><p className="font-bold text-primary">Q1 Burnout Heatmap</p></div>
              </div>
            </div>
            {/* Fake Chart Bars */}
            <div className="flex items-end gap-3 h-32 mb-4">
              {[40, 70, 45, 90, 30, 60].map((h, i) => (
                <div key={i} className="flex-1 bg-gray-100 rounded-t-lg relative group">
                  <div className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-1000 ${h > 80 ? 'bg-red-400' : 'bg-[#5A7A66]'}`} style={{ height: `${h}%` }}></div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Floating Element 1 (Drop-In Card) */}
          <motion.div 
            className="absolute -left-10 bottom-20 bg-white rounded-2xl border border-gray-100 shadow-xl p-5 z-30 flex items-center gap-4 w-72"
            animate={{ y: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
          >
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><Coffee size={20} /></div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Now</p>
                <p className="text-sm font-bold text-primary">Virtual Office Hours</p>
            </div>
          </motion.div>

          {/* Floating Element 2 (Access Code Card) */}
          <motion.div 
            className="absolute right-10 -bottom-10 bg-[#2D2D2D] rounded-2xl shadow-2xl p-5 z-30 flex items-center gap-4 w-64 text-white"
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut", delay: 0.5 }}
          >
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center"><Lock size={20} /></div>
            <div>
                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Access Code</p>
                <p className="text-sm font-mono font-bold text-green-400">WOBOT-2026</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* --- TRUST BAR --- */}
      <section className="border-y border-gray-200/60 bg-white/50 py-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">Trusted by forward-thinking HR teams</p>
          <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale">
            {/* Replace with actual client logos later */}
            <div className="text-xl font-black font-serif">HiTech Engineers Pvt. Ltd.</div>
            <div className="text-xl font-black tracking-tighter">GLOBEX</div>
            <div className="text-xl font-bold">Soylent</div>
            <div className="text-xl font-bold italic">Initech</div>
            <div className="text-xl font-black uppercase">Massive Dynamic</div>
          </div>
        </div>
      </section>

       <section id="manifesto" className="py-32 px-6 max-w-7xl mx-auto relative">
        {/* Subtle grid pattern background for engineered feel */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] -z-10"></div>

        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
          className="text-center max-w-3xl mx-auto mb-20 relative z-10"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#2D2D2D]">Why traditional wellness programs fail.</h2>
          <p className="text-xl text-gray-500 leading-relaxed font-medium">Employees are too stressed to navigate clunky portals. We removed the friction so your team gets help before burnout hits.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative z-10">
          {[
            { icon: Zap, title: "Zero-Friction Access", desc: "No complex onboarding. Employees enter your Corporate Code on our consumer app and instantly unlock care." },
            { icon: Lock, title: "Absolute Anonymity", desc: "Employees use their personal emails. You get aggregated ROI data, they get complete psychological safety." },
            { icon: HeartHandshake, title: "Proactive Engagement", desc: "Instead of waiting for a crisis, we push 60-second mood checks and drop-in 'Office Hours' to catch stress early." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.15 }}
              className="group relative bg-white/60 backdrop-blur-2xl p-10 rounded-[2rem] border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04),inset_0_0_20px_rgb(255,255,255,0.5)] hover:shadow-[0_20px_40px_rgb(90,122,102,0.08)] transition-all duration-500 overflow-hidden"
            >
              {/* Hover Glow Effect */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#5A7A66]/10 rounded-full blur-[40px] group-hover:bg-[#5A7A66]/20 group-hover:scale-150 transition-all duration-700 pointer-events-none"></div>
              
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 text-[#5A7A66] flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                <feature.icon size={24} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-[#2D2D2D]">{feature.title}</h3>
              <p className="text-gray-500 leading-relaxed font-medium">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- THE BENTO BOX (Ultra Premium Features - Refined) --- */}
      <section id="platform" className="py-32 px-4 sm:px-6 lg:px-8 max-w-[90rem] mx-auto">
        <div className="mb-16 max-w-4xl">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-[#2D2D2D] leading-[1.1]">
            Not an EAP.<br/>
            <span className="text-gray-400">An Operating System.</span>
          </h2>
          <p className="text-xl text-gray-500 font-medium">Everything HR needs to protect the company, and everything employees need to protect their peace.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[340px]">
          
          {/* Card 1: Virtual Office Hours (Dark Premium) */}
          <motion.div 
            whileHover={{ scale: 0.98 }} transition={{ duration: 0.4 }}
            className="md:col-span-2 lg:col-span-2 row-span-2 bg-[#1A1A1A] text-white rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden group cursor-pointer shadow-xl shadow-black/5 border border-[#333]"
          >
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] group-hover:bg-blue-400/30 transition-colors duration-700 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md mb-8 border border-white/10 shadow-inner">
                  <Coffee size={24} className="text-blue-300" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Virtual Office Hours</h3>
                <p className="text-gray-400 text-lg leading-relaxed max-w-md font-medium">
                  Drop-in clinics. Zero booking required. Employees join an anonymous 10-minute queue to decompress instantly.
                </p>
              </div>
              
              <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex items-center justify-between group-hover:-translate-y-2 transition-transform duration-500 max-w-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20"><Video size={16}/></div>
                  <div>
                    <p className="text-sm font-bold text-white">Live Waiting Room</p>
                    <p className="text-xs text-blue-300 font-medium mt-0.5">2 Therapists Online</p>
                  </div>
                </div>
                <span className="bg-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-colors">Join</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Weather Report (Brand Green) */}
          <motion.div 
            whileHover={{ scale: 0.98 }} transition={{ duration: 0.4 }}
            className="md:col-span-1 lg:col-span-2 row-span-1 bg-gradient-to-br from-[#5A7A66] to-[#3A5A46] text-white rounded-[2.5rem] p-10 relative overflow-hidden group shadow-lg shadow-[#5A7A66]/20 cursor-pointer border border-[#5A7A66]/50"
          >
            <div className="relative z-10 flex items-start justify-between h-full">
              <div className="max-w-[240px]">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6 backdrop-blur-md shadow-inner border border-white/10">
                  <BarChart3 size={20} />
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">The Weather Report</h3>
                <p className="text-white/80 text-sm font-medium leading-relaxed">Automated burnout heatmaps delivered directly to the CEO.</p>
              </div>
              
              <div className="w-40 h-full flex items-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity pb-4">
                 {[40, 70, 50, 100].map((h, i) => (
                    <div key={i} className="w-full bg-white/20 rounded-t-lg relative overflow-hidden" style={{height: `${h}%`}}>
                        <div className="absolute bottom-0 left-0 w-full bg-white h-full scale-y-0 group-hover:scale-y-100 origin-bottom transition-transform duration-700 ease-out" style={{transitionDelay: `${i * 50}ms`}}></div>
                    </div>
                 ))}
              </div>
            </div>
          </motion.div>

          {/* Card 3: Frictionless Access (Clean White) */}
          <motion.div 
            whileHover={{ scale: 0.98 }} transition={{ duration: 0.4 }}
            className="md:col-span-1 lg:col-span-1 row-span-1 bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-6 text-[#2D2D2D] group-hover:scale-110 transition-transform duration-500">
              <Zap size={20} />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-tight text-[#2D2D2D]">Zero-Click Access</h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">Employees use a corporate code on our consumer app. Zero onboarding friction.</p>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gray-50 rounded-full group-hover:scale-[2] transition-transform duration-700 -z-10 opacity-50"></div>
          </motion.div>

          {/* Card 4: Gifted Relief (Clean White) */}
          <motion.div 
            whileHover={{ scale: 0.98 }} transition={{ duration: 0.4 }}
            className="md:col-span-1 lg:col-span-1 row-span-1 bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-6 text-orange-500 group-hover:scale-110 transition-transform duration-500">
              <Users size={20} />
            </div>
            <h3 className="text-xl font-bold mb-3 tracking-tight text-[#2D2D2D]">Gifted Relief</h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">Managers can instantly generate 1-on-1 session links for burnt-out team members.</p>
          </motion.div>

        </div>
      </section>

      {/* --- ENTERPRISE SHIELD (Deep Black Refinement) --- */}
      <section className="bg-[#0A0A0A] text-white py-32 md:py-40 px-6 rounded-t-[3rem] md:rounded-t-[5rem] relative overflow-hidden">
        {/* Subtle noise texture for premium matte feel */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20 relative z-10">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
              <Lock size={14} className="text-gray-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Enterprise Security</span>
            </div>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-8 leading-[1.05]">
              HIPAA Compliant.<br/>
              <span className="text-gray-500">POSH Integrated.</span>
            </h2>
            <p className="text-xl text-gray-400 leading-relaxed mb-12 max-w-xl font-light">
              Upgrade to the Enterprise Tier for full Prevention of Sexual Harassment integration, Critical Incident Stress Management (CISM), and end-to-end cryptographic journaling.
            </p>
            <ul className="space-y-5 text-gray-300 font-medium">
              {[
                  'End-to-End Encryption on Clinical Notes', 
                  'Strict Google API Limited Use Policy', 
                  'Dedicated Clinical Account Management'
                ].map((item, i) => (
                <li key={i} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#5A7A66] flex items-center justify-center text-white shrink-0"><ShieldCheck size={12} /></div>
                  <span className="text-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex-1 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#5A7A66]/30 to-purple-500/20 blur-[120px] rounded-full mix-blend-screen pointer-events-none"></div>
            
            <div className="relative bg-[#1A1A1A]/80 border border-white/10 rounded-[3rem] p-12 md:p-16 backdrop-blur-2xl text-center shadow-2xl overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#5A7A66] to-transparent opacity-50"></div>
              
              <Globe size={80} className="mx-auto text-white/20 mb-8 group-hover:rotate-12 transition-transform duration-700" strokeWidth={1} />
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Enterprise Shield</h3>
              <p className="text-gray-400 mb-10 text-lg font-light leading-relaxed">Protect your company&apos;s liability while protecting your team&apos;s mental health.</p>
              
              <Link href="/for-business/pricing" className="inline-flex items-center justify-center w-full bg-white text-black py-5 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                View Enterprise Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0A0A0A] pt-20 pb-20 px-6 text-center relative z-10">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-12">Ready to evolve?</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
          <Link href="/for-business/demo" className="flex-1 bg-[#5A7A66] text-white px-8 py-5 rounded-full font-bold text-lg hover:bg-[#4A6A56] transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-[#5A7A66]/20 border border-[#5A7A66]/50">
            Book Demo <ChevronRight size={20} />
          </Link>
        </div>
      </footer>

    </div>
  );
}