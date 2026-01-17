"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getTherapistData, updateTherapistProfile } from "@/actions/therapist";
import { getInvoiceSettings, updateInvoiceSettings } from "@/actions/invoice";
import {
  Save,
  Loader2,
  User,
  Camera,
  Link as LinkIcon,
  MapPin,
  DollarSign,
  Check,
  Wallet,
  FileBadge,
  CheckCircle2,
  Building2,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { SPECIALTIES_LIST, METRO_STATIONS } from "@/lib/constants";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Notification States
  const [notification, setNotification] = useState({ type: null, message: "" });

  // --- UNIFIED FORM STATE (Controlled) ---
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    specialties: [],
    price60: "",
    meetingLink: "",
    clinicAddress: "",
    metroStation: "",
    paymentInstructions: "",
    // Invoice Specific
    qualification: "",
    rci: "",
    address: "",
    upi: "",
  });

  const [previewImage, setPreviewImage] = useState(null);

  // UI Helpers
  const [metroQuery, setMetroQuery] = useState("");
  const [filteredMetros, setFilteredMetros] = useState([]);
  const [showMetroDropdown, setShowMetroDropdown] = useState(false);
  const fileInputRef = useRef(null);

  // --- 1. FETCH & SYNC DATA ---
  const fetchData = async () => {
    try {
      const [therapistRes, invoiceRes] = await Promise.all([
        getTherapistData(),
        getInvoiceSettings(),
      ]);

      if (therapistRes) {
        const { profile, rates, avatarUrl } = therapistRes;
        setPreviewImage(avatarUrl);
        setMetroQuery(profile.metro_station || "");

        setFormData((prev) => ({
          ...prev,
          fullName: profile.full_name || "",
          bio: profile.bio || "",
          specialties: profile.specialties || [],
          price60: rates.find((r) => r.duration_mins === 60)?.price_inr || "",
          meetingLink: profile.meeting_link || "",
          clinicAddress: profile.clinic_address || "",
          metroStation: profile.metro_station || "",
          paymentInstructions: profile.payment_instructions || "",
        }));
      }

      if (invoiceRes) {
        setFormData((prev) => ({
          ...prev,
          qualification: invoiceRes.qualification || "",
          rci: invoiceRes.rci_number || "",
          address: invoiceRes.business_address || "",
          upi: invoiceRes.upi_id || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  const toggleSpecialty = (item) => {
    setFormData((prev) => {
      const current = prev.specialties || [];
      if (current.includes(item))
        return { ...prev, specialties: current.filter((i) => i !== item) };
      return { ...prev, specialties: [...current, item] };
    });
  };

  const handleMetroChange = (e) => {
    const value = e.target.value;
    setMetroQuery(value);
    setFormData((prev) => ({ ...prev, metroStation: value })); // Sync with form data
    setShowMetroDropdown(true);
    if (value.length > 0) {
      const filtered = METRO_STATIONS.filter((station) =>
        station.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredMetros(filtered);
    } else {
      setFilteredMetros([]);
    }
  };

  const selectMetro = (station) => {
    setMetroQuery(station);
    setFormData((prev) => ({ ...prev, metroStation: station }));
    setShowMetroDropdown(false);
  };

  // --- 3. SUBMIT LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotification({ type: null, message: "" });

    // Construct FormData manually from state to ensure everything is included
    const submissionData = new FormData();

    // Append all text fields
    Object.keys(formData).forEach((key) => {
      if (key === "specialties") {
        submissionData.append(key, formData[key].join(","));
      } else {
        submissionData.append(key, formData[key]);
      }
    });

    // Append file if selected
    if (fileInputRef.current?.files?.[0]) {
      submissionData.append("avatar", fileInputRef.current.files[0]);
    }

    try {
      // Call Actions
      const profileResult = await updateTherapistProfile(submissionData);

      // We assume invoice settings are less critical or handle errors internally,
      // but let's fire them sequentially
      await updateInvoiceSettings(submissionData);

      setSaving(false);

      if (profileResult?.error) {
        setNotification({
          type: "error",
          message: `Failed to update: ${profileResult.error}`,
        });
      } else {
        await fetchData(); // Refresh state
        setNotification({
          type: "success",
          message: "Settings saved successfully",
        });
        router.refresh();
      }
    } catch (err) {
      setSaving(false);
      setNotification({
        type: "error",
        message: "An unexpected error occurred.",
      });
      console.error(err);
    }

    // Auto hide notification after 4 seconds
    setTimeout(() => setNotification({ type: null, message: "" }), 4000);
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-secondary" />
      </div>
    );

  return (
    <div className="relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Settings</h1>
        <p className="text-gray-500 mt-1">
          Customize your public profile and practice details.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 mb-8 overflow-x-auto">
        {[
          { id: "profile", label: "Personal Profile" },
          { id: "practice", label: "Practice & Logistics" },
          { id: "billing", label: "Billing & Compliance" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-semibold transition-all relative shrink-0 ${
              activeTab === tab.id
                ? "text-secondary"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl pb-40 md:pb-24">
        {/* --- TAB 1: PROFILE --- */}
        <div className={activeTab === "profile" ? "block space-y-8" : "hidden"}>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-start">
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md relative">
                {previewImage ? (
                  <Image
                    src={previewImage}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <User size={48} />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium text-xs">
                <Camera size={20} />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
            </div>
            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none transition-all"
                  placeholder="Dr. John Doe"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About You (Bio)
              </label>
              <textarea
                name="bio"
                rows={6}
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary resize-none"
                placeholder="Share your background..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Specialties
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES_LIST.map((item) => {
                  const isSelected = formData.specialties.includes(item);
                  return (
                    <button
                      type="button"
                      key={item}
                      onClick={() => toggleSpecialty(item)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                        isSelected
                          ? "bg-secondary text-white border-secondary shadow-md"
                          : "bg-white text-gray-600 border-gray-200 hover:border-secondary hover:text-secondary"
                      }`}
                    >
                      {item}{" "}
                      {isSelected && (
                        <Check size={14} className="inline-block ml-2 mb-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* --- TAB 2: PRACTICE --- */}
        <div
          className={activeTab === "practice" ? "block space-y-8" : "hidden"}
        >
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <DollarSign size={20} />
              </div>
              <h2 className="text-lg font-bold text-primary">
                Session Pricing
              </h2>
            </div>
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                60 Min Rate
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-gray-400">₹</span>
                <input
                  type="number"
                  name="price60"
                  value={formData.price60}
                  onChange={handleChange}
                  className="w-full pl-8 px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <Wallet size={20} />
              </div>
              <h2 className="text-lg font-bold text-primary">
                Payment Collection
              </h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Instructions for Clients
              </label>
              <textarea
                name="paymentInstructions"
                rows={4}
                value={formData.paymentInstructions}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary resize-none"
                placeholder="e.g. Please UPI to..."
              />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <LinkIcon size={20} />
              </div>
              <h2 className="text-lg font-bold text-primary">Online</h2>
            </div>
            <input
              type="url"
              name="meetingLink"
              value={formData.meetingLink}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary"
              placeholder="Meeting Link"
            />
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <Building2 size={20} />
              </div>
              <h2 className="text-lg font-bold text-primary">Clinic</h2>
            </div>
            <div className="grid gap-6">
              <input
                type="text"
                name="clinicAddress"
                value={formData.clinicAddress}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary"
                placeholder="Address"
              />
              <div className="relative">
                <MapPin
                  className="absolute left-4 top-3.5 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  name="metroStation"
                  value={metroQuery}
                  onChange={handleMetroChange}
                  onFocus={() => setShowMetroDropdown(true)}
                  onBlur={() =>
                    setTimeout(() => setShowMetroDropdown(false), 200)
                  }
                  className="w-full pl-11 px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary"
                />
                {showMetroDropdown && filteredMetros.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {filteredMetros.map((station, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectMetro(station);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {station}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* --- TAB 3: BILLING --- */}
        <div className={activeTab === "billing" ? "block space-y-8" : "hidden"}>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <FileBadge size={20} />
              </div>
              <h2 className="text-lg font-bold text-primary">
                Invoice Compliance
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Qualification
                </label>
                <input
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none text-sm"
                  placeholder="e.g. M.Phil Clinical Psychology"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RCI License Number
                </label>
                <input
                  name="rci"
                  value={formData.rci}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none text-sm"
                  placeholder="e.g. A78945"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Address
                </label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none text-sm resize-none"
                  placeholder="Clinic Address for the Bill"
                />
              </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Wallet size={20} />
              </div>
              <h2 className="text-lg font-bold text-primary">
                Collection Details
              </h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                UPI ID (For QR Code)
              </label>
              <input
                name="upi"
                value={formData.upi}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none text-sm"
                placeholder="e.g. doctor@okicici"
              />
            </div>
          </div>
        </div>

        <div className="fixed bottom-20 md:bottom-0 right-0 left-0 md:left-72 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 flex justify-end z-40 transition-all">
          <button
            type="submit"
            disabled={saving}
            className="bg-secondary hover:bg-[#5A7A66] text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg shadow-secondary/20 flex items-center gap-2 disabled:opacity-70"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}{" "}
            Save Changes
          </button>
        </div>
      </form>

      {/* TOAST NOTIFICATION */}
      {notification.type && (
        <div
          className={`fixed bottom-24 md:bottom-8 right-8 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 ${notification.type === "error" ? "bg-red-600 text-white" : "bg-[#2D2D2D] text-white"}`}
        >
          {notification.type === "error" ? (
            <AlertCircle size={20} />
          ) : (
            <CheckCircle2 className="text-green-400" size={20} />
          )}
          <span className="font-bold text-sm">{notification.message}</span>
        </div>
      )}
    </div>
  );
}
