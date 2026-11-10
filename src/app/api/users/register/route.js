import { NextResponse } from "next/server";
import User from "@/models/user.model.js";
import { createAuthToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";

export async function POST(request) {
  try {
    await connectDB();
    const { fullName, email, password } = await request.json();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Full name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists" },
        { status: 409 }
      );
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      authProvider: "local",
      isVerified: true,
      trialUploadsUsed: 0,
      trialUploadsLimit: 5,
      isTrialActive: true,
    });

    const token = createAuthToken(user._id.toString());

    const response = NextResponse.json(
      {
        success: true,
        message: "Registration successful. You can now use ChatRevive with 5 free uploads!",
        token,
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
      },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json(
      { success: false, message: "Registration failed", error: error.message },
      { status: 500 }
    );
  }
}
