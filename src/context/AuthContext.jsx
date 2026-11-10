"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);
const TOKEN_KEY = "chatrevive_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/users/me", {
        headers,
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn("Failed to check auth status:", err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const res = await fetch("/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    if (data.token && typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, data.token);
    }

    if (data.user) {
      setUser(data.user);
    }
    return data;
  };

  const register = async (fullName, email, password) => {
    const res = await fetch("/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password }),
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }

    if (data.token && typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, data.token);
    }

    if (data.user) {
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // ignore
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...(prev || {}), ...updatedUser }));
  };

  const isPro = user?.plan === "pro";
  const trialLimit = user?.trialUploadsLimit ?? 5;
  const trialUsed = user?.trialUploadsUsed ?? 0;
  const remainingUploads = isPro ? "Unlimited" : Math.max(0, trialLimit - trialUsed);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isPro,
        trialLimit,
        trialUsed,
        remainingUploads,
        login,
        register,
        logout,
        updateUser,
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

