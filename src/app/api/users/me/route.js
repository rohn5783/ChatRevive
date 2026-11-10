import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";

export async function GET(request) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        plan: user.plan,
        isVerified: user.isVerified,
        trialUploadsUsed: user.trialUploadsUsed ?? 0,
        trialUploadsLimit: user.trialUploadsLimit ?? 5,
        paymentInfo: user.paymentInfo ?? null,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch user", error: error.message },
      { status: 500 }
    );
  }
}
