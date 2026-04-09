"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  CheckCircle2, 
  ArrowRight, 
  Users,
  ChevronRight
} from "lucide-react";

export default function BusinessPricingPage() {
  const [employees, setEmployees] = useState(250);
  const [isAnnual, setIsAnnual] = useState(false); // NEW: Toggle State

  const tiers = [
    {
      name: "Pulse",
      price: 99,
      description: "A data-driven baseline for organizational wellness.",
      features: [
        "Automated Burnout Heatmaps",
        "Weekly Mood Pulse Checks",
        "Unlimited Async Triage Chat",
        "Digital Wellness Library",
        "Zero 1-on-1 Sessions Included"
      ],
      cta: "Start Free Pilot",
      popular: false,
      dark: false
    },
    {
      name: "Resilience",
      price: 299,
      description: "Our core operating system for team resilience.",
      features: [
        "Everything in Pulse, plus:",
        "Virtual Office Hours (2hr/week)",
        "Manager 'Gifted Relief' Links",
        "Shared 1-on-1 Session Pool",
        "Smart-Match Therapist Algorithm",
        "Monthly Live Masterclasses"
      ],
      cta: "Select Resilience",
      popular: true,
      dark: false
    },
    {
      name: "Enterprise",
      price: 599,
      description: "A strategic HR partnership with legal compliance.",
      features: [
        "Everything in Resilience, plus:",
        "POSH Compliance & Legal Support",
        "Critical Incident Stress Protocol (CISM)",
        "Daily Virtual Office Hours",
        "Dedicated Clinical Account Manager",
        "Leadership Sensitivity Training"
      ],
      cta: "Contact Sales",
      popular: false,
      dark: true
    }
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#2D2D2D] font-sans selection:bg-[#5A7A66] selection:text-white">
      
      {/* --- REPLACED NAVBAR (User Provided) --- */}
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

      {/* --- HERO & CALCULATOR --- */}
      <section className="pt-48 pb-20 px-6 max-w-5xl mx-auto text-center relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#5A7A66]/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-bold tracking-tighter mb-6"
        >
          Predictable pricing.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2D2D2D] via-[#5A7A66] to-[#2D2D2D] bg-[length:200%_auto] animate-gradient">
            Immeasurable ROI.
          </span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xl text-gray-500 font-medium max-w-2xl mx-auto mb-16"
        >
          No surprise billing. Transparent Per Employee Per Month (PEPM) pricing designed to protect your budget while maximizing team resilience.
        </motion.p>

        {/* Interactive Slider Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_20px_60px_rgb(0,0,0,0.05)] rounded-[2.5rem] p-8 md:p-12 max-w-3xl mx-auto"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
            <div className="text-left flex-1">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Users size={16} /> Team Size
              </h3>
              <p className="text-4xl font-black tracking-tighter text-[#2D2D2D]">{employees} <span className="text-xl font-medium text-gray-400 tracking-normal">employees</span></p>
            </div>
            
            <div className="hidden md:block w-px h-16 bg-gray-200"></div>
            
            <div className="text-left md:text-right flex-1">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Billing Cycle</h3>
              {/* FIXED: Working Monthly/Annual Toggle */}
              <div className="inline-flex bg-gray-100 p-1 rounded-xl">
                <button 
                  onClick={() => setIsAnnual(false)}
                  className={`${!isAnnual ? 'bg-white text-[#2D2D2D] shadow-sm' : 'text-gray-400 hover:text-gray-600'} px-6 py-2 rounded-lg text-sm font-bold transition-all`}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setIsAnnual(true)}
                  className={`${isAnnual ? 'bg-white text-[#2D2D2D] shadow-sm' : 'text-[#5A7A66] hover:text-[#4A6A56]'} px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1`}
                >
                  Annual <span className="hidden sm:inline">(Save 15%)</span>
                </button>
              </div>
            </div>
          </div>

          <div className="relative pt-4 pb-8">
            <input 
              type="range" 
              min="50" 
              max="1000" 
              step="10"
              value={employees}
              onChange={(e) => setEmployees(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-100 rounded-full appearance-none cursor-pointer accent-[#5A7A66] hover:accent-[#4A6A56] transition-all"
              style={{
                background: `linear-gradient(to right, #5A7A66 ${(employees - 50) / 9.5}%, #F3F4F6 ${(employees - 50) / 9.5}%)`
              }}
            />
            <div className="flex justify-between text-xs font-bold text-gray-400 mt-4 uppercase tracking-wider">
              <span>50</span>
              <span>500</span>
              <span>1,000+</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- PRICING CARDS --- */}
      <section className="pb-32 px-4 sm:px-6 lg:px-8 max-w-[90rem] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {tiers.map((tier, i) => {
            // FIXED: Calculation Logic based on Toggle
            const basePrice = tier.price;
            const currentPrice = isAnnual ? Math.floor(basePrice * 0.85) : basePrice;
            const monthlyTotal = currentPrice * employees;
            
            return (
              <motion.div 
                key={tier.name}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.15 }}
                className={`relative rounded-[2.5rem] p-10 flex flex-col h-full transition-transform duration-500 hover:-translate-y-2
                  ${tier.dark ? 'bg-[#111111] text-white border border-gray-800 shadow-2xl' : 'bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'}
                  ${tier.popular ? 'ring-4 ring-[#5A7A66]/20' : ''}
                `}
              >
                {tier.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#5A7A66] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#5A7A66]/30 flex items-center gap-1.5">
                    Recommended
                  </div>
                )}
                
                <div className="mb-8">
                  <h3 className="text-3xl font-bold tracking-tight mb-3">{tier.name}</h3>
                  <p className={tier.dark ? 'text-gray-400' : 'text-gray-500'}>{tier.description}</p>
                </div>

                <div className="mb-10 pb-10 border-b border-opacity-10" style={{ borderColor: tier.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-black tracking-tighter">
                      ₹{monthlyTotal.toLocaleString('en-IN')}
                    </span>
                    <span className={`text-sm font-bold mb-2 ${tier.dark ? 'text-gray-500' : 'text-gray-400'}`}>/mo</span>
                  </div>
                  
                  {/* Shows strikethrough if annual discount is applied */}
                  <p className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${tier.dark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {isAnnual && <span className="line-through opacity-60">₹{basePrice}</span>}
                    <span className={isAnnual ? (tier.dark ? "text-green-400" : "text-[#5A7A66]") : ""}>
                      ₹{currentPrice} PEPM
                    </span> 
                    • {isAnnual ? "Billed Annually" : "Billed Monthly"}
                  </p>
                </div>

                <ul className="space-y-5 flex-1 mb-10">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 size={20} className={`shrink-0 ${tier.dark ? 'text-gray-400' : 'text-[#5A7A66]'}`} />
                      <span className={`font-medium ${tier.dark ? 'text-gray-300' : 'text-gray-600'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link 
                  href="/for-business/demo" 
                  className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all
                    ${tier.dark 
                      ? 'bg-white text-black hover:bg-gray-200 shadow-[0_0_30px_rgba(255,255,255,0.1)]' 
                      : tier.popular 
                        ? 'bg-[#2D2D2D] text-white hover:bg-black shadow-xl shadow-gray-900/10' 
                        : 'bg-gray-50 text-[#2D2D2D] hover:bg-gray-100 border border-gray-200'}
                  `}
                >
                  {tier.cta} <ArrowRight size={18} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* --- HOW THE POOL WORKS (Trust Section) --- */}
      <section className="bg-white py-32 px-6 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">How the Shared Session Pool works.</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">We protect your budget from unexpected spikes in utilization by using a prepaid, shared pool model.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 space-y-8">
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-full bg-[#5A7A66]/10 text-[#5A7A66] flex items-center justify-center shrink-0 font-bold text-xl">1</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">The Base Pool</h3>
                  <p className="text-gray-500 leading-relaxed">Your monthly subscription includes a fixed number of 1-on-1 therapy sessions shared across the entire company. This acts as your baseline safety net.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-full bg-[#5A7A66]/10 text-[#5A7A66] flex items-center justify-center shrink-0 font-bold text-xl">2</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Frictionless Deductions</h3>
                  <p className="text-gray-500 leading-relaxed">When an employee books a session using your Corporate Code, the cost is simply deducted from the pool. You are never billed per individual session.</p>
                </div>
              </div>
              <div className="flex gap-5">
                <div className="w-12 h-12 rounded-full bg-[#5A7A66]/10 text-[#5A7A66] flex items-center justify-center shrink-0 font-bold text-xl">3</div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Top-Up Blocks (No Surprises)</h3>
                  <p className="text-gray-500 leading-relaxed">If your team hits the limit during a highly stressful month, sessions pause. HR can instantly approve a &lsquo;Top-Up Block&rsquo; of 10 extra sessions for ₹10,000. You are always in control of your spend.</p>
                </div>
              </div>
            </div>

            {/* Visual Graphic */}
            <div className="order-1 md:order-2 bg-[#FAFAF8] p-8 rounded-[3rem] border border-gray-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#5A7A66]/10 via-transparent to-transparent pointer-events-none"></div>
              
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative z-10 mb-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-sm text-gray-400 uppercase tracking-widest">Base Pool Remaining</span>
                  <span className="font-black text-2xl text-primary">8<span className="text-gray-300 text-lg">/40</span></span>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#5A7A66] rounded-full w-[80%]"></div>
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-6 border border-orange-100 relative z-10 flex items-center justify-between hover:bg-white transition-colors cursor-pointer">
                <div>
                  <h4 className="font-bold text-sm text-primary mb-1">Add Top-Up Block</h4>
                  <p className="text-xs text-gray-500 font-medium">+10 Sessions (₹10,000)</p>
                </div>
                <button className="bg-white text-orange-500 shadow-sm border border-orange-100 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-orange-50 transition-colors">
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <footer className="bg-[#111111] pt-24 pb-12 px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-10">Start building resilience.</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto mb-20">
          <Link href="/for-business/demo" className="flex-1 bg-[#5A7A66] text-white px-8 py-5 rounded-full font-bold text-lg hover:bg-[#4A6A56] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#5A7A66]/20">
            Book a Demo <ChevronRight size={20} />
          </Link>
        </div>
        
    
      </footer>

    </div>
  );
}