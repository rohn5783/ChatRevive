import express from "express";
import {
  getCurrentUser,
  googleSignIn,
  loginUser,
  logoutUser,
  registerUser,
  resendEmailOTP,
  verifyEmailOTP,
} from "../controller/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  validateEmailOnly,
  validateEmailOTPVerification,
  validateLogin,
  validateRegister,
} from "../validation/index.js";

const router = express.Router();

router.post("/register", validateRegister, registerUser);
router.post("/verify-email", validateEmailOTPVerification, verifyEmailOTP);
router.post("/resend-otp", validateEmailOnly, resendEmailOTP);
router.post("/login", validateLogin, loginUser);
router.post("/google-signin", googleSignIn);
router.get("/me", protectRoute, getCurrentUser);
router.post("/logout", logoutUser);

export default router;
