"use client";

import Link from "next/link";
import { login } from "@/actions/auth";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "next/navigation"; // Import this

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // 1. Get Redirect Param
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setIsLoading(false);
      setErrors({ form: result.error });
    }
  };

  const getInputClass = (fieldName) => {
    return `w-full px-4 py-3 rounded-xl border outline-none transition-all bg-gray-50 focus:bg-white 
    ${
      errors[fieldName] || errors.form
        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
        : "border-gray-200 focus:border-secondary focus:ring-2 focus:ring-secondary/20"
    }`;
  };

  return (
    <div className="min-h-screen flex bg-surface">
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-24 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-primary mb-2">
              Welcome back
            </h1>
            <p className="text-gray-500">
              Please enter your details to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 2. Hidden Input to pass redirect path to Server Action */}
            {redirectPath && (
              <input type="hidden" name="redirect" value={redirectPath} />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                className={getInputClass("email")}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                className={getInputClass("password")}
                placeholder="••••••••"
              />
            </div>

            {errors.form && (
              <p className="text-red-500 text-sm font-medium text-center">
                {errors.form}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-secondary hover:bg-[#5A7A66] disabled:bg-secondary/70 text-white font-semibold py-3.5 rounded-xl transition-all shadow-soft flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500">
              Don&apos;t have an account?{" "}
              {/* 3. Carry the redirect param to signup page if user switches */}
              <Link
                href={
                  redirectPath
                    ? `/signup?redirect=${encodeURIComponent(redirectPath)}`
                    : "/signup"
                }
                className="text-secondary font-semibold hover:underline"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 bg-[#F2F4F3] relative items-center justify-center p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-[#E8ECEA] rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] bg-[#D8E0DB] rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        </div>

        <div className="relative z-10 max-w-lg text-center">
          <div className="mb-8 relative">
            <div className="w-64 h-64 bg-white/50 backdrop-blur-sm rounded-full mx-auto shadow-sm border border-white/60 flex items-center justify-center">
              <span className="text-6xl">🌿</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-primary mb-4">
            Find your safe space.
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            &apos;TherapyConnect made it so easy to find someone who actually
            understood my culture and background. It felt like talking to a
            friend.&apos;
          </p>
        </div>
      </div>
    </div>
  );
}
