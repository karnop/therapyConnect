"use client";

import React from "react";
import {
   BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
   LineChart, Line, CartesianGrid, Legend,
   PieChart, Pie, ScatterChart, Scatter
} from "recharts";

export default function ReportPDF({ data }) {
   if (!data) return null;

   const now = new Date();
   const dateString = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

   // Standardized Brand Colors
   const SAGE = "#6B8E78";
   const LIGHT_SAGE = "#F0F4F1";
   const CHARCOAL = "#2D2D2D";
   const MUTE_GREY = "#A3A3A3";
   const WHITE = "#FFFFFF";

   // Formatted Data Sources
   const resilienceData = [
      { name: 'High Risk', value: data.resilienceDistribution?.high_risk || 0, fill: CHARCOAL },
      { name: 'Moderate', value: data.resilienceDistribution?.moderate || 0, fill: MUTE_GREY },
      { name: 'Safe', value: data.resilienceDistribution?.safe || 0, fill: SAGE },
   ];

   let worstDept = "N/A", bestDept = "N/A";
   let highestBurnout = -1, lowestBurnout = 11;
   const depts = data.departmentStats || [];
   if (depts.length > 0) {
      depts.forEach(d => {
         if (d.burnout > highestBurnout) { highestBurnout = d.burnout; worstDept = d.name; }
         if (d.burnout < lowestBurnout) { lowestBurnout = d.burnout; bestDept = d.name; }
      });
   }

   // Two-Column Flex View Wrapper
   const InsightChartSplit = ({ title, insightText, children }) => (
      <div className="flex w-full mb-10 h-64 gap-8">
         {/* Insight Block */}
         <div className="w-1/3 flex flex-col justify-center border-l-4 pl-6" style={{ borderColor: SAGE }}>
            <h3 className="text-xl font-bold mb-3 uppercase tracking-wider" style={{ color: CHARCOAL }}>{title}</h3>
            <p className="text-sm font-medium leading-relaxed text-gray-600">{insightText}</p>
         </div>
         {/* Chart Block */}
         <div className="w-2/3 h-full bg-white p-2">
            {children}
         </div>
      </div>
   );

   return (
      <div className="absolute left-[9999px] top-[9999px] opacity-0 flex flex-col font-sans" style={{ width: '794px' }}>

         {/* PAGE 1: THE MONOLITH COVER */}
         <div id="pdf-page-1" className="w-[794px] h-[1123px] flex flex-col justify-center items-center text-center box-border" style={{ backgroundColor: SAGE }}>
            <div className="mb-12 flex flex-col items-center justify-center gap-6">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <span className="text-4xl font-black tracking-tighter" style={{ color: SAGE }}>TC</span>
               </div>
               <span className="text-3xl font-bold tracking-tight text-white uppercase tracking-widest mt-4">TherapyConnect</span>
            </div>
            <div className="w-48 h-px bg-white/40 mb-12"></div>
            <h1 className="text-5xl font-extrabold text-white tracking-tight mb-4 max-w-lg leading-tight uppercase">
               {data.companyName}
            </h1>
            <h2 className="text-2xl text-white font-medium mb-12 uppercase tracking-widest">
               Executive Summary
            </h2>
            <p className="text-white/90 text-lg font-medium tracking-wide border border-white/30 px-6 py-2 rounded-full">
               Report until the date of: {dateString}
            </p>
         </div>

         {/* PAGE 2: EXECUTIVE ORG HEALTH */}
         <div id="pdf-page-2" className="w-[794px] h-[1123px] bg-white p-16 flex flex-col box-border">
            <h2 className="text-3xl font-black mb-8 uppercase tracking-wide border-b pb-4" style={{ color: CHARCOAL, borderColor: '#F3F4F6' }}>
               I. Executive Org Health
            </h2>

            {/* 1-3. KPI Cards */}
            <div className="grid grid-cols-3 gap-6 mb-16">
               <div className="p-8 flex flex-col justify-start" style={{ backgroundColor: LIGHT_SAGE }}>
                  <div className="text-6xl font-black mb-2" style={{ color: CHARCOAL }}>{data.averageMood}<span className="text-2xl text-gray-500 font-medium">/10</span></div>
                  <h3 className="font-bold uppercase text-xs tracking-wider mb-2" style={{ color: SAGE }}>Average Mood Score</h3>
                  <p className="text-gray-500 text-xs leading-relaxed font-medium">Overall organizational wellness baseline spanning {data.totalReviews} total psychological entries.</p>
               </div>
               <div className="p-8 flex flex-col justify-start" style={{ backgroundColor: LIGHT_SAGE }}>
                  <div className="text-6xl font-black mb-2" style={{ color: CHARCOAL }}>{data.averageBurnout}<span className="text-2xl text-gray-500 font-medium">/10</span></div>
                  <h3 className="font-bold uppercase text-xs tracking-wider mb-2" style={{ color: SAGE }}>Flight Risk Intensity</h3>
                  <p className="text-gray-500 text-xs leading-relaxed font-medium">Sustained values rising above 6.0 correlate exponentially with retention failures.</p>
               </div>
               <div className="p-8 flex flex-col justify-start" style={{ backgroundColor: LIGHT_SAGE }}>
                  <div className="text-5xl font-black mb-3 mt-2" style={{ color: CHARCOAL }}>{data.usedPoolSessions}<span className="text-2xl text-gray-500 font-medium">/{data.totalPoolSessions}</span></div>
                  <h3 className="font-bold uppercase text-xs tracking-wider mb-2" style={{ color: SAGE }}>Session Pool Drawdown</h3>
                  <p className="text-gray-500 text-xs leading-relaxed font-medium">Number of preemptive mental health clinical sessions utilized by your workforce.</p>
               </div>
            </div>

            {/* 4. Resilience Tiers */}
            <InsightChartSplit
               title="Resilience Tiers"
               insightText={`Currently, ${data.resilienceDistribution?.high_risk || 0} journal entries fall into the High-Risk category. We recommend prioritizing outreach to the specific departments driving this baseline metric.`}
            >
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie data={resilienceData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} dataKey="value" stroke="none" label={({ name }) => name} textAnchor="middle" />
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
            </InsightChartSplit>

            {/* 5. Log Participation */}
            <InsightChartSplit
               title="Log Participation"
               insightText="Certain divisions represent the majority of journal entries, indicating higher engagement with the system or potentially higher systemic stress in their area."
            >
               {data.participationSpread && (
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={data.participationSpread} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                        <YAxis tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                        <Bar dataKey="value" barSize={40}>
                           {data.participationSpread.map((e, i) => <Cell key={i} fill={i % 2 === 0 ? SAGE : LIGHT_SAGE} />)}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               )}
            </InsightChartSplit>
         </div>

         {/* PAGE 3: STRUCTURAL VECTORS */}
         <div id="pdf-page-3" className="w-[794px] h-[1123px] bg-white p-16 flex flex-col relative box-border">
            <h2 className="text-3xl font-black mb-12 uppercase tracking-wide border-b pb-4 mt-8" style={{ color: CHARCOAL, borderColor: '#F3F4F6' }}>
               II. Structural Vectors
            </h2>

            {/* 6. Department Isolation Matrix */}
            <InsightChartSplit
               title="Isolation Matrix"
               insightText={`The ${worstDept} department is registering a critical burnout score of ${highestBurnout}/10, placing it under considerable structural friction compared to ${bestDept}.`}
            >
               {data.departmentStats && (
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={data.departmentStats} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                        <YAxis domain={[0, 10]} tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                        <Bar dataKey="burnout" barSize={40}>
                           {data.departmentStats.map((e, i) => <Cell key={i} fill={e.burnout > 6 ? CHARCOAL : SAGE} />)}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               )}
            </InsightChartSplit>

            {/* 7. Mood-Burnout Scatter */}
            <InsightChartSplit
               title="Mood-Burnout Disconnect"
               insightText="A growing disconnect between self-reported mood and actual burnout signals indicates employees may be masking their exhaustion, requiring leadership transparency."
            >
               {data.scatterData && (
                  <ResponsiveContainer width="100%" height="100%">
                     <ScatterChart margin={{ top: 20, right: 30, bottom: 0, left: -20 }}>
                        <XAxis type="number" dataKey="mood" name="Mood" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                        <YAxis type="number" dataKey="burnout" name="Burnout" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                        <Scatter data={data.scatterData} fill={SAGE} />
                     </ScatterChart>
                  </ResponsiveContainer>
               )}
            </InsightChartSplit>

            {/* 8. Text Sentiment Polarity */}
            <div className="flex w-full mt-10 p-12" style={{ backgroundColor: LIGHT_SAGE }}>
               <div className="flex-1">
                  <h3 className="text-2xl font-bold uppercase tracking-wider mb-4" style={{ color: CHARCOAL }}>Semantic Sentiment Polarity</h3>
                  <p className="text-gray-600 font-medium leading-relaxed pr-8">We measure the AFINN-165 textual sentiment weighting. A baseline below zero indicates inherently frustrated or highly negative structural vocabulary appearing in their psychological logs.</p>
               </div>
               <div className="w-1/3 flex items-center justify-end">
                  <span className="text-8xl font-black" style={{ color: data.averageSentiment < 0 ? CHARCOAL : SAGE }}>{data.averageSentiment}</span>
               </div>
            </div>
         </div>

         {/* PAGE 4: CHRONOLOGICAL & SEMANTICS */}
         <div id="pdf-page-4" className="w-[794px] h-[1123px] bg-white p-16 flex flex-col relative box-border">
            <h2 className="text-3xl font-black mb-12 uppercase tracking-wide border-b pb-4 mt-8" style={{ color: CHARCOAL, borderColor: '#F3F4F6' }}>
               III. Chronology & Semantics
            </h2>

            {/* 9. Day-over-Day Volatility */}
            <InsightChartSplit
               title="Temporal Volatility"
               insightText="Volatility tracked through specific days highlights boundary blurring between work and personal time. Extreme weekend or late-week spikes act as a leading indicator of turnover."
            >
               {data.dayStats && (
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={data.dayStats} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                        <YAxis domain={[0, 10]} tick={{ fill: '#9CA3AF', fontSize: 11 }} axisLine={{ stroke: '#E5E7EB' }} tickLine={false} />
                        <Line type="monotone" dataKey="burnout" stroke={SAGE} strokeWidth={4} dot={{ r: 4 }} isAnimationActive={false} />
                     </LineChart>
                  </ResponsiveContainer>
               )}
            </InsightChartSplit>

            {/* 10. Semantic Text & Word Clouds */}
            <InsightChartSplit
               title="Stress Semantics"
               insightText="Keywords isolate organizational stressors, filtering out common vocabulary to pinpoint operational breakdown. Terms below dominate the semantic analysis."
            >
               <div className="w-full h-full flex flex-wrap gap-3 items-center align-middle content-center pt-8">
                  {data.wordCloud && data.wordCloud.map((word, i) => (
                     <span key={i} className="inline-block px-5 py-3 font-semibold text-lg uppercase tracking-wide"
                        style={{ backgroundColor: LIGHT_SAGE, color: CHARCOAL }}>
                        {word.text}
                     </span>
                  ))}
                  {(!data.wordCloud || data.wordCloud.length === 0) && <span className="text-gray-400 italic">Insufficient semantic tracking...</span>}
               </div>
            </InsightChartSplit>

            {/* 11 & 12 Thermal Cal */}
            <div className="flex flex-col w-full mt-10">
               <h3 className="text-xl font-bold uppercase tracking-wider mb-6 pb-2 border-b" style={{ color: CHARCOAL, borderColor: '#F3F4F6' }}>Sequence Heatmap</h3>
               <div className="flex flex-wrap gap-2 w-full p-8 rounded-lg" style={{ backgroundColor: LIGHT_SAGE }}>
                  {data.calendarHeatmap && data.calendarHeatmap.map(ch => (
                     <div key={ch.date} className="w-12 h-12 flex flex-col items-center mx-1 justify-center text-white font-bold text-xs shadow-sm"
                        style={{ backgroundColor: ch.value > 6 ? CHARCOAL : (ch.value > 4 ? MUTE_GREY : SAGE) }}>
                        <span>{ch.date.split('-')[2]}</span>
                     </div>
                  ))}
                  {(!data.calendarHeatmap || data.calendarHeatmap.length === 0) && <div className="text-gray-400 italic">No mapped sequence available.</div>}
               </div>
            </div>
         </div>

         {/* PAGE 5: THE TIER-3 ROADMAP */}
         <div id="pdf-page-5" className="w-[794px] h-[1123px] flex flex-col items-center justify-center relative box-border" style={{ backgroundColor: SAGE }}>
         </div>
      </div>
   );
}
