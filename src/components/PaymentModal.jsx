"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PaymentModal({ isOpen, onClose, onPaymentSuccess }) {
  const router = useRouter();
  const { user, updateUser, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleRazorpay = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      // 1. Ensure Razorpay script is loaded
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Unable to load Razorpay SDK. Please check your internet connection.");
      }

      // 2. Create order on server
      const res = await fetch("/api/payment/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 499, currency: "INR" }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create Razorpay order");
      }

      // 3. Configure Razorpay Checkout options
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "ChatRevive",
        description: "ChatRevive Pro Unlimited Access",
        order_id: data.orderId,
        image: "/favicon.svg",
        prefill: {
          name: user?.fullName || "User",
          email: user?.email || "",
          contact: "9999999999",
        },
        theme: {
          color: "#075E54",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
        handler: async function (response) {
          await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setErrorMsg(response.error.description || "Razorpay payment was cancelled or failed.");
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setErrorMsg(err.message || "Payment initiation failed");
      setLoading(false);
    }
  };

  const handleSimulateTestPayment = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await fetch("/api/payment/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 499, currency: "INR" }),
        credentials: "include",
      });

      const data = await res.json();
      const currentOrderId = data.orderId || `order_test_${Date.now()}`;
      const paymentId = `pay_demo_${Date.now()}`;

      await verifyPayment(currentOrderId, paymentId, "test_signature_valid");
    } catch (err) {
      setErrorMsg(err.message || "Test payment failed");
      setLoading(false);
    }
  };

  const verifyPayment = async (orderId, paymentId, signature) => {
    try {
      const verifyRes = await fetch("/api/payment/razorpay/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        }),
        credentials: "include",
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.message || "Payment verification failed");
      }

      setSuccessMsg("Payment verified! Your account is upgraded to Pro Unlimited.");
      if (verifyData.user) {
        updateUser(verifyData.user);
      }
      await refreshUser();
      if (onPaymentSuccess) onPaymentSuccess(verifyData.user);

      setTimeout(() => {
        onClose();
        router.push("/upload?payment=success&unlocked=true");
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || "Payment verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        {/* WhatsApp Teal Header */}
        <div className="bg-[#075E54] px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white font-bold text-lg shadow-sm">
                ⭐
              </span>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Upgrade to ChatRevive Pro</h3>
                <p className="text-xs text-[#25D366] font-medium">Free uploads limit reached (5/5)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center space-x-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm font-medium flex items-center space-x-2">
              <span>✅</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Pricing Highlight */}
          <div className="bg-[#F0F2F5] rounded-xl p-4 flex items-center justify-between border border-[#E9EDEF]">
            <div>
              <span className="text-xs uppercase font-semibold text-[#667781] tracking-wider">Lifetime Access</span>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-[#111B21]">₹499</span>
                <span className="text-sm font-medium text-[#667781]">INR one-time</span>
              </div>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#25D366]/20 text-[#075E54]">
              One-Time Payment
            </span>
          </div>

          {/* Features list */}
          <div className="space-y-2.5 text-sm text-[#111B21]">
            <div className="flex items-center space-x-2.5">
              <span className="text-[#25D366] font-bold">✓</span>
              <span><strong>Unlimited</strong> WhatsApp chat exports and uploads</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="text-[#25D366] font-bold">✓</span>
              <span><strong>Full media preview</strong> (Voice notes, Photos, Videos, PDFs)</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="text-[#25D366] font-bold">✓</span>
              <span><strong>Deep message search</strong> & speaker filtering</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <span className="text-[#25D366] font-bold">✓</span>
              <span><strong>Export</strong> parsed conversations to PDF or JSON</span>
            </div>
          </div>

          {/* Razorpay Checkout Trigger */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleRazorpay}
              disabled={loading}
              className="w-full flex items-center justify-between px-5 py-4 bg-[#075E54] hover:bg-[#054740] text-white rounded-xl font-semibold shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <span className="bg-white/20 p-2 rounded-lg text-lg">🇮🇳</span>
                <div className="text-left">
                  <div className="text-base font-bold">Pay ₹499 with Razorpay</div>
                  <div className="text-xs text-white/80">UPI (GPay, PhonePe, Paytm), Cards, Netbanking</div>
                </div>
              </div>
              <span className="text-base font-bold">{loading ? "Opening..." : "Pay Now →"}</span>
            </button>

            {/* Test Mode Quick Demo Button */}
            <button
              type="button"
              onClick={handleSimulateTestPayment}
              disabled={loading}
              className="w-full py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span>⚡</span>
              <span>Instant Test Mode Unlock (Demo Bypass)</span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="pt-2 text-center text-xs text-[#8696A0] flex items-center justify-center space-x-4 border-t border-gray-100">
            <span>🔒 256-bit SSL Secured</span>
            <span>•</span>
            <span>⚡ Instant Pro Activation</span>
            <span>•</span>
            <span>🛡️ Powered by Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
}
