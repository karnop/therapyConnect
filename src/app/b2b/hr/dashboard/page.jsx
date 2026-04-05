"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, Users, BrainCircuit, ActivitySquare, AlertTriangle, CloudRain
} from "lucide-react";
import { getHRDashboardStats, getCurrentUserProfile } from "@/actions/b2b";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid, Legend
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ReportPDF from "@/components/ReportPDF";

export default function HRDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const auth = await getCurrentUserProfile();
      if (auth.success && auth.profile.company_id) {
        const res = await getHRDashboardStats(auth.profile.company_id);
        if (res.success) {
          setData(res.stats);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans">
        <div className="animate-pulse flex flex-col items-center">
          <ActivitySquare size={48} className="text-secondary/40 mb-4" />
          <p className="text-secondary/70">Loading Organizational Insights...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center font-sans text-red-500">
        Failed to load dashboard. Ensure you have the correct HR privileges.
      </div>
    );
  }

  const poolPercentage = data.totalPoolSessions > 0 
    ? Math.round((data.usedPoolSessions / data.totalPoolSessions) * 100) 
    : 0;

  const handleExport = async () => {
    const btn = document.getElementById("export-btn");
    if (btn) btn.innerHTML = "Generating PDF...";
    
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      for (let i = 1; i <= 5; i++) {
        const pageElem = document.getElementById(`pdf-page-${i}`);
        if (!pageElem) continue;
        
        await document.fonts.ready; // crucial for exact rendering
        
        const canvas = await html2canvas(pageElem, { scale: 1.5, useCORS: true });
        const imgData = canvas.toDataURL("image/jpeg", 0.7);
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        if (i > 1) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      }
      pdf.save(`${data.companyName.replace(/\s+/g, '_')}_Wellness_Report.pdf`);
    } catch (e) {
      alert("Error printing PDF");
    } finally {
      if (btn) btn.innerHTML = "Export Report";
    }
  };

  return (
    <div className="min-h-screen bg-background text-primary p-6 md:p-12 font-sans overflow-hidden relative">
      
      {/* Hidden 5-Page Report for PDF Exporter */}
      <ReportPDF data={data} />

      <div className="max-w-7xl mx-auto">
      
      {/* HEADER SECTION */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 pb-6 gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2 text-secondary">
            <Building2 size={24} />
            <h2 className="text-sm font-semibold uppercase tracking-wider">{data.companyName}</h2>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            Executive Organizational Dashboard
          </h1>
          <p className="text-gray-500 mt-2">TherapyConnect {data.tier === 'tier3' ? 'Holistic Culture' : 'B2B'} Partner</p>
        </div>
        <div className="flex gap-4">
          <button 
            id="export-btn"
            onClick={handleExport}
            className="px-6 py-2 bg-secondary text-white rounded-lg text-sm font-medium hover:bg-secondary/90 transition shadow-md"
          >
            Export Report
          </button>
        </div>
      </motion.header>

      {/* TOP METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <ActivitySquare size={20} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Session Pool Utilization</h3>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-bold text-primary">{data.usedPoolSessions}</span>
            <span className="text-gray-500 mb-1">/ {data.totalPoolSessions} booked</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-2 mt-4 overflow-hidden">
            <div 
              className={`h-2 rounded-full ${poolPercentage > 80 ? 'bg-accent' : 'bg-secondary'}`} 
              style={{ width: `${Math.min(poolPercentage, 100)}%` }}
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
              <BrainCircuit size={20} />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-gray-50 text-gray-600 rounded-md border border-gray-100">Last 30 Days</span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Org Wellness Index (Avg Mood)</h3>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-bold text-primary">{data.averageMood}</span>
            <span className="text-gray-500 mb-1">/ 10</span>
          </div>
          <p className="text-sm mt-3 text-gray-500">Based on {data.totalReviews} anonymous logs</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.averageBurnout > 6 ? 'bg-accent/10 text-accent' : 'bg-secondary/10 text-secondary'}`}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Burnout Heat Index</h3>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-bold text-primary">{data.averageBurnout}</span>
            <span className="text-gray-500 mb-1">/ 10</span>
          </div>
          <p className={`text-sm mt-3 font-medium ${data.averageBurnout > 6 ? 'text-accent' : 'text-secondary'}`}>
            {data.averageBurnout > 6 ? 'High risk zone detected' : 'Moderate resilience'}
          </p>
        </motion.div>
      </div>

      {/* TF-IDF WORD CLOUD & TRENDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Word Cloud Visualizer */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <CloudRain className="text-secondary" size={24} />
            <h3 className="text-xl font-bold text-primary">Dominant Stress Vectors</h3>
          </div>
          <p className="text-sm text-gray-500 mb-8 max-w-md">
            Algorithms scanned {data.totalReviews} anonymous employee journals using TF-IDF prioritization.
          </p>
          
          <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-xl bg-[#FAF9F6] border border-gray-100 p-4">
            {data.wordCloud && data.wordCloud.length > 0 ? (
              <div className="flex flex-wrap gap-3 items-center justify-center h-full align-middle content-center">
                {data.wordCloud.map((word, i) => {
                  const isTop = i < 3;
                  const isMid = i >= 3 && i < 8;
                  const sizeClass = isTop ? 'text-3xl md:text-5xl font-black' : isMid ? 'text-xl md:text-2xl font-bold' : 'text-md md:text-lg font-medium';
                  const colorClass = isTop ? 'text-accent' : isMid ? 'text-secondary' : 'text-gray-400';
                  
                  return (
                    <motion.span 
                      key={word.text}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + (i * 0.1) }}
                      className={`inline-block px-2 ${sizeClass} ${colorClass} hover:scale-110 transition cursor-default`}
                      style={{ opacity: Math.max(0.4, 1 - (i * 0.05)) }}
                    >
                      {word.text}
                    </motion.span>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 italic">
                Not enough textual data generated yet.
              </div>
            )}
          </div>
        </motion.div>

        {/* Quantitative Charting */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-6">
            <Users className="text-secondary" size={24} />
            <h3 className="text-xl font-bold text-primary">Term Frequency Weighting</h3>
          </div>
          
          <div className="flex-1 min-h-[300px] w-full mt-4">
            {data.wordCloud && data.wordCloud.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.wordCloud.slice(0, 7)} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="text" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} />
                  <Tooltip 
                    cursor={{fill: '#FAF9F6'}}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} 
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {data.wordCloud.slice(0, 7).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index < 3 ? '#E09F7D' : '#6B8E78'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex items-center justify-center h-full text-gray-400 italic">
                Insufficient data for charting.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* DEPARTMENT & WEEKLY METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Department Burnout Heatmap */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="text-secondary" size={24} />
            <h3 className="text-xl font-bold text-primary">Department Burnout Matrix</h3>
          </div>
          <div className="flex-1 w-full mt-4 min-h-[300px]">
             {data.departmentStats && data.departmentStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.departmentStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#FAF9F6'}}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} 
                  />
                  <Bar dataKey="burnout" name="Burnout / 10" radius={[4, 4, 0, 0]} barSize={40}>
                    {data.departmentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.burnout > 6 ? '#E09F7D' : '#6B8E78'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex items-center justify-center h-full text-gray-400 italic">
                No department data provided yet.
              </div>
            )}
          </div>
        </motion.div>

        {/* Weekly Day-Over-Day Volatility */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:p-8 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-6">
            <ActivitySquare className="text-secondary" size={24} />
            <h3 className="text-xl font-bold text-primary">Weekly Volatility Index</h3>
          </div>
          <div className="flex-1 w-full mt-4 min-h-[300px]">
            {data.dayStats && data.dayStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.dayStats} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }} 
                  />
                  <Legend verticalAlign="top" iconType="circle" />
                  <Line type="monotone" dataKey="burnout" stroke="#E09F7D" strokeWidth={3} dot={{r: 4, fill: '#E09F7D'}} name="Burnout" />
                  <Line type="monotone" dataKey="mood" stroke="#6B8E78" strokeWidth={3} dot={{r: 4, fill: '#6B8E78'}} name="Mood" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex items-center justify-center h-full text-gray-400 italic">
                Insufficient data for weekly tracking.
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
      </div>
    </div>
  );
}
