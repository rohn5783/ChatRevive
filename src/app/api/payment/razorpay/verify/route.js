import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { verifyRazorpayPayment } from "@/lib/payment";
import { connectDB } from "@/lib/db";

export async function POST(request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    const result = await verifyRazorpayPayment({
      user,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("Razorpay verification failed:", error);
    return NextResponse.json(
      { success: false, message: "Payment verification failed", error: error.message },
      { status: 500 }
    );
  }
}
