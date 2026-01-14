"use client";

import { useState } from "react";
import { requestPasswordRecovery } from "@/actions/auth";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await requestPasswordRecovery(formData);

    setLoading(false);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-gray-100">
        {success ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Check your inbox
            </h2>
            <p className="text-gray-500 mb-8">
              We've sent a password reset link to your email. Please click it to
              create a new password.
            </p>
            <Link href="/login">
              <button className="w-full bg-secondary text-white font-bold py-3 rounded-xl hover:bg-[#5A7A66] transition-colors">
                Back to Login
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm font-medium mb-6 transition-colors"
              >
                <ArrowLeft size={16} /> Back to Login
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Forgot Password?
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Enter your email and we'll send you a recovery link.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-4 top-3.5 text-gray-400"
                    size={18}
                  />
                  <input
                    name="email"
                    type="email"
                    required
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-secondary outline-none transition-all text-gray-700"
                    placeholder="name@example.com"
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
                  "Send Reset Link"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
