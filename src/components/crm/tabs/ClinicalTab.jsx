"use client";

import { useState } from "react";
import { updateClinicalRecord } from "@/actions/crm";
import { Save, Loader2, FileText, Pill, Phone, ListChecks } from "lucide-react";

export default function ClinicalTab({ record }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    await updateClinicalRecord(record.$id, formData);
    setIsSaving(false);
    // Optional: Show toast
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 animate-in slide-in-from-bottom-2"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800 text-lg">Clinical Snapshot</h3>
        <button
          type="submit"
          disabled={isSaving}
          className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-70"
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Save size={16} />
          )}
          Save Changes
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Presenting Problem */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm md:col-span-2">
          <div className="flex items-center gap-2 text-gray-500 mb-3 uppercase text-xs font-bold tracking-wider">
            <FileText size={16} /> Presenting Problem & Diagnosis
          </div>
          <textarea
            name="presentingProblem"
            defaultValue={record.presenting_problem}
            className="w-full min-h-[120px] p-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-secondary outline-none transition-all resize-y text-sm leading-relaxed"
            placeholder="Describe the core issues, symptoms, and initial observations..."
          />
        </div>

        {/* Medications */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-3 uppercase text-xs font-bold tracking-wider">
            <Pill size={16} /> Current Medications
          </div>
          <textarea
            name="medications"
            defaultValue={record.medications}
            className="w-full min-h-[100px] p-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-secondary outline-none transition-all resize-none text-sm"
            placeholder="List medications, dosage, and prescribing psychiatrist..."
          />
        </div>

        {/* Emergency Contact */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-3 uppercase text-xs font-bold tracking-wider">
            <Phone size={16} /> Emergency Contact
          </div>
          <textarea
            name="emergencyContact"
            defaultValue={record.emergency_contact}
            className="w-full min-h-[100px] p-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-secondary outline-none transition-all resize-none text-sm"
            placeholder="Name, Relation, Phone Number..."
          />
        </div>

        {/* Homework / Action Plan */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm md:col-span-2">
          <div className="flex items-center gap-2 text-gray-500 mb-3 uppercase text-xs font-bold tracking-wider">
            <ListChecks size={16} /> Homework & Action Plan (Shared View)
          </div>
          <textarea
            name="homeworkList"
            defaultValue={record.homework_list}
            className="w-full min-h-[150px] p-3 rounded-xl border border-gray-100 bg-blue-50/30 focus:bg-white focus:border-secondary outline-none transition-all resize-y text-sm font-medium text-gray-700"
            placeholder="- Practice grounding techniques 3x/week&#10;- Fill mood journal daily"
          />
          <p className="text-[10px] text-gray-400 mt-2 text-right">
            Visible to client on their dashboard
          </p>
        </div>
      </div>
    </form>
  );
}
