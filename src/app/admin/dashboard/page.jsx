import { getAnalyticsData } from "@/actions/analytics";
import { Users, TrendingUp, AlertOctagon, Repeat } from "lucide-react";
import {
  GrowthChart,
  VibePieChart,
  HeatMapChart,
} from "@/components/admin/DashboardCharts";

export default async function AdminDashboard() {
  const data = await getAnalyticsData();

  if (!data)
    return (
      <div className="p-20 text-center text-gray-500">
        Initializing Analytics Engine...
      </div>
    );

  const { kpi, graphs, lists } = data;

  return (
    <div className="pb-20 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mission Control</h1>
          <p className="text-gray-500">
            Live health metrics from the marketplace.
          </p>
        </div>
        <div className="bg-white px-3 py-1 rounded-full border border-gray-200 text-xs font-bold text-gray-500 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>{" "}
          Live Data
        </div>
      </div>

      {/* 1. KPI ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Gross Volume (30d)"
          value={`₹${kpi.gmv.toLocaleString()}`}
          sub="Confirmed booking value"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          label="Inventory Fill Rate"
          value={`${kpi.fillRate}%`}
          sub="Slots booked / opened"
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Ghost Rate"
          value={`${kpi.ghostRate}%`}
          sub="Requests rejected"
          icon={AlertOctagon}
          color="red"
        />
        <StatCard
          label="Client Retention"
          value={`${kpi.repeatRate}%`}
          sub="Return for 2nd session"
          icon={Repeat}
          color="purple"
        />
      </div>

      {/* 2. MAIN CHARTS */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Growth Line */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">
            Booking Growth (30 Days)
          </h3>
          <GrowthChart data={graphs.growth} />
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">Market Preference</h3>
          <VibePieChart data={graphs.pie} />

          <div className="mt-6 space-y-3">
            {graphs.pie.map((entry, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.fill }}
                  ></div>
                  <span className="text-gray-600">{entry.name}</span>
                </div>
                <span className="font-bold text-gray-900">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM ROW */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Heatmap */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">Peak Demand Hours</h3>
          <HeatMapChart data={graphs.heat} />
        </div>

        {/* Action List: At Risk Therapists */}
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertOctagon size={18} className="text-red-500" />
            At-Risk Therapists
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Therapists with 0 bookings in 30 days. Call them.
          </p>

          <div className="overflow-y-auto max-h-[200px] space-y-2 pr-2 custom-scrollbar">
            {lists.atRiskTherapists.length > 0 ? (
              lists.atRiskTherapists.map((t) => (
                <div
                  key={t.id}
                  className="flex justify-between items-center p-3 bg-red-50/50 rounded-xl border border-red-100"
                >
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.phone}</p>
                  </div>
                  <button className="text-xs font-bold bg-white text-red-600 px-3 py-1.5 rounded-lg border border-red-200 shadow-sm hover:bg-red-50">
                    Contact
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-400 text-sm">
                No therapists at risk! 🎉
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// KPI Card Component
function StatCard({ label, value, sub, icon: Icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          {label}
        </p>
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`p-3 rounded-xl ${colors[color]}`}>
        <Icon size={24} />
      </div>
    </div>
  );
}
