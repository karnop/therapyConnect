"use client";

import { useState, useEffect } from "react";
import { getClientHistory } from "@/actions/crm";
import { Activity, Calendar, FileText, Loader2 } from "lucide-react";
import ClinicalTab from "@/components/crm/tabs/ClinicalTab";
import TimelineTab from "@/components/crm/tabs/TimelineTab";
import AdminTab from "@/components/crm/tabs/AdminTab";

export default function ClientDetailPage({ params }) {
  // We need to fetch the RECORD (for Clinical) and HISTORY (for Timeline)
  // The Header data was already fetched in layout.jsx, but we need dynamic data here.
  // Note: For simplicity in this Server->Client pattern, we'll fetch client-specific data here or pass it down.
  // Ideally, layout passes data, but Next.js layouts can't pass props to children directly.
  // So we fetch specific tab data here.

  // NOTE: Ideally we fetch 'record' via props if we could, but we'll fetch again or pass via context.
  // For MVP, let's fetch "History" client-side to keep it snappy.

  // Wait, we need the `record` object for ClinicalTab (IDs etc).
  // Let's rely on `getClientFullProfile` again. It's fast.

  const [activeTab, setActiveTab] = useState("clinical");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState(null);

  // Lazy load data
  useEffect(() => {
    // We import the server action dynamically to use in useEffect
    const fetchData = async () => {
      const { getClientFullProfile, getClientHistory } = await import(
        "@/actions/crm"
      );
      const profileData = await getClientFullProfile(params.id);
      const historyData = await getClientHistory(params.id);

      setRecord(profileData.record);
      setHistory(historyData);
      setLoading(false);
    };
    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div>
      {/* TABS NAVIGATION */}
      <div className="flex gap-2 mb-8 border-b border-gray-200">
        <TabButton
          active={activeTab === "clinical"}
          onClick={() => setActiveTab("clinical")}
          icon={Activity}
          label="Clinical Snapshot"
        />
        <TabButton
          active={activeTab === "timeline"}
          onClick={() => setActiveTab("timeline")}
          icon={Calendar}
          label="Timeline"
        />
        <TabButton
          active={activeTab === "admin"}
          onClick={() => setActiveTab("admin")}
          icon={FileText}
          label="Admin"
        />
      </div>

      {/* TAB CONTENT */}
      <div>
        {activeTab === "clinical" && <ClinicalTab record={record} />}

        {activeTab === "timeline" && (
          <TimelineTab history={history} clientId={params.id} />
        )}
        {activeTab === "admin" && <AdminTab history={history} />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all ${
        active
          ? "border-secondary text-secondary"
          : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-t-lg"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}
