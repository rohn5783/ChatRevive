"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import PaymentModal from "@/components/PaymentModal";

export default function PricingPage() {
  const { user, isPro, trialUsed, trialLimit } = useAuth();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  return (
    <div className="flex-1 bg-[#F0F2F5] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-[#075E54] uppercase tracking-wider">
            Flexible & Affordable
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111B21]">
            Simple Pricing for Everyone
          </h1>
          <p className="text-sm text-[#667781] max-w-lg mx-auto">
            Explore 5 chats for free. When you need more, unlock unlimited lifetime exports with Razorpay (UPI, Netbanking & Cards).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Free Tier Card */}
          <div className="bg-white rounded-2xl p-8 border border-[#E9EDEF] shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-[#667781] tracking-wider">Free Starter</span>
                <span className="text-[11px] font-semibold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">
                  Included
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-[#111B21]">₹0</span>
                <span className="text-sm text-[#667781]">/ Free</span>
              </div>
              <p className="text-xs text-[#667781]">
                Perfect for quickly checking out an old conversation or exploring a single export.
              </p>

              <div className="space-y-3 pt-4 border-t border-gray-100 text-xs text-[#111B21]">
                <div className="flex items-center space-x-2.5">
                  <span className="text-[#25D366] font-bold">✓</span>
                  <span><strong>5 Free Chat Uploads</strong></span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span className="text-[#25D366] font-bold">✓</span>
                  <span>Authentic WhatsApp Web timeline view</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span className="text-[#25D366] font-bold">✓</span>
                  <span>Participant filter & in-chat search</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span className="text-[#25D366] font-bold">✓</span>
                  <span>JSON transcript download</span>
                </div>
              </div>
            </div>

            <Link
              href="/upload"
              className="w-full text-center py-3.5 bg-[#F0F2F5] hover:bg-[#E9EDEF] text-[#111B21] font-bold text-sm rounded-xl transition-colors"
            >
              Start Free (5 Uploads)
            </Link>
          </div>

          {/* Pro Unlimited Card */}
          <div className="bg-white rounded-2xl p-8 border-2 border-[#25D366] shadow-xl relative flex flex-col justify-between space-y-6">
            <div className="absolute -top-3.5 right-6 bg-[#25D366] text-[#054740] text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              BEST VALUE
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-[#075E54] tracking-wider">ChatRevive Pro</span>
                <span className="text-[11px] font-bold bg-[#25D366]/20 text-[#075E54] px-2.5 py-0.5 rounded-full">
                  Lifetime Pass
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-black text-[#111B21]">₹499</span>
                <span className="text-sm text-[#667781]">INR one-time</span>
              </div>
              <p className="text-xs text-[#667781]">
                One-time payment. No monthly recurring fees. Unlimited exports forever.
              </p>

              <div className="space-y-3 pt-4 border-t border-gray-100 text-xs text-[#111B21]">
                <div className="flex items-center space-x-2.5">
                  <span className="text-[#25D366] font-bold">✓</span>
                  <span><strong>Unlimited WhatsApp Chat Uploads</strong></span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span className="text-[#25D366] font-bold">✓</span>
                  <span>Voice notes audio player with scrubber</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span className="text-[#25D366] font-bold">✓</span>
                  <span>Photo & video gallery previews</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span className="text-[#25D366] font-bold">✓</span>
                  <span>PDF & document attachments view</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <span className="text-[#25D366] font-bold">✓</span>
                  <span>Razorpay (UPI, GPay, Paytm, Cards, Netbanking)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {isPro ? (
                <div className="w-full py-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-center font-bold text-sm rounded-xl">
                  ✓ You Already Own Pro Lifetime
                </div>
              ) : (
                  <button
                    onClick={() => setIsPaymentOpen(true)}
                    className="w-full py-3.5 bg-[#075E54] hover:bg-[#054740] text-white font-bold text-sm rounded-xl shadow-md transition-transform hover:scale-105 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>⚡ Pay ₹499 with Razorpay</span>
                  </button>
              )}
              <div className="text-[10px] text-center text-[#667781]">
                Secure 256-bit encryption • Instant account upgrade
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Accordion or Cards */}
        <div className="bg-white rounded-2xl p-8 border border-[#E9EDEF] space-y-6">
          <h2 className="text-xl font-bold text-[#111B21]">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#667781] leading-relaxed">
            <div className="space-y-1.5">
              <div className="font-bold text-sm text-[#111B21]">How do 5 free uploads work?</div>
              <p>When you register, you automatically receive 5 free uploads. You can upload any WhatsApp exported chat (.txt) up to 5 times at zero cost.</p>
            </div>
            <div className="space-y-1.5">
              <div className="font-bold text-sm text-[#111B21]">Which payment methods are accepted?</div>
              <p>We support <strong>Razorpay</strong>, allowing you to pay using UPI (Google Pay, PhonePe, Paytm), RuPay, Indian Netbanking, and Credit/Debit cards.</p>
            </div>
            <div className="space-y-1.5">
              <div className="font-bold text-sm text-[#111B21]">Is my WhatsApp data kept private?</div>
              <p>Yes, 100%. ChatRevive parses the chats directly in your session. Your messages are never sold, shared, or indexed.</p>
            </div>
            <div className="space-y-1.5">
              <div className="font-bold text-sm text-[#111B21]">Can I upload photos and voice notes?</div>
              <p>Yes! When you export your chat from WhatsApp with media, simply select the .txt along with the media files or unpack the ZIP, and they will link automatically.</p>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />
    </div>
  );
}
