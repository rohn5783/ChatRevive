import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import User from "../../src/models/user.model.js";
import { getAuthenticatedUser, createAuthToken } from "../../src/lib/auth.js";
import { test } from "../helpers/testRunner.js";

const originalFindById = User.findById;

test.afterEach(() => {
  User.findById = originalFindById;
});

test("createAuthToken generates valid JWT token", () => {
  const token = createAuthToken("user_test_123");
  assert.ok(typeof token === "string");
  assert.ok(token.length > 20);

  const decoded = jwt.decode(token);
  assert.equal(decoded.userId, "user_test_123");
});

test("getAuthenticatedUser returns null when no token is present", async () => {
  const req = { cookies: { get: () => null }, headers: { get: () => null } };
  const user = await getAuthenticatedUser(req);
  assert.equal(user, null);
});

test("getAuthenticatedUser returns user from valid Authorization header", async () => {
  const fakeUser = {
    _id: "user_test_456",
    fullName: "Pooja Sharma",
    email: "pooja@example.com",
    plan: "free",
    trialUploadsUsed: 2,
    trialUploadsLimit: 5,
  };

  User.findById = async (id) => (id === fakeUser._id ? fakeUser : null);

  const token = createAuthToken(fakeUser._id);
  const req = {
    cookies: { get: () => null },
    headers: {
      get: (header) => (header.toLowerCase() === "authorization" ? `Bearer ${token}` : null),
    },
  };

  const user = await getAuthenticatedUser(req);
  assert.ok(user);
  assert.equal(user.email, "pooja@example.com");
  assert.equal(user.trialUploadsLimit, 5);
});

test("getAuthenticatedUser extracts token from cookie", async () => {
  const fakeUser = {
    _id: "user_cookie_888",
    fullName: "Cookie User",
    email: "cookie@example.com",
    plan: "free",
    trialUploadsUsed: 1,
    trialUploadsLimit: 5,
  };

  User.findById = async (id) => (id === fakeUser._id ? fakeUser : null);

  const token = createAuthToken(fakeUser._id);
  const req = {
    cookies: {
      get: (key) => (key === "token" ? { value: token } : null),
    },
    headers: { get: () => null },
  };

  const user = await getAuthenticatedUser(req);
  assert.ok(user);
  assert.equal(user.email, "cookie@example.com");
});

test("getAuthenticatedUser rejects invalid or tampered token", async () => {
  const req = {
    cookies: {
      get: () => ({ value: "tampered.jwt.token" }),
    },
    headers: { get: () => null },
  };

  const user = await getAuthenticatedUser(req);
  assert.equal(user, null);
});

