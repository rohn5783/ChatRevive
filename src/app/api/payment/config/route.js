import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_demo12345678",
    plan: {
      name: "ChatRevive Pro Lifetime",
      priceINR: 499,
      currency: "INR",
      features: [
        "Unlimited WhatsApp chat exports and uploads",
        "Full media previews (Photos, Voice Notes, Videos, Docs)",
        "Deep message search & speaker filters",
        "Export transcript to PDF & JSON format",
        "WhatsApp Web interface with dark/light mode",
        "Priority processing and cloud backup support",
      ],
    },
  });
}
