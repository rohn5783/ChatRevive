import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import User from "../../models/user.model.js";
import { protectRoute } from "../../middleware/auth.middleware.js";
import {
  createMockResponse,
  createNextSpy,
} from "../helpers/mockHttp.js";
import { test } from "../helpers/testRunner.js";

const originalFindById = User.findById;

test.afterEach(() => {
  User.findById = originalFindById;
});

test("protectRoute rejects request without token", async () => {
  const req = { cookies: {}, headers: {} };
  const res = createMockResponse();
  const next = createNextSpy();

  await protectRoute(req, res, next);

  assert.equal(next.called, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, {
    success: false,
    message: "Authentication required",
  });
});

test("protectRoute accepts valid cookie token", async () => {
  const token = jwt.sign(
    { userId: "507f1f77bcf86cd799439011" },
    process.env.JWT_SECRET || "dev_jwt_secret_change_me"
  );

  const fakeUser = {
    _id: "507f1f77bcf86cd799439011",
    email: "rahul@example.com",
  };

  User.findById = async () => fakeUser;

  const req = {
    cookies: { token },
    headers: {},
  };
  const res = createMockResponse();
  const next = createNextSpy();

  await protectRoute(req, res, next);

  assert.equal(next.called, true);
  assert.equal(req.user, fakeUser);
});

test("protectRoute rejects invalid token", async () => {
  const req = {
    cookies: { token: "invalid.token.value" },
    headers: {},
  };
  const res = createMockResponse();
  const next = createNextSpy();

  await protectRoute(req, res, next);

  assert.equal(next.called, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, {
    success: false,
    message: "Invalid or expired token",
  });
});
