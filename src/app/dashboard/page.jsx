"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import PaymentModal from "@/components/PaymentModal";

export default function DashboardPage() {
  const { user, isPro, trialUsed, trialLimit, logout } = useAuth();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-[#F0F2F5]">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-[#E9EDEF] max-w-md w-full text-center space-y-4">
          <div className="text-3xl">🔒</div>
          <h2 className="text-lg font-bold text-[#111B21]">Sign in to access your dashboard</h2>
          <p className="text-xs text-[#667781]">
            Create a free account or log in to track your upload quota and explore chats.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Link
              href="/login"
              className="px-5 py-2.5 bg-[#075E54] text-white rounded-xl text-xs font-bold"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 bg-[#25D366] text-[#054740] rounded-xl text-xs font-bold"
            >
              5 Free Uploads
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const remainingUploads = isPro ? "Unlimited" : Math.max(0, trialLimit - trialUsed);

  return (
    <div className="flex-1 bg-[#F0F2F5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* User Welcome Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#E9EDEF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-[#075E54] text-white flex items-center justify-center font-extrabold text-2xl shadow-sm">
              {user.fullName ? user.fullName.slice(0, 2).toUpperCase() : "CR"}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold text-[#111B21]">{user.fullName || "ChatRevive User"}</h1>
                {isPro ? (
                  <span className="bg-[#25D366] text-[#054740] text-[10px] font-black px-2 py-0.5 rounded-full">
                    PRO
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    FREE TIER
                  </span>
                )}
              </div>
              <p className="text-xs text-[#667781] mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Link
              href="/upload"
              className="flex-1 sm:flex-none px-5 py-2.5 bg-[#25D366] hover:bg-[#20BA5A] text-[#054740] font-bold text-xs rounded-xl shadow-sm text-center"
            >
              + Upload Chat
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#111B21] font-semibold text-xs rounded-xl text-center"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Card 1: Plan */}
          <div className="bg-white p-6 rounded-2xl border border-[#E9EDEF] shadow-sm space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667781]">Active Plan</span>
            <div className="text-2xl font-black text-[#111B21]">
              {isPro ? "Pro Lifetime" : "Free Starter"}
            </div>
            <p className="text-xs text-[#667781]">
              {isPro ? "Unlimited chat exports unlocked" : "Includes 5 free chat uploads"}
            </p>
          </div>

          {/* Card 2: Uploads Used */}
          <div className="bg-white p-6 rounded-2xl border border-[#E9EDEF] shadow-sm space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#667781]">Uploads Used</span>
            <div className="text-2xl font-black text-[#075E54]">
              {trialUsed} / {isPro ? "∞" : trialLimit}
            </div>
            <p className="text-xs text-[#667781]">
              {isPro ? "No limits on this account" : `${remainingUploads} free uploads left`}
            </p>
          </div>

          {/* Card 3: Upgrade Status */}
          <div className="bg-white p-6 rounded-2xl border border-[#E9EDEF] shadow-sm space-y-2 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#667781]">Payment Gateway</span>
              <div className="text-lg font-bold text-[#111B21]">
                {user.paymentInfo?.provider ? (
                  <span className="capitalize">{user.paymentInfo.provider}</span>
                ) : (
                  "Razorpay (UPI / Cards)"
                )}
              </div>
            </div>
            {!isPro ? (
              <button
                onClick={() => setIsPaymentOpen(true)}
                className="text-xs font-bold text-[#00A884] hover:underline text-left"
              >
                ⚡ Upgrade to Pro (₹499) →
              </button>
            ) : (
              <span className="text-xs text-emerald-600 font-semibold">✓ Verified Active</span>
            )}
          </div>
        </div>

        {/* Uploads Quota Progress */}
        {!isPro && (
          <div className="bg-white p-6 rounded-2xl border border-[#E9EDEF] shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-[#111B21]">Free Uploads Usage Meter</h3>
                <p className="text-xs text-[#667781]">Your free trial gives you 5 uploads for testing any WhatsApp chats.</p>
              </div>
              <span className="text-xs font-bold text-[#075E54]">
                {trialUsed} of {trialLimit} used
              </span>
            </div>

            <div className="w-full bg-[#F0F2F5] h-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#25D366] rounded-full transition-all"
                style={{ width: `${Math.min(100, (trialUsed / trialLimit) * 100)}%` }}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-gray-100">
              <span className="text-xs text-[#667781]">
                Need more than 5 uploads? Upgrade anytime with instant activation.
              </span>
              <button
                onClick={() => setIsPaymentOpen(true)}
                className="px-5 py-2.5 bg-[#075E54] hover:bg-[#054740] text-white text-xs font-bold rounded-xl shadow-sm transition-transform hover:scale-105 cursor-pointer"
              >
                ⚡ Upgrade to Pro (₹499)
              </button>
            </div>
          </div>
        )}
      </div>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />
    </div>
  );
}

