import { NextResponse } from "next/server";
import User from "@/models/user.model.js";
import { validateEmail } from "@/lib/validation";
import { sendOTPEmail } from "@/lib/sendEmail";
import { connectDB } from "@/lib/db";

const OTP_EXPIRY_IN_MINUTES = 10;
const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address" },
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
      return NextResponse.json(
        { success: false, message: "Email is already verified" },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_EXPIRY_IN_MINUTES * 60 * 1000);

    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpires = otpExpiry;
    await user.save();

    await sendOTPEmail({
      email: user.email,
      otp,
      fullName: user.fullName,
      expiresInMinutes: OTP_EXPIRY_IN_MINUTES,
    });

    const isDev = process.env.NODE_ENV !== "production";

    return NextResponse.json({
      success: true,
      message: "Verification OTP resent successfully to your email",
      email: user.email,
      otpExpiresAt: otpExpiry,
      otpPreview: isDev ? otp : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to resend OTP", error: error.message },
      { status: 500 }
    );
  }
}
