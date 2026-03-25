import assert from "node:assert/strict";
import User from "../../models/user.model.js";
import {
  getCurrentUser,
  googleSignIn,
  loginUser,
  logoutUser,
  registerUser,
  resendEmailOTP,
  verifyEmailOTP,
} from "../../controller/user.controller.js";
import { createMockResponse } from "../helpers/mockHttp.js";
import { test } from "../helpers/testRunner.js";

const originalFindOne = User.findOne;
const originalCreate = User.create;

test.afterEach(() => {
  User.findOne = originalFindOne;
  User.create = originalCreate;
});

test("registerUser creates a new user when email is available", async () => {
  User.findOne = () => ({
    select: async () => null,
  });
  User.create = async ({ fullName, email, isVerified }) => ({
    _id: "user_123",
    fullName,
    email,
    avatarUrl: null,
    authProvider: "local",
    plan: "free",
    isVerified,
    lastLoginAt: null,
    emailVerificationOTP: null,
    emailVerificationOTPExpires: null,
    trialUploadsUsed: 0,
    trialUploadsLimit: 3,
    isTrialActive: true,
    createdAt: new Date("2026-03-22T00:00:00.000Z"),
    updatedAt: new Date("2026-03-22T00:00:00.000Z"),
  });

  const req = {
    body: {
      fullName: "Rahul",
      email: "rahul@example.com",
      password: "secret123",
    },
  };
  const res = createMockResponse();

  await registerUser(req, res);

  assert.equal(res.statusCode, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.message, "Registration successful. You can log in now");
  assert.equal(res.body.user.email, "rahul@example.com");
  assert.equal(res.body.user.isVerified, true);
});

test("registerUser rejects duplicate email", async () => {
  User.findOne = () => ({
    select: async () => ({ _id: "existing-user", isVerified: true }),
  });

  const req = {
    body: {
      fullName: "Rahul",
      email: "rahul@example.com",
      password: "secret123",
    },
  };
  const res = createMockResponse();

  await registerUser(req, res);

  assert.equal(res.statusCode, 409);
  assert.deepEqual(res.body, {
    success: false,
    message: "User already exists",
  });
});

test("loginUser returns success for correct credentials", async () => {
  const fakeUser = {
    _id: "user_123",
    fullName: "Rahul",
    email: "rahul@example.com",
    avatarUrl: null,
    authProvider: "local",
    plan: "free",
    isVerified: true,
    lastLoginAt: null,
    trialUploadsUsed: 0,
    trialUploadsLimit: 3,
    isTrialActive: true,
    createdAt: new Date("2026-03-22T00:00:00.000Z"),
    updatedAt: new Date("2026-03-22T00:00:00.000Z"),
    comparePassword: async (password) => password === "secret123",
    save: async function save() {
      this.updatedAt = new Date("2026-03-22T01:00:00.000Z");
      return this;
    },
  };

  User.findOne = () => ({
    select: async () => fakeUser,
  });

  const req = {
    body: {
      email: "rahul@example.com",
      password: "secret123",
    },
  };
  const res = createMockResponse();

  await loginUser(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.user.email, "rahul@example.com");
  assert.equal(typeof res.body.token, "string");
  assert.equal(res.cookies[0].name, "token");
  assert.equal(typeof res.cookies[0].value, "string");
  assert.equal(res.cookies[0].options.httpOnly, true);
  assert.ok(fakeUser.lastLoginAt instanceof Date);
});

test("loginUser rejects invalid credentials", async () => {
  const fakeUser = {
    authProvider: "local",
    isVerified: true,
    comparePassword: async () => false,
  };

  User.findOne = () => ({
    select: async () => fakeUser,
  });

  const req = {
    body: {
      email: "rahul@example.com",
      password: "wrongpass",
    },
  };
  const res = createMockResponse();

  await loginUser(req, res);

  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, {
    success: false,
    message: "Invalid email or password",
  });
});

test("loginUser rejects unverified users", async () => {
  const fakeUser = {
    authProvider: "local",
    isVerified: false,
  };

  User.findOne = () => ({
    select: async () => fakeUser,
  });

  const req = {
    body: {
      email: "rahul@example.com",
      password: "secret123",
    },
  };
  const res = createMockResponse();

  await loginUser(req, res);

  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, {
    success: false,
    message: "Please verify your email before logging in",
  });
});

test("verifyEmailOTP activates verified account and free trial", async () => {
  const fakeUser = {
    _id: "user_123",
    fullName: "Rahul",
    email: "rahul@example.com",
    avatarUrl: null,
    authProvider: "local",
    plan: "free",
    isVerified: false,
    emailVerificationOTP: "123456",
    emailVerificationOTPExpires: new Date(Date.now() + 10 * 60 * 1000),
    lastLoginAt: null,
    trialUploadsUsed: 2,
    trialUploadsLimit: 3,
    isTrialActive: false,
    createdAt: new Date("2026-03-22T00:00:00.000Z"),
    updatedAt: new Date("2026-03-22T00:00:00.000Z"),
    save: async function save() {
      return this;
    },
  };

  User.findOne = () => ({
    select: async () => fakeUser,
  });

  const req = {
    body: {
      email: "rahul@example.com",
      otp: "123456",
    },
  };
  const res = createMockResponse();

  await verifyEmailOTP(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(fakeUser.isVerified, true);
  assert.equal(fakeUser.trialUploadsUsed, 0);
  assert.equal(fakeUser.trialUploadsLimit, 3);
  assert.equal(fakeUser.isTrialActive, true);
});

test("resendEmailOTP returns a fresh otp for unverified user", async () => {
  const fakeUser = {
    email: "rahul@example.com",
    isVerified: false,
    save: async function save() {
      return this;
    },
  };

  User.findOne = () => ({
    select: async () => fakeUser,
  });

  const req = {
    body: {
      email: "rahul@example.com",
    },
  };
  const res = createMockResponse();

  await resendEmailOTP(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(typeof res.body.otpPreview, "string");
  assert.ok(fakeUser.emailVerificationOTPExpires instanceof Date);
});

test("googleSignIn returns not configured response", async () => {
  const req = {};
  const res = createMockResponse();

  await googleSignIn(req, res);

  assert.equal(res.statusCode, 501);
  assert.deepEqual(res.body, {
    success: false,
    message:
      "Google Sign In backend is not configured yet. Add Google token verification to enable this securely",
  });
});

test("getCurrentUser returns sanitized logged in user", async () => {
  const req = {
    user: {
      _id: "user_123",
      fullName: "Rahul",
      email: "rahul@example.com",
      avatarUrl: null,
      authProvider: "local",
      plan: "free",
      isVerified: true,
      lastLoginAt: null,
      trialUploadsUsed: 0,
      trialUploadsLimit: 3,
      isTrialActive: true,
      createdAt: new Date("2026-03-22T00:00:00.000Z"),
      updatedAt: new Date("2026-03-22T00:00:00.000Z"),
    },
  };
  const res = createMockResponse();

  await getCurrentUser(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.user.email, "rahul@example.com");
});

test("logoutUser clears token cookie", async () => {
  const req = {};
  const res = createMockResponse();

  await logoutUser(req, res);

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.clearedCookies, ["token"]);
  assert.deepEqual(res.body, {
    success: true,
    message: "Logout successful",
  });
});
