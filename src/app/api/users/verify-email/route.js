import { NextResponse } from "next/server";
import User from "@/models/user.model.js";
import { validateOTPInput } from "@/lib/validation";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, otp } = body;

    const validation = validateOTPInput({ email, otp });
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: validation.errors[0] },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+emailVerificationOTP +emailVerificationOTPExpires"
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json({
        success: true,
        message: "Email already verified",
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          plan: user.plan,
          isVerified: user.isVerified,
          trialUploadsUsed: user.trialUploadsUsed ?? 0,
          trialUploadsLimit: user.trialUploadsLimit ?? 5,
        },
      });
    }

    if (
      !user.emailVerificationOTP ||
      user.emailVerificationOTP !== otp ||
      !user.emailVerificationOTPExpires ||
      user.emailVerificationOTPExpires < new Date()
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.emailVerificationOTP = null;
    user.emailVerificationOTPExpires = null;
    user.trialUploadsUsed = 0;
    user.trialUploadsLimit = 5;
    user.isTrialActive = true;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Email verified successfully. Free trial activated with 5 uploads.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        plan: user.plan,
        isVerified: user.isVerified,
        trialUploadsUsed: user.trialUploadsUsed,
        trialUploadsLimit: user.trialUploadsLimit,
        paymentInfo: user.paymentInfo,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Email verification failed", error: error.message },
      { status: 500 }
    );
  }
}

