import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { createRazorpayOrder } from "@/lib/payment";

export async function POST(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const result = await createRazorpayOrder({
      user,
      amount: body.amount,
      currency: body.currency,
    });

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create Razorpay order", error: error.message },
      { status: 500 }
    );
  }
}
