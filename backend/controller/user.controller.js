import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../utils/sendEmail.js";

const OTP_EXPIRY_IN_MINUTES = 10;
const JWT_EXPIRES_IN = "7d";

const generateOTP = () =>
  String(Math.floor(100000 + Math.random() * 900000));

const getJWTSecret = () => process.env.JWT_SECRET || "dev_jwt_secret_change_me";

const createAuthToken = (userId) =>
  jwt.sign({ userId }, getJWTSecret(), { expiresIn: JWT_EXPIRES_IN });

const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const sanitizeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  avatarUrl: user.avatarUrl,
  authProvider: user.authProvider,
  plan: user.plan,
  isVerified: user.isVerified,
  lastLoginAt: user.lastLoginAt,
  trialUploadsUsed: user.trialUploadsUsed,
  trialUploadsLimit: user.trialUploadsLimit,
  isTrialActive: user.isTrialActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const shouldReturnOTPPreview = () => process.env.NODE_ENV !== "production";

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }
    const user = await User.create({
      fullName,
      email: normalizedEmail,
      password,
      authProvider: "local",
      isVerified: true,
      emailVerificationOTP: null,
      emailVerificationOTPExpires: null,
      trialUploadsUsed: 0,
      trialUploadsLimit: 3,
      isTrialActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful. You can log in now",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Registration failed:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

export const verifyEmailOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+emailVerificationOTP +emailVerificationOTPExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: "Email already verified",
        user: sanitizeUser(user),
      });
    }

    if (
      !user.emailVerificationOTP ||
      user.emailVerificationOTP !== otp ||
      !user.emailVerificationOTPExpires ||
      user.emailVerificationOTPExpires < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    user.isVerified = true;
    user.emailVerificationOTP = null;
    user.emailVerificationOTPExpires = null;
    user.trialUploadsUsed = 0;
    user.trialUploadsLimit = 3;
    user.isTrialActive = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. Free trial activated",
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Email verification failed",
      error: error.message,
    });
  }
};

export const resendEmailOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+emailVerificationOTP +emailVerificationOTPExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(
      Date.now() + OTP_EXPIRY_IN_MINUTES * 60 * 1000
    );

    user.emailVerificationOTP = otp;
    user.emailVerificationOTPExpires = otpExpiry;
    await user.save();

    await sendOTPEmail({
      email: user.email,
      otp,
      fullName: user.fullName,
      expiresInMinutes: OTP_EXPIRY_IN_MINUTES,
    });

    return res.status(200).json({
      success: true,
      message: "Verification OTP resent successfully to your email",
      email: user.email,
      otpExpiresAt: otpExpiry,
      otpPreview: shouldReturnOTPPreview() ? otp : undefined,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
      error: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.authProvider === "google") {
      return res.status(400).json({
        success: false,
        message: "Use Google Sign In for this account",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    user.lastLoginAt = new Date();
    await user.save();
    const token = createAuthToken(user._id.toString());

    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

export const googleSignIn = async (req, res) => {
  return res.status(501).json({
    success: false,
    message:
      "Google Sign In backend is not configured yet. Add Google token verification to enable this securely",
  });
};

export const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: sanitizeUser(req.user),
  });
};

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
};
