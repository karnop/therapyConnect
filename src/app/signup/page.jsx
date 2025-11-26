"use client";

import Link from "next/link";
import { signup } from "@/actions/auth";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({}); // Stores { email: "Error text", password: "Error text" }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({}); // Clear previous errors

    const formData = new FormData(e.currentTarget);

    // Call server action directly
    const result = await signup(formData);

    if (result?.error) {
      setIsLoading(false);
      // If the server returns a specific field error (e.g. { error: "Bad email", field: "email" })
      if (result.field) {
        setErrors({ [result.field]: result.error });
      } else {
        // Otherwise show a generic error at the top or attach to a default field
        setErrors({ form: result.error });
      }
    }
    // If successful, the server action redirects, so we don't need to do anything here
  };

  // Helper to get input classes based on error state
  const getInputClass = (fieldName) => {
    return `w-full px-4 py-3 rounded-xl border outline-none transition-all bg-gray-50 focus:bg-white 
    ${
      errors[fieldName]
        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
        : "border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
    }`;
  };

  return (
    <div className="min-h-screen flex bg-surface">
      {/* LEFT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Create an account
            </h1>
            <p className="text-gray-500">
              Start your journey to mental wellness today.
            </p>
          </div>

          {/* Generic Form Error */}
          {errors.form && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm font-medium">
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                name="fullName"
                type="text"
                required
                className={getInputClass("fullName")}
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                name="phone"
                type="tel"
                required
                pattern="[0-9]{10}"
                title="Please enter a valid 10-digit phone number"
                className={getInputClass("phone")}
                placeholder="9876543210"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className={getInputClass("email")}
                placeholder="name@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                className={getInputClass("password")}
                placeholder="Create a strong password (min 8 chars)"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary hover:bg-[#5A7A66] disabled:bg-secondary/70 text-white font-semibold py-3.5 rounded-xl transition-all shadow-soft flex items-center justify-center gap-2 group mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 mb-2">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-secondary font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
            <p className="text-sm text-gray-400">
              Are you a therapist?{" "}
              <a
                href="mailto:onboarding@therapyconnect.in"
                className="text-gray-600 hover:text-primary underline"
              >
                Contact us to join
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary/5 relative items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-[#E09F7D] rounded-full mix-blend-multiply filter blur-[80px] opacity-20"></div>
          <div className="absolute top-[20%] left-[20%] w-[600px] h-[600px] bg-[#6B8E78] rounded-full mix-blend-multiply filter blur-[80px] opacity-10"></div>
        </div>

        <div className="relative z-10 max-w-lg text-center">
          <h2 className="text-4xl font-bold text-primary mb-6">
            Begin your journey.
          </h2>
          <div className="space-y-4 text-left bg-white/60 backdrop-blur-md p-8 rounded-2xl border border-white/50 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-secondary/20 p-2 rounded-full text-secondary">
                ✓
              </div>
              <div>
                <h4 className="font-semibold text-primary">Verified Experts</h4>
                <p className="text-sm text-gray-600">
                  Every therapist is vetted for credentials and safety.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-secondary/20 p-2 rounded-full text-secondary">
                ✓
              </div>
              <div>
                <h4 className="font-semibold text-primary">Private & Secure</h4>
                <p className="text-sm text-gray-600">
                  Your data and sessions are completely confidential.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-secondary/20 p-2 rounded-full text-secondary">
                ✓
              </div>
              <div>
                <h4 className="font-semibold text-primary">Flexible Booking</h4>
                <p className="text-sm text-gray-600">
                  Online or In-person. 30, 60, or 120 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
