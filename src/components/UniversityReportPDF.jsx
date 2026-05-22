"use client";

import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from "recharts";

export default function UniversityReportPDF({ data }) {
  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Academic / Brand Colors
  const PRIMARY = "#1E3A8A"; // Deep Blue
  const SECONDARY = "#2563EB"; // Blue
  const ACCENT = "#E09F7D"; // Warm accent
  const CHARCOAL = "#1E293B";
  const LIGHT_BLUE = "#EFF6FF";
  const WHITE = "#FFFFFF";

  // Data for PDF
  const supportData = [
    { name: 'Faculty-Mentor', sessions: 450, reached: 2100, fill: PRIMARY },
    { name: 'Peer Support', sessions: 320, reached: 1850, fill: SECONDARY },
  ];

  const feedbackData = [
    { name: 'Students', value: 92, fill: SECONDARY },
    { name: 'Staff', value: 84, fill: PRIMARY },
    { name: 'Families', value: 96, fill: ACCENT },
  ];

  const PageWrapper = ({ children, id }) => (
    <div id={id} className="w-[794px] h-[1123px] bg-white p-16 flex flex-col box-border overflow-hidden relative border-b border-gray-100">
      {children}
      <div className="absolute bottom-8 left-16 right-16 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest border-t pt-4 border-gray-50">
        <span>TherapyConnect University Partner</span>
        <span>UGC Compliance Report • {dateString}</span>
      </div>
    </div>
  );

  return (
    <div className="absolute left-[9999px] top-[9999px] opacity-0 flex flex-col font-sans" style={{ width: '794px' }}>
      
      {/* PAGE 1: COVER PAGE */}
      <div id="univ-pdf-page-1" className="w-[794px] h-[1123px] flex flex-col justify-center items-center text-center box-border" style={{ backgroundColor: PRIMARY }}>
        <div className="mb-12 flex flex-col items-center gap-6">
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
            <span className="text-4xl font-black tracking-tighter" style={{ color: PRIMARY }}>TC</span>
          </div>
          <span className="text-2xl font-bold tracking-[0.2em] text-white uppercase mt-4">TherapyConnect</span>
        </div>
        <div className="w-32 h-1 bg-white/20 mb-16 rounded-full"></div>
        <h1 className="text-6xl font-black text-white tracking-tight mb-6 max-w-xl leading-tight uppercase">
          CHANDIGARH UNIVERSITY
        </h1>
        <h2 className="text-2xl text-white/80 font-medium mb-16 uppercase tracking-[0.3em]">
          Mental Health & Well-being Report
        </h2>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 rounded-2xl">
          <p className="text-white text-lg font-bold">UGC MANDATE COMPLIANCE SUMMARY</p>
          <p className="text-white/60 text-sm mt-1">Academic Year 2025-26 | Quarter 1</p>
        </div>
      </div>

      {/* PAGE 2: CLINICAL ANALYTICS */}
      <PageWrapper id="univ-pdf-page-2">
        <h2 className="text-3xl font-black mb-12 uppercase tracking-wide border-b-4 pb-4" style={{ color: CHARCOAL, borderColor: PRIMARY }}>
          I. Clinical & Screening Metrics
        </h2>
        
        <div className="grid grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-3xl" style={{ backgroundColor: LIGHT_BLUE }}>
            <h3 className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: PRIMARY }}>Stakeholders Screened</h3>
            <div className="text-6xl font-black" style={{ color: CHARCOAL }}>4,250</div>
            <p className="text-sm text-gray-500 mt-4 leading-relaxed">Comprehensive baseline screening completed for students and staff.</p>
          </div>
          <div className="p-8 rounded-3xl" style={{ backgroundColor: '#F5F3FF' }}>
            <h3 className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#7C3AED' }}>Diagnosed Cases</h3>
            <div className="text-6xl font-black" style={{ color: CHARCOAL }}>312</div>
            <p className="text-sm text-gray-500 mt-4 leading-relaxed">Individuals identified requiring specialized clinical intervention.</p>
          </div>
        </div>

        <div className="flex gap-12 items-center mb-12 bg-gray-50 p-10 rounded-3xl border border-gray-100">
           <div className="w-1/2">
              <h3 className="text-xl font-bold mb-4 uppercase tracking-wider" style={{ color: CHARCOAL }}>Sessions & Outreach</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                A total of 1,845 engagements were recorded this quarter. This includes 1,200 clinical 1-on-1 sessions and 645 community outreach programs.
              </p>
              <div className="space-y-3">
                 <div className="flex justify-between text-sm border-b pb-2"><span className="text-gray-500">1-on-1 Counseling</span><span className="font-bold">1,200</span></div>
                 <div className="flex justify-between text-sm border-b pb-2"><span className="text-gray-500">Outreach Programs</span><span className="font-bold">645</span></div>
              </div>
           </div>
           <div className="w-1/2 h-64 flex items-center justify-center bg-white rounded-2xl p-4 shadow-sm">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={[{name: '1-on-1', value: 1200, fill: PRIMARY}, {name: 'Outreach', value: 645, fill: SECONDARY}]} 
                    innerRadius={60} outerRadius={90} dataKey="value" stroke="none" 
                  />
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="p-8 rounded-3xl border-2 border-dashed border-gray-200">
           <h3 className="text-lg font-bold mb-4 uppercase" style={{ color: CHARCOAL }}>Referral & Follow-up Matrix</h3>
           <div className="flex justify-around text-center">
              <div>
                 <p className="text-4xl font-black text-gray-900">42</p>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">External Referrals</p>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div>
                 <p className="text-4xl font-black text-gray-900">38</p>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Follow-ups Done</p>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div>
                 <p className="text-4xl font-black text-green-600">90%</p>
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Closure Rate</p>
              </div>
           </div>
        </div>
      </PageWrapper>

      {/* PAGE 3: CAMPUS SUPPORT & CRISIS */}
      <PageWrapper id="univ-pdf-page-3">
        <h2 className="text-3xl font-black mb-12 uppercase tracking-wide border-b-4 pb-4" style={{ color: CHARCOAL, borderColor: PRIMARY }}>
          II. Campus Support & Crisis Response
        </h2>

        <div className="mb-12">
          <h3 className="text-xl font-bold mb-6 uppercase tracking-wider" style={{ color: CHARCOAL }}>Mentorship & Peer Support</h3>
          <div className="h-64 w-full bg-gray-50 rounded-3xl p-8 border border-gray-100 shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={supportData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: CHARCOAL, fontWeight: 'bold'}} />
                <YAxis hide />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="reached" radius={[10, 10, 0, 0]} barSize={60}>
                  {supportData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-8 mt-6">
             <div className="bg-blue-50 p-6 rounded-2xl">
                <p className="text-sm font-bold text-blue-900">2,100 Students</p>
                <p className="text-xs text-blue-700">Supported via 450 Faculty-Mentor sessions</p>
             </div>
             <div className="bg-indigo-50 p-6 rounded-2xl">
                <p className="text-sm font-bold text-indigo-900">1,850 Students</p>
                <p className="text-xs text-indigo-700">Supported via 320 Peer-to-Peer sessions</p>
             </div>
          </div>
        </div>

        <div className="mt-8">
           <h3 className="text-xl font-bold mb-6 uppercase tracking-wider text-red-700">Crisis Intervention Logs (Anonymized)</h3>
           <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Nature of Crisis</th>
                    <th className="px-6 py-4 text-center">Frequency</th>
                    <th className="px-6 py-4">Resolution Pathway</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="px-6 py-5 font-bold">Academic Burnout</td>
                    <td className="px-6 py-5 text-center font-bold">28</td>
                    <td className="px-6 py-5 text-gray-500">De-escalation & Academic Relief</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-5 font-bold">Self-Harm Ideation</td>
                    <td className="px-6 py-5 text-center font-bold">12</td>
                    <td className="px-6 py-5 text-gray-500">Emergency Protocol & External Referral</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-5 font-bold">Substance Abuse</td>
                    <td className="px-6 py-5 text-center font-bold">08</td>
                    <td className="px-6 py-5 text-gray-500">Specialized Rehab Centers Referral</td>
                  </tr>
                </tbody>
              </table>
           </div>
        </div>
      </PageWrapper>

      {/* PAGE 4: CAPACITY & FEEDBACK */}
      <PageWrapper id="univ-pdf-page-4">
        <h2 className="text-3xl font-black mb-12 uppercase tracking-wide border-b-4 pb-4" style={{ color: CHARCOAL, borderColor: PRIMARY }}>
          III. Capacity Building & Feedback
        </h2>

        <div className="grid grid-cols-2 gap-8 mb-16">
           <div className="p-8 border-2 border-gray-100 rounded-3xl">
              <h3 className="text-lg font-bold mb-4 uppercase" style={{ color: CHARCOAL }}>Training Programs</h3>
              <div className="text-5xl font-black mb-2" style={{ color: PRIMARY }}>12</div>
              <p className="text-sm text-gray-500 font-medium">Capacity building programs held for faculty and peer supporters.</p>
              <div className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">350 Staff Certified</div>
           </div>
           <div className="p-8 border-2 border-gray-100 rounded-3xl">
              <h3 className="text-lg font-bold mb-4 uppercase" style={{ color: CHARCOAL }}>Awareness Sessions</h3>
              <div className="text-5xl font-black mb-2" style={{ color: ACCENT }}>05</div>
              <p className="text-sm text-gray-500 font-medium">Sensitization sessions conducted for parents and local community.</p>
              <div className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">800+ Families Reached</div>
           </div>
        </div>

        <div className="bg-gray-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
           <h3 className="text-2xl font-black mb-10 uppercase tracking-widest text-blue-400">Stakeholder Satisfaction</h3>
           <div className="space-y-8">
              {feedbackData.map(f => (
                <div key={f.name}>
                   <div className="flex justify-between items-end mb-2">
                      <span className="text-lg font-bold uppercase tracking-widest">{f.name}</span>
                      <span className="text-3xl font-black">{f.value}%</span>
                   </div>
                   <div className="w-full bg-white/10 rounded-full h-3">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${f.value}%`, backgroundColor: f.fill }}></div>
                   </div>
                </div>
              ))}
           </div>
           <p className="mt-12 text-gray-400 italic text-lg leading-relaxed">
             {"\"The integration of the 'Frustration Zone' and 24/7 Helpline has significantly reduced the friction for students seeking help early.\""}
           </p>
        </div>
      </PageWrapper>

      {/* PAGE 5: COMPLIANCE & INFRASTRUCTURE */}
      <PageWrapper id="univ-pdf-page-5">
        <h2 className="text-3xl font-black mb-12 uppercase tracking-wide border-b-4 pb-4" style={{ color: CHARCOAL, borderColor: PRIMARY }}>
          IV. Compliance & Infrastructure
        </h2>

        <div className="grid grid-cols-1 gap-6 mb-12">
           <div className="p-10 bg-green-50 border border-green-100 rounded-[2.5rem] flex items-center justify-between">
              <div>
                 <h3 className="text-2xl font-black text-green-900 uppercase tracking-widest mb-2">Institutional Helpline</h3>
                 <p className="text-green-800/70 font-medium italic">24x7 Emergency Contact Infrastructure Verified</p>
              </div>
              <div className="px-6 py-3 bg-green-600 text-white rounded-full font-black text-xs uppercase tracking-widest">Compliant</div>
           </div>
           <div className="p-10 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] flex items-center justify-between">
              <div>
                 <h3 className="text-2xl font-black text-indigo-900 uppercase tracking-widest mb-2">Mandatory Visibility</h3>
                 <p className="text-indigo-800/70 font-medium italic">Anti-Ragging & Tele MANAS Displayed in Hostels</p>
              </div>
              <div className="px-6 py-3 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-widest">Compliant</div>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
           <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
              <h3 className="text-lg font-bold mb-4 uppercase" style={{ color: CHARCOAL }}>Safety Audits</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Quarterly infrastructure compliance audits completed. Private counseling spaces and safe-zones verified across all 4 campus sectors.
              </p>
           </div>
           <div className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm">
              <h3 className="text-lg font-bold mb-4 uppercase" style={{ color: CHARCOAL }}>Inclusion Measures</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Dedicated inclusion pathways for marginalized groups and vernacular support (Hindi/Punjabi) fully operational.
              </p>
           </div>
        </div>

        <div className="mt-16 p-12 bg-gray-50 rounded-[3rem] text-center border-2 border-dashed border-gray-200">
           <h3 className="text-xl font-black mb-4 uppercase tracking-widest" style={{ color: PRIMARY }}>Final Compliance Statement</h3>
           <p className="text-gray-600 font-medium max-w-lg mx-auto">
             TherapyConnect hereby certifies that Chandigarh University has met all mental health and well-being infrastructure mandates as prescribed by the University Grants Commission (UGC) for the current reporting period.
           </p>
           <div className="mt-12 flex justify-center gap-20">
              <div className="w-40 h-px bg-gray-300"></div>
              <div className="w-40 h-px bg-gray-300"></div>
           </div>
           <div className="flex justify-center gap-20 mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Institution Seal</span>
              <span>TherapyConnect Lead</span>
           </div>
        </div>
      </PageWrapper>
      
    </div>
  );
}
