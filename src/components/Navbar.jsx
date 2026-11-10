"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PaymentModal from "./PaymentModal";

export default function Navbar() {
  const { user, isPro, trialUsed, trialLimit, logout } = useAuth();
  const pathname = usePathname();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#075E54] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2.5 group">
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.27-2.42 5.82a8.19 8.19 0 0 1-5.82 2.41c-1.45 0-2.87-.38-4.13-1.11l-.3-.17-3.12.82.83-3.04-.19-.31a8.19 8.19 0 0 1-1.25-4.42c0-4.54 3.7-8.24 8.24-8.24zm4.8 11.66c-.26-.13-1.54-.76-1.78-.85-.24-.09-.41-.13-.59.13-.17.26-.68.85-.83 1.02-.15.17-.3.2-.56.07-.26-.13-1.1-.4-2.09-1.29-.77-.69-1.29-1.54-1.44-1.8-.15-.26-.02-.4.11-.53.12-.12.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.59-1.42-.81-1.94-.21-.52-.43-.45-.59-.46h-.51c-.17 0-.45.06-.68.32-.23.26-.89.87-.89 2.12s.91 2.46 1.04 2.63c.13.17 1.79 2.73 4.33 3.83.6.26 1.08.42 1.45.53.61.2 1.16.17 1.6.1.49-.07 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.06-.11-.23-.17-.49-.3z" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xl tracking-tight text-white leading-none">
                    Chat<span className="text-[#25D366]">Revive</span>
                  </span>
                  <span className="text-[10px] text-white/70 font-medium tracking-wide">
                    WhatsApp Chat Explorer
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/upload"
                className={`transition-colors hover:text-[#25D366] ${
                  pathname === "/upload" ? "text-[#25D366] font-semibold" : "text-white/90"
                }`}
              >
                Upload Chat
              </Link>
              <Link
                href="/chat"
                className={`transition-colors hover:text-[#25D366] ${
                  pathname === "/chat" ? "text-[#25D366] font-semibold" : "text-white/90"
                }`}
              >
                Chat Viewer
              </Link>
              <Link
                href="/pricing"
                className={`transition-colors hover:text-[#25D366] ${
                  pathname === "/pricing" ? "text-[#25D366] font-semibold" : "text-white/90"
                }`}
              >
                Pricing
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className={`transition-colors hover:text-[#25D366] ${
                    pathname === "/dashboard" ? "text-[#25D366] font-semibold" : "text-white/90"
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </nav>

            {/* Right side Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  {/* Upload Meter / Pro Badge */}
                  {isPro ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#25D366] text-[#054740] shadow-sm">
                      ⭐ PRO UNLIMITED
                    </span>
                  ) : (
                    <button
                      onClick={() => setIsPaymentOpen(true)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all"
                      title="Click to upgrade"
                    >
                      <span className="text-[#25D366]">⚡</span>
                      <span>{trialUsed} / {trialLimit} Free Uploads</span>
                      <span className="underline ml-1 text-[#25D366]">Upgrade</span>
                    </button>
                  )}

                  <span className="text-sm text-white/80 max-w-[140px] truncate" title={user.email}>
                    {user.fullName || user.email}
                  </span>

                  <button
                    onClick={logout}
                    className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-lg text-white/90 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-semibold text-white hover:text-[#25D366] transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-semibold bg-[#25D366] hover:bg-[#20BA5A] text-[#054740] rounded-lg shadow-sm transition-transform hover:scale-105"
                  >
                    5 Free Uploads
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10"
                aria-label="Toggle navigation menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#054740] px-4 pt-3 pb-5 space-y-3 border-t border-[#128C7E]/40">
            <Link
              href="/upload"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-white font-medium hover:text-[#25D366]"
            >
              Upload Chat
            </Link>
            <Link
              href="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-white font-medium hover:text-[#25D366]"
            >
              Chat Viewer
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-white font-medium hover:text-[#25D366]"
            >
              Pricing
            </Link>
            {user ? (
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="text-xs text-white/70">
                  Plan: {isPro ? "PRO UNLIMITED" : `${trialUsed}/${trialLimit} Free Uploads`}
                </div>
                {!isPro && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsPaymentOpen(true);
                    }}
                    className="w-full text-left text-sm font-semibold text-[#25D366]"
                  >
                    ⚡ Upgrade to Pro (Razorpay ₹499)
                  </button>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left text-sm text-red-300 font-medium pt-1"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-2 flex flex-col space-y-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 bg-white/10 rounded-lg text-white font-semibold"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 bg-[#25D366] text-[#054740] rounded-lg font-bold"
                >
                  Start with 5 Free Uploads
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
      />
    </>
  );
}

