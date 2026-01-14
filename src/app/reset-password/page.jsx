"use client";

import { useState } from "react";
import { resetPassword } from "@/actions/auth";
import { Loader2, Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await resetPassword(formData);

    setLoading(false);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
    }
  };

  if (!userId || !secret) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center max-w-sm">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="font-bold text-gray-900">Invalid Link</h3>
          <p className="text-gray-500 text-sm mt-2 mb-6">
            This password reset link is invalid or missing required information.
          </p>
          <Link
            href="/forgot-password"
            className="text-secondary font-bold hover:underline"
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-gray-100">
        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Password Reset!
            </h2>
            <p className="text-gray-500 mb-8">
              Your password has been successfully updated. You can now log in
              with your new credentials.
            </p>
            <Link href="/login">
              <button className="w-full bg-secondary text-white font-bold py-3 rounded-xl hover:bg-[#5A7A66] transition-colors">
                Login Now
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Set New Password
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Please create a strong password for your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <input type="hidden" name="userId" value={userId} />
              <input type="hidden" name="secret" value={secret} />

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-3.5 text-gray-400"
                    size={18}
                  />
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none transition-all text-gray-700"
                    placeholder="Min 8 characters"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-4 top-3.5 text-gray-400"
                    size={18}
                  />
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none transition-all text-gray-700"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
