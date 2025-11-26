"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getTherapistData, updateTherapistProfile } from "@/actions/therapist";
import {
  Save,
  Loader2,
  User,
  Building2,
  Camera,
  Link as LinkIcon,
  MapPin,
  DollarSign,
  Check,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import { SPECIALTIES_LIST, METRO_STATIONS } from "@/lib/constants";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [data, setData] = useState({ profile: {}, rates: [], avatarUrl: null });
  const [previewImage, setPreviewImage] = useState(null);

  // Form States
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);

  // Metro Autocomplete States
  const [metroQuery, setMetroQuery] = useState("");
  const [filteredMetros, setFilteredMetros] = useState([]);
  const [showMetroDropdown, setShowMetroDropdown] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    getTherapistData().then((res) => {
      if (res) {
        setData(res);
        setPreviewImage(res.avatarUrl);
        if (res.profile.specialties) {
          setSelectedSpecialties(res.profile.specialties);
        }
        if (res.profile.metro_station) {
          setMetroQuery(res.profile.metro_station);
        }
      }
      setLoading(false);
    });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
    }
  };

  const toggleSpecialty = (item) => {
    if (selectedSpecialties.includes(item)) {
      setSelectedSpecialties((prev) => prev.filter((i) => i !== item));
    } else {
      setSelectedSpecialties((prev) => [...prev, item]);
    }
  };

  // Metro Filter Logic
  const handleMetroChange = (e) => {
    const value = e.target.value;
    setMetroQuery(value);
    setShowMetroDropdown(true);

    if (value.length > 0) {
      const filtered = METRO_STATIONS.filter((station) =>
        station.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredMetros(filtered);
    } else {
      setFilteredMetros([]);
    }
  };

  const selectMetro = (station) => {
    // 1. Update the input value
    setMetroQuery(station);
    // 2. Close dropdown
    setShowMetroDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    await updateTherapistProfile(formData);
    setSaving(false);
    alert("Settings updated successfully!");
    router.refresh();
  };

  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-secondary" />
      </div>
    );

  const rate60 =
    data.rates.find((r) => r.duration_mins === 60)?.price_inr || "";

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Settings</h1>
        <p className="text-gray-500 mt-1">
          Customize your public profile and practice details.
        </p>
      </div>

      {/* --- TABS --- */}
      <div className="flex gap-6 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-4 text-sm font-semibold transition-all relative ${
            activeTab === "profile"
              ? "text-secondary"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Personal Profile
          {activeTab === "profile" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("practice")}
          className={`pb-4 text-sm font-semibold transition-all relative ${
            activeTab === "practice"
              ? "text-secondary"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Practice & Logistics
          {activeTab === "practice" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-full"></div>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl pb-20">
        {/* --- TAB 1: PERSONAL PROFILE --- */}
        <div className={activeTab === "profile" ? "block space-y-8" : "hidden"}>
          {/* Avatar & Name */}
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
                name="avatar"
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
                  type="text"
                  name="fullName"
                  defaultValue={data.profile.full_name}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                  placeholder="Dr. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Title
                </label>
                <input
                  type="text"
                  disabled
                  value="Licensed Therapist"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Bio & Specialties */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About You (Bio)
              </label>
              <textarea
                name="bio"
                rows={6}
                defaultValue={data.profile.bio}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all resize-none"
                placeholder="Share your background, approach to therapy, and what clients can expect..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Specialties
              </label>
              <input
                type="hidden"
                name="specialties"
                value={selectedSpecialties.join(",")}
              />

              <div className="flex flex-wrap gap-2">
                {SPECIALTIES_LIST.map((item) => {
                  const isSelected = selectedSpecialties.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleSpecialty(item)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                        isSelected
                          ? "bg-secondary text-white border-secondary shadow-md shadow-secondary/20"
                          : "bg-white text-gray-600 border-gray-200 hover:border-secondary hover:text-secondary"
                      }`}
                    >
                      {item}
                      {isSelected && (
                        <Check size={14} className="inline-block ml-2 mb-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Select all that apply. These help clients find you.
              </p>
            </div>
          </div>
        </div>

        {/* --- TAB 2: PRACTICE & LOGISTICS --- */}
        <div
          className={activeTab === "practice" ? "block space-y-8" : "hidden"}
        >
          {/* Pricing */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <DollarSign size={20} />
              </div>
              <h2 className="text-lg font-bold text-primary">
                Session Pricing
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  60 Minute Session
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400 font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="price60"
                    defaultValue={rate60}
                    className="w-full pl-8 px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all font-medium"
                    placeholder="2000"
                  />
                </div>
              </div>
              <div className="opacity-50 pointer-events-none grayscale">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  30 Minute Session
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-gray-400 font-medium">
                    ₹
                  </span>
                  <input
                    disabled
                    type="text"
                    value="Coming Soon"
                    className="w-full pl-8 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Online Settings */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <LinkIcon size={20} />
              </div>
              <h2 className="text-lg font-bold text-primary">Online Therapy</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permanent Meeting Link
              </label>
              <input
                type="url"
                name="meetingLink"
                defaultValue={data.profile.meeting_link || ""}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                placeholder="https://meet.google.com/..."
              />
              <p className="text-xs text-gray-400 mt-2">
                Clients receive this link automatically for online bookings.
              </p>
            </div>
          </div>

          {/* In-Person Settings */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <Building2 size={20} />
              </div>
              <h2 className="text-lg font-bold text-primary">
                In-Person Clinic
              </h2>
            </div>
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clinic Address
                </label>
                <input
                  type="text"
                  name="clinicAddress"
                  defaultValue={data.profile.clinic_address || ""}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                  placeholder="e.g. B-44, Defence Colony, New Delhi"
                />
              </div>

              {/* Metro Station Autocomplete */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nearest Metro Station
                </label>
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
                    onBlur={() => {
                      // Small timeout to allow onMouseDown to fire first
                      setTimeout(() => setShowMetroDropdown(false), 200);
                    }}
                    className="w-full pl-11 px-4 py-3 rounded-xl border border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                    placeholder="Start typing station name..."
                  />
                  <div className="absolute right-4 top-3.5 pointer-events-none text-gray-400">
                    <ChevronDown size={18} />
                  </div>
                </div>

                {/* Dropdown Menu */}
                {showMetroDropdown && filteredMetros.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {filteredMetros.map((station, idx) => (
                      <button
                        key={idx}
                        type="button"
                        // Use onMouseDown instead of onClick to fire before blur
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent focus loss
                          selectMetro(station);
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-secondary hover:font-medium transition-colors border-b border-gray-50 last:border-0"
                      >
                        {station}
                      </button>
                    ))}
                  </div>
                )}
                {showMetroDropdown &&
                  metroQuery.length > 0 &&
                  filteredMetros.length === 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl px-4 py-3 text-sm text-gray-400">
                      No stations found.
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Save Bar */}
        <div className="fixed bottom-0 right-0 left-0 md:left-72 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 flex justify-end z-20">
          <button
            type="submit"
            disabled={saving}
            className="bg-secondary hover:bg-[#5A7A66] text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg shadow-secondary/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
