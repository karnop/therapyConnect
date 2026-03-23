"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  CheckCircle2, 
  ArrowRight, 
  Building2,
  Mail,
  User,
  MessageSquare,
  Loader2
} from "lucide-react";
import { submitDemoRequest } from "@/actions/b2b";

export default function BusinessDemoPage() {
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("");

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  async function handleAction(formData) {
    setStatus("loading");
    setErrorMessage("");
    
    const response = await submitDemoRequest(formData);
    
    if (response.error) {
        setErrorMessage(response.error);
        setStatus("error");
    } else {
        setStatus("success");
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#2D2D2D] font-sans selection:bg-[#5A7A66] selection:text-white flex flex-col md:flex-row">
      
      {/* --- MOBILE NAVBAR --- */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 md:hidden">
        <nav className="bg-white/70 backdrop-blur-2xl border border-black/5 shadow-sm rounded-full px-6 py-3 flex items-center justify-between w-full">
          <Link href="/for-business" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#2D2D2D] text-white flex items-center justify-center font-bold text-xs">T</div>
            <span className="font-bold tracking-tight text-[#2D2D2D]">TherapyConnect</span>
          </Link>
          <Link href="/for-business" className="text-xs font-bold text-gray-500 hover:text-primary">Back to Site</Link>
        </nav>
      </div>

      {/* --- LEFT SIDE: THE PITCH --- */}
      <div className="w-full md:w-5/12 lg:w-1/2 bg-[#111111] text-white p-10 md:p-16 lg:p-24 flex flex-col justify-between relative overflow-hidden min-h-[50vh] md:min-h-screen">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#5A7A66]/20 via-transparent to-transparent pointer-events-none"></div>

        <div className="relative z-10">
          <Link href="/for-business" className="hidden md:flex items-center gap-3 mb-20 hover:opacity-80 transition-opacity w-fit">
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm shadow-inner">T</div>
            <span className="text-xl font-bold tracking-tight">TherapyConnect <span className="font-normal opacity-50">Business</span></span>
          </Link>

          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tighter mb-6 leading-[1.1]">
              See how we can build resilience in your team.
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed mb-12 max-w-md">
              Schedule a 15-minute introductory call. We&apos;ll show you the platform, discuss your team&apos;s specific needs, and walk through our pricing models.
            </p>

            <div className="space-y-6">
              {[
                "Live tour of the HR Executive Dashboard",
                "Demonstration of the frictionless booking flow",
                "Discussion on POSH compliance & CISM protocols",
                "Customized pricing estimate based on your headcount"
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <CheckCircle2 size={24} className="text-[#5A7A66] shrink-0" />
                  <span className="text-gray-300 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Social Proof */}
        <div className="relative z-10 mt-20 pt-10 border-t border-white/10">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Trusted by HR Leaders</p>
          <div className="flex flex-wrap gap-8 opacity-50 grayscale">
            <span className="text-xl font-black font-serif tracking-tighter">Acme Corp</span>
            <span className="text-xl font-black tracking-widest">GLOBEX</span>
            <span className="text-xl font-bold">Rippling</span>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: THE FORM --- */}
      <div className="w-full md:w-7/12 lg:w-1/2 bg-[#FAFAF8] p-6 md:p-16 lg:p-24 flex items-center justify-center min-h-[50vh] md:min-h-screen pt-32 md:pt-16 relative">
        
        <Link href="/for-business" className="hidden md:flex absolute top-10 right-10 text-sm font-bold text-gray-400 hover:text-[#2D2D2D] transition-colors items-center gap-1">
          Return to Website <ArrowRight size={14} />
        </Link>

        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-lg bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100"
        >
          {status === "success" ? (
            /* --- SUCCESS STATE --- */
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-green-100">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-[#2D2D2D] mb-4">Request Received</h2>
              <p className="text-gray-500 font-medium leading-relaxed mb-8">
                Thank you for your interest. Our enterprise team will be in touch shortly to schedule your demo.
              </p>
              <Link href="/for-business" className="inline-flex bg-gray-50 text-[#2D2D2D] border border-gray-200 py-3 px-6 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all">
                Return to Homepage
              </Link>
            </motion.div>
          ) : (
            /* --- FORM STATE --- */
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-[#2D2D2D] mb-2">Book your demo</h2>
                <p className="text-gray-500 text-sm font-medium">Fill out the form below and our team will be in touch within 24 hours.</p>
              </div>

              {status === "error" && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100">
                  {errorMessage}
                </div>
              )}

              <form action={handleAction} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><User size={18} /></div>
                    <input type="text" name="name" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A7A66]/20 focus:border-[#5A7A66] transition-all text-sm font-medium text-[#2D2D2D]" placeholder="Jane Doe" required disabled={status === "loading"} />
                  </div>
                </div>

                {/* Work Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">Work Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Mail size={18} /></div>
                    <input type="email" name="email" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A7A66]/20 focus:border-[#5A7A66] transition-all text-sm font-medium text-[#2D2D2D]" placeholder="jane@company.com" required disabled={status === "loading"} />
                  </div>
                </div>

                {/* Company & Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">Company Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><Building2 size={18} /></div>
                      <input type="text" name="company" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A7A66]/20 focus:border-[#5A7A66] transition-all text-sm font-medium text-[#2D2D2D]" placeholder="Acme Corp" required disabled={status === "loading"} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">Team Size</label>
                    <select name="size" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A7A66]/20 focus:border-[#5A7A66] transition-all text-sm font-medium text-[#2D2D2D] appearance-none cursor-pointer" required disabled={status === "loading"}>
                      <option value="" disabled selected>Select size</option>
                      <option value="1-49">1 - 49</option>
                      <option value="50-249">50 - 249</option>
                      <option value="250-999">250 - 999</option>
                      <option value="1000+">1,000+</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 pl-1">How can we help? (Optional)</label>
                  <div className="relative">
                    <div className="absolute top-3.5 left-4 pointer-events-none text-gray-400"><MessageSquare size={18} /></div>
                    <textarea name="message" rows="3" className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A7A66]/20 focus:border-[#5A7A66] transition-all text-sm font-medium text-[#2D2D2D] resize-none" placeholder="Tell us about your team's current wellness initiatives..." disabled={status === "loading"}></textarea>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={status === "loading"}
                  className="w-full bg-[#2D2D2D] text-white py-4 rounded-xl font-bold text-sm hover:bg-black hover:shadow-lg hover:shadow-gray-900/10 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                  ) : (
                    <>Request Demo <ArrowRight size={16} /></>
                  )}
                </button>
                <p className="text-center text-xs text-gray-400 font-medium mt-4">By submitting, you agree to our Privacy Policy.</p>
              </form>
            </>
          )}
        </motion.div>
      </div>

    </div>
  );
}