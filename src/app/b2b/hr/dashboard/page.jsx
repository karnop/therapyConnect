"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Building2, Users, BrainCircuit, ActivitySquare, AlertTriangle, CloudRain
} from "lucide-react";
import { getHRDashboardStats, getCurrentUserProfile } from "@/actions/b2b";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from "recharts";

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="animate-pulse flex flex-col items-center">
          <ActivitySquare size={48} className="text-slate-300 mb-4" />
          <p className="text-slate-400">Loading Organizational Insights...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-red-500">
        Failed to load dashboard. Ensure you have the correct HR privileges.
      </div>
    );
  }

  const poolPercentage = data.totalPoolSessions > 0 
    ? Math.round((data.usedPoolSessions / data.totalPoolSessions) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 font-sans overflow-hidden">
      
      {/* HEADER SECTION */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-200 pb-6 gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2 text-indigo-600">
            <Building2 size={24} />
            <h2 className="text-sm font-semibold uppercase tracking-wider">{data.companyName}</h2>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Executive Organizational Dashboard
          </h1>
          <p className="text-slate-500 mt-2">TherapyConnect {data.tier === 'tier3' ? 'Holistic Culture' : 'B2B'} Partner</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition shadow-sm">
            Export Report
          </button>
        </div>
      </motion.header>

      {/* TOP METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ActivitySquare size={20} />
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Session Pool Utilization</h3>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">{data.usedPoolSessions}</span>
            <span className="text-slate-500 mb-1">/ {data.totalPoolSessions} booked</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden">
            <div 
              className={`h-2 rounded-full ${poolPercentage > 80 ? 'bg-rose-500' : 'bg-indigo-500'}`} 
              style={{ width: `${Math.min(poolPercentage, 100)}%` }}
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <BrainCircuit size={20} />
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md">Last 30 Days</span>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Org Wellness Index (Avg Mood)</h3>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">{data.averageMood}</span>
            <span className="text-slate-500 mb-1">/ 10</span>
          </div>
          <p className="text-sm mt-3 text-slate-500">Based on {data.totalReviews} anonymous logs</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.averageBurnout > 6 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <h3 className="text-slate-500 text-sm font-medium">Burnout Heat Index</h3>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-3xl font-bold text-slate-900">{data.averageBurnout}</span>
            <span className="text-slate-500 mb-1">/ 10</span>
          </div>
          <p className={`text-sm mt-3 font-medium ${data.averageBurnout > 6 ? 'text-rose-600' : 'text-amber-600'}`}>
            {data.averageBurnout > 6 ? 'High risk zone detected' : 'Moderate resilience'}
          </p>
        </motion.div>
      </div>

      {/* TF-IDF WORD CLOUD & TRENDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Word Cloud Visualizer */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <CloudRain className="text-indigo-600" size={24} />
            <h3 className="text-xl font-bold text-slate-900">Dominant Stress Vectors</h3>
          </div>
          <p className="text-sm text-slate-500 mb-8 max-w-md">
            Algorithms scanned {data.totalReviews} anonymous employee journals using TF-IDF prioritization. These terms represent what is uniquely stressing your team right now, heavily masking any personally identifiable information.
          </p>
          
          <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100 p-4">
            {data.wordCloud && data.wordCloud.length > 0 ? (
              <div className="flex flex-wrap gap-3 items-center justify-center h-full align-middle content-center">
                {data.wordCloud.map((word, i) => {
                  // Determine size and color dynamically based on its TF-IDF value rank
                  const isTop = i < 3;
                  const isMid = i >= 3 && i < 8;
                  const sizeClass = isTop ? 'text-3xl md:text-5xl font-black' : isMid ? 'text-xl md:text-2xl font-bold' : 'text-md md:text-lg font-medium';
                  const colorClass = isTop ? 'text-rose-500' : isMid ? 'text-indigo-500' : 'text-slate-400';
                  
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
              <div className="flex items-center justify-center h-full text-slate-400 italic">
                Not enough textual data generated yet.
              </div>
            )}
          </div>
        </motion.div>

        {/* Quantitative Charting representation of words */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 flex flex-col"
        >
          <div className="flex items-center gap-2 mb-6">
            <Users className="text-indigo-600" size={24} />
            <h3 className="text-xl font-bold text-slate-900">Term Frequency Weighting</h3>
          </div>
          
          <div className="flex-1 min-h-[300px] w-full mt-4">
            {data.wordCloud && data.wordCloud.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.wordCloud.slice(0, 7)} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="text" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                    {data.wordCloud.slice(0, 7).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index < 3 ? '#f43f5e' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
               <div className="flex items-center justify-center h-full text-slate-400 italic">
                Insufficient data for charting.
              </div>
            )}
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}
