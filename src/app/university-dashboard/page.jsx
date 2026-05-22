"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Users, 
  Activity, 
  Stethoscope, 
  HeartHandshake, 
  AlertCircle,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  Megaphone,
  BookOpen,
  PhoneCall,
  Calendar,
  BarChart3,
  Search,
  ArrowUpRight
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import UniversityReportPDF from "@/components/UniversityReportPDF";

export default function UniversityAdminDashboard() {
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const handleExport = async () => {
    const btn = document.getElementById("export-btn");
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = "Generating PDF...";
      btn.disabled = true;
      
      try {
        const pdf = new jsPDF("p", "mm", "a4");
        for (let i = 1; i <= 5; i++) {
          const pageElem = document.getElementById(`univ-pdf-page-${i}`);
          if (!pageElem) continue;
          
          await document.fonts.ready;
          
          const canvas = await html2canvas(pageElem, { 
            scale: 2, 
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff"
          });
          const imgData = canvas.toDataURL("image/jpeg", 0.95);
          
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          
          if (i > 1) pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        }
        pdf.save(`UGC_Compliance_Report_Q1_2026.pdf`);
      } catch (e) {
        console.error(e);
        alert("Error generating PDF report");
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans selection:bg-[#2563EB] selection:text-white">
      
      {/* Hidden 5-Page Report for PDF Exporter */}
      <UniversityReportPDF data={{}} />

      {/* --- ADMIN NAV BAR --- */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-[100rem] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#1E3A8A] flex items-center justify-center text-white font-bold text-sm">TC</div>
            <span className="font-bold tracking-tight text-lg">TherapyConnect <span className="text-gray-400 font-medium">| University Portal</span></span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <div className="bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2 text-gray-600">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> UGC Mandate Compliant
            </div>
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">A</div>
          </div>
        </div>
      </nav>

      <main className="max-w-[100rem] mx-auto px-6 py-8">
        
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mental Health & Well-being Dashboard</h1>
            <p className="text-gray-500 mt-1">UGC Mandate Reporting & Campus Insights - Q1 2026</p>
          </div>
          <button 
            id="export-btn"
            onClick={handleExport}
            className="bg-[#1E3A8A] text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-[#1E40AF] transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BarChart3 size={16} /> Export UGC Report (PDF)
          </button>
        </header>

        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
          
          {/* --- TOP KPIs (Core Clinical Data) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard 
              icon={<Search size={20} className="text-blue-600"/>} 
              bg="bg-blue-50"
              title="Stakeholders Screened" 
              value="4,250" 
              trend="+12% from last month" 
            />
            <KPICard 
              icon={<Stethoscope size={20} className="text-purple-600"/>} 
              bg="bg-purple-50"
              title="Diagnosed Cases" 
              value="312" 
              trend="Requiring ongoing care" 
            />
            <KPICard 
              icon={<Calendar size={20} className="text-green-600"/>} 
              bg="bg-green-50"
              title="Sessions & Outreach" 
              value="1,845" 
              trend="1,200 1-on-1 | 645 Group" 
            />
            <KPICard 
              icon={<ArrowUpRight size={20} className="text-orange-600"/>} 
              bg="bg-orange-50"
              title="External Referrals" 
              value="42" 
              trend="38 Follow-ups completed" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* --- LEFT COLUMN --- */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Mentorship & Peer Support */}
              <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><GraduationCap size={20} className="text-indigo-600"/> Campus Support Programs</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                    <p className="text-sm text-gray-500 font-medium mb-1">Faculty-Mentor Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">450 <span className="text-sm font-normal text-gray-500">sessions</span></p>
                    <p className="text-sm text-indigo-600 mt-2 font-medium bg-indigo-50 inline-block px-2 py-1 rounded">2,100 Students Reached</p>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                    <p className="text-sm text-gray-500 font-medium mb-1">Peer Support Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">320 <span className="text-sm font-normal text-gray-500">sessions</span></p>
                    <p className="text-sm text-green-600 mt-2 font-medium bg-green-50 inline-block px-2 py-1 rounded">1,850 Students Reached</p>
                  </div>
                </div>
              </motion.div>

              {/* Crisis Interventions */}
              <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-700"><AlertCircle size={20} /> Crisis Interventions (Anonymized)</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-lg">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg">Nature of Crisis</th>
                        <th className="px-4 py-3">Frequency</th>
                        <th className="px-4 py-3 rounded-tr-lg">Resolution Pathway</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-4 py-3 font-medium text-gray-900">Severe Academic Burnout / Panic</td>
                        <td className="px-4 py-3">28 cases</td>
                        <td className="px-4 py-3 text-gray-600">Immediate counselor de-escalation; Academic relief requested</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-gray-900">Self-Harm Ideation</td>
                        <td className="px-4 py-3">12 cases</td>
                        <td className="px-4 py-3 text-gray-600">Emergency protocol activated; Family & external psych referral</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium text-gray-900">Substance Abuse / Addiction</td>
                        <td className="px-4 py-3">8 cases</td>
                        <td className="px-4 py-3 text-gray-600">Referred to specialized rehab centers; Follow-up active</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>

               {/* Training & Sensitization */}
               <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><BookOpen size={20} className="text-teal-600"/> Capacity Building & Awareness</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0"><Users size={18}/></div>
                    <div>
                      <p className="font-bold text-gray-900">Staff & Faculty Training</p>
                      <p className="text-sm text-gray-500">12 capacity building programs held. 350 faculty, staff, and peer supporters certified in psychological first aid.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0"><Megaphone size={18}/></div>
                    <div>
                      <p className="font-bold text-gray-900">Parent & Community</p>
                      <p className="text-sm text-gray-500">5 sensitization sessions conducted on recognizing distress signals, reaching 800+ families.</p>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>

            {/* --- RIGHT COLUMN --- */}
            <div className="space-y-6">
              
              {/* Emergency Contact Status */}
              <motion.div variants={fadeUp} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-400"><PhoneCall size={20} /> Emergency Infrastructure</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                    <span className="text-sm text-gray-300">24x7 Institutional Helpline</span>
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded font-bold">ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-gray-700 pb-3">
                    <span className="text-sm text-gray-300">UGC Anti-Ragging Line</span>
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded font-bold">DISPLAYED</span>
                  </div>
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-sm text-gray-300">{"Tele MANAS / Women's Line"}</span>
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded font-bold">DISPLAYED</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 bg-white/5 p-2 rounded">Verified visibility on website, hostels, and student service areas.</p>
                </div>
              </motion.div>

              {/* Feedback Summary */}
              <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><MessageSquare size={20} className="text-blue-600"/> Initiative Feedback</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-700">Students</span><span className="font-bold text-gray-900">4.6/5</span></div>
                    <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: '92%'}}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-700">Staff & Faculty</span><span className="font-bold text-gray-900">4.2/5</span></div>
                    <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-indigo-500 h-2 rounded-full" style={{width: '84%'}}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span className="font-medium text-gray-700">Families</span><span className="font-bold text-gray-900">4.8/5</span></div>
                    <div className="w-full bg-gray-100 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full" style={{width: '96%'}}></div></div>
                  </div>
                  <p className="text-xs text-gray-500 italic mt-3">{"\"The new daily mood check-ins have significantly improved our ability to catch stress early.\""}</p>
                </div>
              </motion.div>

              {/* Compliance & Inclusion */}
              <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><ShieldCheck size={20} className="text-green-600"/> Compliance & Inclusion</h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5"><HeartHandshake size={16} className="text-rose-500"/></div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Marginalised Group Inclusion</p>
                      <p className="text-xs text-gray-500">Dedicated safe spaces and specialized vernacular counseling (Hindi/Punjabi) active.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-0.5"><Activity size={16} className="text-amber-500"/></div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Safety Audits</p>
                      <p className="text-xs text-gray-500">Quarterly infrastructure audit completed. Private counseling rooms verified.</p>
                    </div>
                  </li>
                </ul>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function KPICard({ icon, title, value, trend, bg }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 my-1">{value}</p>
        <p className="text-xs font-medium text-gray-500 bg-gray-50 inline-block px-2 py-1 rounded">{trend}</p>
      </div>
    </motion.div>
  );
}
