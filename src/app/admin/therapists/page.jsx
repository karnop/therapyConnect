"use client";

import { useState, useEffect } from "react";
import {
  getAllTherapists,
  toggleTherapistVerification,
  getTherapistDeepDive,
} from "@/actions/admin";
import {
  BadgeCheck,
  ShieldAlert,
  Loader2,
  Search,
  Filter,
  Eye,
  X,
  Mail,
  Phone,
  ExternalLink,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import Image from "next/image";

export default function AdminTherapistsPage() {
  const [therapists, setTherapists] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = async () => {
    const data = await getAllTherapists();
    setTherapists(data);
    setFiltered(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Search & Filter
  useEffect(() => {
    let result = therapists;

    if (filterStatus !== "all") {
      const isVerified = filterStatus === "verified";
      result = result.filter((t) => t.is_verified === isVerified);
    }

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (t) =>
          t.full_name?.toLowerCase().includes(q) ||
          t.email?.toLowerCase().includes(q),
      );
    }
    setFiltered(result);
  }, [query, filterStatus, therapists]);

  const handleToggle = async (id, currentStatus) => {
    const updatedList = therapists.map((t) =>
      t.$id === id ? { ...t, is_verified: !currentStatus } : t,
    );
    setTherapists(updatedList);
    await toggleTherapistVerification(id, !currentStatus);
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );

  return (
    <div className="pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Therapist Directory
        </h1>
        <p className="text-gray-500">
          Manage {therapists.length} registered partners.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-gray-400 outline-none text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-400" />
          <select
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:bg-white outline-none cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="verified">Verified Only</option>
            <option value="pending">Pending Verification</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((t) => (
                <tr key={t.$id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">
                      {t.full_name || "Unnamed"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {t.email || t.phone_number || "No Contact"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {t.is_verified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                        <BadgeCheck size={12} /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
                        <ShieldAlert size={12} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {t.$createdAt
                      ? format(parseISO(t.$createdAt), "MMM d, yyyy")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedId(t.$id)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Inspect Profile"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleToggle(t.$id, t.is_verified)}
                      className={`text-xs font-bold px-3 py-2 rounded-lg border transition-all ${
                        t.is_verified
                          ? "border-red-200 text-red-600 hover:bg-red-50"
                          : "border-green-200 text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {t.is_verified ? "Revoke" : "Approve"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-10 text-center text-gray-400 text-sm">
              No therapists found matching your filters.
            </div>
          )}
        </div>
      </div>

      {selectedId && (
        <InspectorModal
          userId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENT: INSPECTOR MODAL ---
function InspectorModal({ userId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getTherapistDeepDive(userId)
      .then((res) => {
        if (!res) {
          setError(true);
        } else {
          setData(res);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
        <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
          <h3 className="font-bold text-gray-900">
            Therapist Profile Inspector
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-20 flex justify-center">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        ) : error || !data ? (
          <div className="p-10 text-center">
            <p className="text-red-500 font-bold">
              Failed to load therapist details.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              The user document might be missing or corrupted.
            </p>
          </div>
        ) : (
          <div className="p-8">
            {/* SAFE RENDER: Check every field */}
            <div className="flex gap-6 items-start mb-8">
              <div className="w-24 h-24 bg-gray-200 rounded-2xl shrink-0 overflow-hidden border border-gray-100 relative">
                {data.avatarUrl ? (
                  <Image
                    src={data.avatarUrl}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                    {data.full_name?.[0] || "?"}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {data.full_name || "Unknown Name"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {data.email || "No Email Provided"}
                </p>
                <p className="text-sm text-gray-500">
                  {data.phone_number || "No Phone Provided"}
                </p>

                <div className="flex gap-3 mt-4">
                  {data.email && (
                    <a
                      href={`mailto:${data.email}`}
                      className="text-xs font-bold flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-200"
                    >
                      <Mail size={12} /> Email
                    </a>
                  )}
                  {data.phone_number && (
                    <a
                      href={`tel:${data.phone_number}`}
                      className="text-xs font-bold flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-200"
                    >
                      <Phone size={12} /> Call
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase">
                  Bookings
                </span>
                <p className="text-xl font-bold text-gray-900">
                  {data.totalBookings || 0}
                </p>
              </div>
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase">
                  Status
                </span>
                <p className="text-xl font-bold text-gray-900">
                  {data.is_verified ? "Verified" : "Unverified"}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-2">Bio</h4>
                <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-600 leading-relaxed max-h-40 overflow-y-auto">
                  {data.bio || "No bio provided yet."}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">
                    Specialties
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.specialties && data.specialties.length > 0 ? (
                      data.specialties.map((s, i) => (
                        <span
                          key={i}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">
                        None selected
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2">
                    Logistics
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-center gap-2">
                      {data.meeting_link
                        ? "✅ Online Link Set"
                        : "❌ No Meeting Link"}
                    </li>
                    <li className="flex items-center gap-2">
                      {data.clinic_address
                        ? "✅ Clinic Address Set"
                        : "❌ No Clinic Address"}
                    </li>
                    <li className="flex items-center gap-2">
                      {data.payment_instructions
                        ? "✅ Payment Info Set"
                        : "❌ No Payment Info"}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
