"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || "/upload";
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!fullName || !email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    try {
      setIsSubmitting(true);
      await register(fullName, email, password);
      router.push(redirectTo);
    } catch (err) {
      setErrorMsg(err.message || "Registration failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoPreset = () => {
    const randomId = Math.floor(Math.random() * 10000);
    setFullName("Rahul Sharma");
    setEmail(`rahul_${randomId}@example.com`);
    setPassword("password123");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-[#F0F2F5] wa-chat-bg">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-[#E9EDEF]">
        {/* WhatsApp Brand Header */}
        <div className="bg-[#075E54] px-8 py-6 text-white text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#25D366] text-[#054740] shadow-sm mb-1">
            <span>🎁</span>
            <span>5 FREE UPLOADS INCLUDED</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Create Your Account</h1>
          <p className="text-xs text-white/80">Get instant access to WhatsApp chat explorer</p>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#111B21] mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full px-4 py-2.5 bg-[#F0F2F5] text-sm text-[#111B21] rounded-xl border border-transparent focus:bg-white focus:border-[#00A884] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111B21] mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-2.5 bg-[#F0F2F5] text-sm text-[#111B21] rounded-xl border border-transparent focus:bg-white focus:border-[#00A884] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111B21] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-2.5 bg-[#F0F2F5] text-sm text-[#111B21] rounded-xl border border-transparent focus:bg-white focus:border-[#00A884] focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#25D366] hover:bg-[#20BA5A] text-[#054740] font-extrabold text-sm rounded-xl shadow-md transition-all hover:scale-105 disabled:opacity-50"
            >
              {isSubmitting ? "Creating Account..." : "Claim 5 Free Uploads →"}
            </button>
          </form>

          {/* Fill Demo Info Button */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleDemoPreset}
              className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-[#667781] text-xs font-semibold rounded-xl border border-gray-200"
            >
              Fill Sample Demo Values
            </button>
          </div>

          <div className="text-center text-xs text-[#667781]">
            Already have an account?{" "}
            <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="text-[#00A884] font-bold hover:underline">
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-[#075E54] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

