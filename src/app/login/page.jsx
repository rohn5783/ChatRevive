"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirect") || "/upload";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      router.push(redirectTo);
    } catch (err) {
      setErrorMsg(err.message || "Login failed. Check your email and password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMsg("");
    setEmail("demo@chatrevive.com");
    setPassword("password123");

    try {
      setIsSubmitting(true);
      // Try login first; if demo user doesn't exist yet, auto register then login
      try {
        await login("demo@chatrevive.com", "password123");
        router.push(redirectTo);
      } catch {
        // Auto register demo user
        const regRes = await fetch("/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: "Demo User",
            email: "demo@chatrevive.com",
            password: "password123",
          }),
        });
        const regData = await regRes.json();
        if (regData.token) {
          localStorage.setItem("chatrevive_token", regData.token);
          router.push(redirectTo);
        } else {
          await login("demo@chatrevive.com", "password123");
          router.push(redirectTo);
        }
      }
    } catch (err) {
      setErrorMsg("Demo login error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-[#F0F2F5] wa-chat-bg">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-[#E9EDEF]">
        {/* WhatsApp Brand Header */}
        <div className="bg-[#075E54] px-8 py-6 text-white text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#25D366] text-[#054740] flex items-center justify-center font-bold text-xl mx-auto shadow-md">
            💬
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Log into ChatRevive</h1>
          <p className="text-xs text-white/80">Access your chats and free upload balance</p>
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
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-[#F0F2F5] text-sm text-[#111B21] rounded-xl border border-transparent focus:bg-white focus:border-[#00A884] focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#075E54] hover:bg-[#054740] text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Signing in..." : "Log In"}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#E7FFDB] hover:bg-[#d5fbc4] text-[#075E54] border border-[#25D366]/40 font-bold text-xs rounded-xl transition-colors flex items-center justify-center space-x-2"
            >
              <span>⚡</span>
              <span>One-Click Demo Account Login</span>
            </button>
          </div>

          <div className="text-center text-xs text-[#667781]">
            Don&apos;t have an account?{" "}
            <Link href={`/register?redirect=${encodeURIComponent(redirectTo)}`} className="text-[#00A884] font-bold hover:underline">
              Register with 5 Free Uploads
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-[#075E54] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

