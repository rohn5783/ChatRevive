"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import PaymentModal from "@/components/PaymentModal";

export default function HomePage() {
  const { user, isPro, trialUsed, trialLimit } = useAuth();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  return (
    <main className="flex-1">
      {/* Hero Section with WhatsApp Theme */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#075E54] to-[#128C7E] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#25D366_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          {/* Top Pill Offer */}
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-[#25D366] shadow-sm">
            <span>✨</span>
            <span className="text-white">5 Free Chat Uploads Included</span>
            <span className="bg-[#25D366] text-[#054740] px-2 py-0.5 rounded-full text-[10px] font-bold">
              NO CARD REQUIRED
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Turn Raw WhatsApp Exports Into A{" "}
            <span className="text-[#25D366] underline decoration-wavy decoration-[#25D366]/60">
              Living Chat Experience
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-white/90 leading-relaxed font-normal">
            No more squinting at messy `.txt` files. ChatRevive parses your exported WhatsApp chats and reconstructs them with authentic WhatsApp bubbles, voice notes, photos, and instant message search.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/upload"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#25D366] hover:bg-[#20BA5A] text-[#054740] font-bold text-base rounded-xl shadow-lg transition-all hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>📁 Upload Your Chat</span>
              <span className="text-xs bg-[#054740]/10 px-2 py-0.5 rounded-full">5 Free</span>
            </Link>
            <Link
              href="/chat?demo=true"
              className="w-full sm:w-auto px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-base rounded-xl border border-white/20 backdrop-blur-sm transition-colors flex items-center justify-center space-x-2"
            >
              <span>💬 See Demo Chat</span>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="pt-8 flex items-center justify-center space-x-6 sm:space-x-12 text-xs text-white/80 border-t border-white/10 max-w-xl mx-auto">
            <div>
              <div className="font-bold text-lg text-white">5 Free</div>
              <div>Uploads Per Account</div>
            </div>
            <div>
              <div className="font-bold text-lg text-[#25D366]">100% Private</div>
              <div>Parsed In Session</div>
            </div>
            <div>
              <div className="font-bold text-lg text-white">Razorpay Secure</div>
              <div>Instant Pro Unlock</div>
            </div>
          </div>
        </div>
      </section>

      {/* Realistic WhatsApp Web Interactive Mockup Preview */}
      <section className="relative -mt-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 z-20">
        <div className="bg-white rounded-2xl shadow-2xl border border-[#E9EDEF] overflow-hidden">
          {/* Window Frame Bar */}
          <div className="h-10 bg-[#F0F2F5] px-4 flex items-center justify-between border-b border-[#E9EDEF]">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
              <span className="text-xs text-[#667781] font-medium ml-2">ChatRevive Web • WhatsApp Viewer</span>
            </div>
            <div className="text-[11px] font-semibold text-[#00A884]">
              LIVE PREVIEW
            </div>
          </div>

          {/* Simulated WhatsApp Interface */}
          <div className="grid grid-cols-1 md:grid-cols-3 h-96">
            {/* Sidebar list */}
            <div className="hidden md:block bg-white border-r border-[#E9EDEF] p-3 space-y-2">
              <div className="text-xs font-bold text-[#667781] uppercase px-2 mb-2">Recent Chats</div>
              <div className="bg-[#F0F2F5] p-2.5 rounded-lg flex items-center space-x-3 border-l-4 border-[#25D366]">
                <div className="w-10 h-10 rounded-full bg-[#075E54] text-white flex items-center justify-center font-bold text-sm">
                  NH
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-[#111B21] truncate">Neha Sharma</span>
                    <span className="text-[10px] text-[#667781]">10:31 AM</span>
                  </div>
                  <p className="text-[11px] text-[#667781] truncate">
                    Perfect. All set. Good luck, knock them dead! 🚀
                  </p>
                </div>
              </div>
              <div className="p-2.5 rounded-lg flex items-center space-x-3 opacity-60">
                <div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center font-bold text-sm">
                  RC
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-bold text-[#111B21] truncate block">Road Trip 2026 Group</span>
                  <p className="text-[11px] text-[#667781] truncate">Amit: Sharing hotel booking confirmation...</p>
                </div>
              </div>
            </div>

            {/* Simulated Chat Thread */}
            <div className="md:col-span-2 bg-[#EFEAE2] wa-chat-bg p-4 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-3">
                <div className="flex justify-center">
                  <span className="bg-white/90 text-[10px] text-[#667781] px-2.5 py-0.5 rounded shadow-sm">
                    TODAY
                  </span>
                </div>

                {/* Incoming bubble */}
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg px-3 py-1.5 shadow-wa-bubble max-w-xs text-xs text-[#111B21]">
                    <span className="text-[10px] font-bold text-[#128C7E] block">Neha</span>
                    Did you reach Mumbai safely?
                    <div className="text-[9px] text-[#667781] text-right mt-0.5">10:14 AM</div>
                  </div>
                </div>

                {/* Outgoing bubble */}
                <div className="flex justify-end">
                  <div className="bg-[#D9FDD3] rounded-lg px-3 py-1.5 shadow-wa-bubble max-w-xs text-xs text-[#111B21]">
                    Yes! Landed about 30 mins ago. On my way to the hotel now.
                    <div className="text-[9px] text-[#667781] text-right mt-0.5 flex items-center justify-end space-x-1">
                      <span>10:15 AM</span>
                      <span className="text-[#53BDEB] font-bold">✓✓</span>
                    </div>
                  </div>
                </div>

                {/* Incoming Voice Note Bubble */}
                <div className="flex justify-start">
                  <div className="bg-white rounded-lg p-2.5 shadow-wa-bubble max-w-xs text-xs">
                    <span className="text-[10px] font-bold text-[#128C7E] block mb-1">Neha</span>
                    <div className="flex items-center space-x-2 bg-[#F0F2F5] p-1.5 rounded-lg">
                      <span className="w-7 h-7 rounded-full bg-[#00A884] text-white flex items-center justify-center text-xs">
                        ▶
                      </span>
                      <div className="flex items-center space-x-0.5">
                        <span className="w-0.5 h-3 bg-[#00A884] inline-block" />
                        <span className="w-0.5 h-5 bg-[#00A884] inline-block" />
                        <span className="w-0.5 h-2 bg-[#00A884] inline-block" />
                        <span className="w-0.5 h-4 bg-[#00A884] inline-block" />
                        <span className="w-0.5 h-6 bg-[#00A884] inline-block" />
                        <span className="w-0.5 h-3 bg-[#00A884] inline-block" />
                      </div>
                      <span className="text-[10px] text-[#667781]">0:18</span>
                    </div>
                    <div className="text-[9px] text-[#667781] text-right mt-1">10:26 AM</div>
                  </div>
                </div>
              </div>

              {/* Chat Input Bar */}
              <div className="bg-white p-2 rounded-xl flex items-center justify-between border border-[#E9EDEF] shadow-sm">
                <span className="text-xs text-[#8696A0] pl-2">Type or search message...</span>
                <Link
                  href="/upload"
                  className="px-3 py-1 bg-[#00A884] text-white text-xs font-bold rounded-lg hover:bg-[#075E54] transition-colors"
                >
                  Upload Your Chat →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="py-16 bg-white border-y border-[#E9EDEF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold text-[#128C7E] uppercase tracking-wider">Simple 3-Step Process</span>
            <h2 className="text-3xl font-extrabold text-[#111B21]">How ChatRevive Works</h2>
            <p className="text-sm text-[#667781] max-w-xl mx-auto">
              Exporting WhatsApp chats takes 10 seconds. Viewing them should be effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-[#F8FAFC] rounded-2xl border border-[#E9EDEF] space-y-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#075E54] text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-sm">
                1
              </div>
              <h3 className="font-bold text-lg text-[#111B21]">Export from WhatsApp</h3>
              <p className="text-xs text-[#667781] leading-relaxed">
                Open WhatsApp on phone or web → Chat options → <em>Export Chat</em> (with or without media).
              </p>
            </div>

            <div className="p-6 bg-[#F8FAFC] rounded-2xl border border-[#E9EDEF] space-y-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#128C7E] text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-sm">
                2
              </div>
              <h3 className="font-bold text-lg text-[#111B21]">Drop `.txt` File Here</h3>
              <p className="text-xs text-[#667781] leading-relaxed">
                Upload your `.txt` export. You get <strong>5 free uploads</strong> on signup with zero credit card commitment.
              </p>
            </div>

            <div className="p-6 bg-[#F8FAFC] rounded-2xl border border-[#E9EDEF] space-y-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-[#25D366] text-[#054740] font-extrabold text-xl flex items-center justify-center mx-auto shadow-sm">
                3
              </div>
              <h3 className="font-bold text-lg text-[#111B21]">Relive the Conversation</h3>
              <p className="text-xs text-[#667781] leading-relaxed">
                Explore message threads, listen to voice notes, preview photos, filter senders, and export cleanly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section with Razorpay */}
      <section className="py-20 bg-[#F0F2F5] px-4 sm:px-6 lg:px-8" id="pricing">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold text-[#075E54] uppercase tracking-wider">Honest Transparent Pricing</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111B21]">
              Start Free, Upgrade When You Need
            </h2>
            <p className="text-sm text-[#667781] max-w-xl mx-auto">
              Every user receives 5 free uploads. After 5 uploads, upgrade to Pro Lifetime with Razorpay (UPI, Netbanking & Cards).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <div className="bg-white p-8 rounded-2xl border border-[#E9EDEF] shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#667781]">Free Trial</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-black text-[#111B21]">₹0</span>
                  <span className="text-sm text-[#667781]">Free Forever</span>
                </div>
                <p className="text-xs text-[#667781]">
                  Ideal for testing your first few WhatsApp chat exports.
                </p>

                <div className="space-y-2.5 pt-4 text-xs text-[#111B21]">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#25D366] font-bold">✓</span>
                    <span><strong>5 Chat Uploads</strong> free</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#25D366] font-bold">✓</span>
                    <span>Full WhatsApp Web timeline viewer</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#25D366] font-bold">✓</span>
                    <span>Sender filter & message search</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#25D366] font-bold">✓</span>
                    <span>JSON transcript export</span>
                  </div>
                </div>
              </div>

              <Link
                href="/upload"
                className="w-full text-center py-3 bg-[#F0F2F5] hover:bg-[#E9EDEF] text-[#111B21] font-bold text-sm rounded-xl transition-colors"
              >
                Start with 5 Free Uploads
              </Link>
            </div>

            {/* Pro Tier (Razorpay) */}
            <div className="bg-white p-8 rounded-2xl border-2 border-[#25D366] shadow-xl relative flex flex-col justify-between space-y-6">
              <div className="absolute -top-3.5 right-6 bg-[#25D366] text-[#054740] text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                RECOMMENDED
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#075E54]">Pro Lifetime</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-black text-[#111B21]">₹499</span>
                  <span className="text-sm text-[#667781]">INR one-time</span>
                </div>
                <p className="text-xs text-[#667781]">
                  One-time payment for lifetime unlimited chat archiving.
                </p>

                <div className="space-y-2.5 pt-4 text-xs text-[#111B21]">
                  <div className="flex items-center space-x-2">
                    <span className="text-[#25D366] font-bold">✓</span>
                    <span><strong>Unlimited</strong> WhatsApp chat uploads</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#25D366] font-bold">✓</span>
                    <span>Voice notes audio player & waveform</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#25D366] font-bold">✓</span>
                    <span>High-resolution photo & video galleries</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#25D366] font-bold">✓</span>
                    <span>PDF & document previewing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[#25D366] font-bold">✓</span>
                    <span>Instant activation via <strong>Razorpay UPI & Cards</strong></span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setIsPaymentOpen(true)}
                  className="w-full py-3 bg-[#075E54] hover:bg-[#054740] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <span>⚡ Upgrade with Razorpay (₹499)</span>
                </button>
                <div className="text-[10px] text-center text-[#667781]">
                  UPI, GPay, PhonePe, Paytm, RuPay, Netbanking accepted
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#075E54] text-white/80 py-12 px-4 sm:px-6 lg:px-8 border-t border-[#128C7E]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white text-sm">ChatRevive</span>
            <span>• WhatsApp Chat Archive & Explorer</span>
          </div>
          <div>
            Built with Next.js & Razorpay • 100% Client-Side Privacy
          </div>
        </div>
      </footer>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />
    </main>
  );
}

