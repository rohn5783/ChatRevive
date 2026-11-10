import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const getJWTSecret = () => process.env.JWT_SECRET || "demo_chatrevive_secret_key_2026_jwt_token_secure_long";

export const getAuthenticatedUser = async (request) => {
  try {
    let token = null;

    // 1. Try reading cookie
    if (request.cookies) {
      token = request.cookies.get ? request.cookies.get("token")?.value : request.cookies.token;
    }

    // 2. Try Authorization header
    if (!token && request.headers) {
      const authHeader = typeof request.headers.get === "function" 
        ? request.headers.get("authorization") 
        : request.headers.authorization;
        
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, getJWTSecret());
    if (!decoded || !decoded.userId) {
      return null;
    }

    const user = await User.findById(decoded.userId);
    return user || null;
  } catch (err) {
    return null;
  }
};

export const createAuthToken = (userId) => {
  return jwt.sign({ userId }, getJWTSecret(), { expiresIn: "7d" });
};

