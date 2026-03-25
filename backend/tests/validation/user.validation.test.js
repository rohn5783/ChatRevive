import assert from "node:assert/strict";
import {
  validateEmailOnly,
  validateEmailOTPVerification,
  validateLogin,
  validateRegister,
} from "../../validation/user.validation.js";
import {
  createMockResponse,
  createNextSpy,
} from "../helpers/mockHttp.js";
import { test } from "../helpers/testRunner.js";

test("validateRegister accepts valid input and normalizes values", () => {
  const req = {
    body: {
      fullName: "  Rahul Sharma  ",
      email: "  RAHUL@example.com ",
      password: "secret123",
    },
  };
  const res = createMockResponse();
  const next = createNextSpy();

  validateRegister(req, res, next);

  assert.equal(next.called, true);
  assert.equal(res.statusCode, 200);
  assert.equal(req.body.fullName, "Rahul Sharma");
  assert.equal(req.body.email, "rahul@example.com");
});

test("validateRegister rejects invalid email", () => {
  const req = {
    body: {
      fullName: "Rahul",
      email: "rahul-at-example.com",
      password: "secret123",
    },
  };
  const res = createMockResponse();
  const next = createNextSpy();

  validateRegister(req, res, next);

  assert.equal(next.called, false);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    success: false,
    message: "Please provide a valid email",
  });
});

test("validateLogin rejects short password", () => {
  const req = {
    body: {
      email: "rahul@example.com",
      password: "123",
    },
  };
  const res = createMockResponse();
  const next = createNextSpy();

  validateLogin(req, res, next);

  assert.equal(next.called, false);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    success: false,
    message: "password must be at least 6 characters long",
  });
});

test("validateLogin accepts valid input and normalizes email", () => {
  const req = {
    body: {
      email: "  RAHUL@example.com ",
      password: "secret123",
    },
  };
  const res = createMockResponse();
  const next = createNextSpy();

  validateLogin(req, res, next);

  assert.equal(next.called, true);
  assert.equal(req.body.email, "rahul@example.com");
});

test("validateEmailOTPVerification rejects invalid otp", () => {
  const req = {
    body: {
      email: "rahul@example.com",
      otp: "12ab",
    },
  };
  const res = createMockResponse();
  const next = createNextSpy();

  validateEmailOTPVerification(req, res, next);

  assert.equal(next.called, false);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    success: false,
    message: "otp must be a 6 digit code",
  });
});

test("validateEmailOnly accepts valid email", () => {
  const req = {
    body: {
      email: "  RAHUL@example.com ",
    },
  };
  const res = createMockResponse();
  const next = createNextSpy();

  validateEmailOnly(req, res, next);

  assert.equal(next.called, true);
  assert.equal(req.body.email, "rahul@example.com");
});
