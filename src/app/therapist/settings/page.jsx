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
  ChevronDown,
  Wallet,
  FileBadge,
  AlertTriangle,
  CheckCircle2,
  X,
  Building2,
} from "lucide-react";
import Image from "next/image";
import { SPECIALTIES_LIST, METRO_STATIONS } from "@/lib/constants";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Feedback States
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [data, setData] = useState({ profile: {}, rates: [], avatarUrl: null });
  const [previewImage, setPreviewImage] = useState(null);

  const [invoiceForm, setInvoiceForm] = useState({
    qualification: "",
    rci: "",
    address: "",
    upi: "",
    payment_instructions: "",
  });

  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    specialties: [],
    price30: "",
    price60: "",
    price90: "",
    meetingLink: "",
    clinicAddress: "",
    metroStation: "",
  });

  const [metroQuery, setMetroQuery] = useState("");
  const [filteredMetros, setFilteredMetros] = useState([]);
  const [showMetroDropdown, setShowMetroDropdown] = useState(false);
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    try {
      const [therapistRes, invoiceRes] = await Promise.all([
        getTherapistData(),
        getInvoiceSettings(),
      ]);

      if (therapistRes) {
        const { profile, rates, avatarUrl } = therapistRes;
        setData(therapistRes);
        setPreviewImage(avatarUrl);
        setMetroQuery(profile.metro_station || "");

        setFormData((prev) => ({
          ...prev,
          fullName: profile.full_name || "",
          bio: profile.bio || "",
          specialties: profile.specialties || [],
          price30: rates.find((r) => r.duration_mins === 30)?.price_inr || "",
          price60: rates.find((r) => r.duration_mins === 60)?.price_inr || "",
          price90: rates.find((r) => r.duration_mins === 90)?.price_inr || "",
          meetingLink: profile.meeting_link || "",
          clinicAddress: profile.clinic_address || "",
          metroStation: profile.metro_station || "",
        }));

        setInvoiceForm((prev) => ({
          ...prev,
          payment_instructions: profile.payment_instructions || "",
        }));
      }

      if (invoiceRes) {
        setInvoiceForm((prev) => ({
          ...prev,
          qualification: invoiceRes.qualification || "",
          rci: invoiceRes.rci_number || "",
          address: invoiceRes.business_address || "",
          upi: invoiceRes.upi_id || "",
        }));
      }
    } catch (err) {
      setError("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers
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
    setFormData((prev) => ({ ...prev, metroStation: value }));
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
  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoiceForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit Logic
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const submissionData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "specialties")
        submissionData.append(key, formData[key].join(","));
      else submissionData.append(key, formData[key]);
    });
    Object.keys(invoiceForm).forEach((key) =>
      submissionData.append(key, invoiceForm[key]),
    );
    if (fileInputRef.current?.files?.[0])
      submissionData.append("avatar", fileInputRef.current.files[0]);

    try {
      const profileRes = await updateTherapistProfile(submissionData);
      if (profileRes.error) throw new Error(profileRes.error);

      // Always try to save invoice settings if we are in that context or have data
      const invoiceRes = await updateInvoiceSettings(submissionData);
      if (invoiceRes.error) throw new Error(invoiceRes.error);

      await fetchData();
      setSuccess("Settings updated successfully.");
      router.refresh();
    } catch (err) {
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
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

      {/* ERROR / SUCCESS MESSAGES */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertTriangle className="shrink-0 mt-0.5" size={18} />
          <div className="flex-1 text-sm">{error}</div>
          <button onClick={() => setError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
          <div className="flex-1 text-sm font-bold">{success}</div>
          <button onClick={() => setSuccess(null)}>
            <X size={16} />
          </button>
        </div>
      )}

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
            className={`pb-4 text-sm font-semibold transition-all relative shrink-0 ${activeTab === tab.id ? "text-secondary" : "text-gray-400 hover:text-gray-600"}`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-full"></div>
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl pb-40 md:pb-24">
        {/* TAB 1: PROFILE */}
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
                />
              </div>
              {/* Title field removed per request */}
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
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${isSelected ? "bg-secondary text-white border-secondary shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-secondary hover:text-secondary"}`}
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

        {/* TAB 2: PRACTICE */}
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
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  30 Mins
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="price30"
                    value={formData.price30}
                    onChange={handleChange}
                    className="w-full pl-8 px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  60 Mins
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="price60"
                    value={formData.price60}
                    onChange={handleChange}
                    className="w-full pl-8 px-4 py-3 rounded-xl border border-secondary bg-secondary/5 focus:border-secondary outline-none font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                  90 Mins
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="price90"
                    value={formData.price90}
                    onChange={handleChange}
                    className="w-full pl-8 px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none"
                  />
                </div>
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
                Payment Instructions
              </label>
              <textarea
                name="paymentInstructions"
                rows={4}
                value={invoiceForm.payment_instructions}
                onChange={handleInvoiceChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary resize-none"
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
                  value={invoiceForm.qualification}
                  onChange={handleInvoiceChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RCI License Number
                </label>
                <input
                  name="rci"
                  value={invoiceForm.rci}
                  onChange={handleInvoiceChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Address
                </label>
                <textarea
                  name="address"
                  rows={2}
                  value={invoiceForm.address}
                  onChange={handleInvoiceChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none text-sm resize-none"
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
                UPI ID
              </label>
              <input
                name="upi"
                value={invoiceForm.upi}
                onChange={handleInvoiceChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none text-sm"
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
    </div>
  );
}
