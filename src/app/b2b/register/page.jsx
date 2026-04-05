"use client";

import React, { useState } from "react";
import Link from "next/link";
import { registerCorporateEmployee } from "@/actions/auth";

export default function CorporateRegistration() {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function clientSubmit(formData) {
    setIsSubmitting(true);
    setError("");
    const result = await registerCorporateEmployee(formData);

    if (result && result.error) {
      setError(result.error);
      setIsSubmitting(false);
    }
    // if successful, the server action redirects automatically
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900 tracking-tight">
          Corporate Access
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600">
          Create an account using your company&apos;s access code.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-neutral-100">
          <form action={clientSubmit} className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-neutral-700">Full Name</label>
              <div className="mt-1">
                <input required name="fullName" type="text" className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">Work Email</label>
              <div className="mt-1">
                <input required name="email" type="email" className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">Secret Access Code</label>
              <div className="mt-1">
                <input required name="accessCode" type="text" placeholder="e.g. GOOGLE2026" className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm uppercase" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">Phone Number</label>
              <div className="mt-1">
                <input required name="phone" type="tel" className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700">Password</label>
              <div className="mt-1">
                <input required name="password" type="password" className="appearance-none block w-full px-3 py-2 border border-neutral-300 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-200 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition"
              >
                {isSubmitting ? "Verifying..." : "Activate Account"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-neutral-500">Already activated?</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
                Sign in to your dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
