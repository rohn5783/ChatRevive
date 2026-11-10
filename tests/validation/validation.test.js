import assert from "node:assert/strict";
import {
  validateEmail,
  validateRegisterInput,
  validateLoginInput,
  validateOTPInput,
} from "../../src/lib/validation.js";
import { test } from "../helpers/testRunner.js";

test("validateEmail correctly validates emails", () => {
  assert.equal(validateEmail("rahul@example.com"), true);
  assert.equal(validateEmail("invalid-email"), false);
  assert.equal(validateEmail(""), false);
  assert.equal(validateEmail(null), false);
});

test("validateRegisterInput accepts valid input", () => {
  const result = validateRegisterInput({
    fullName: "Rahul Sharma",
    email: "rahul@example.com",
    password: "password123",
  });

  assert.equal(result.isValid, true);
  assert.equal(result.errors.length, 0);
});

test("validateRegisterInput flags invalid input", () => {
  const result = validateRegisterInput({
    fullName: "R",
    email: "bad-email",
    password: "123",
  });

  assert.equal(result.isValid, false);
  assert.equal(result.errors.length, 3);
});

test("validateLoginInput accepts valid input", () => {
  const result = validateLoginInput({
    email: "rahul@example.com",
    password: "password123",
  });

  assert.equal(result.isValid, true);
  assert.equal(result.errors.length, 0);
});

test("validateLoginInput flags invalid input", () => {
  const result = validateLoginInput({
    email: "invalid-email",
    password: "123",
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.length >= 1);
});

test("validateOTPInput validates 6-digit OTP", () => {
  const valid = validateOTPInput({
    email: "rahul@example.com",
    otp: "123456",
  });
  assert.equal(valid.isValid, true);

  const invalid = validateOTPInput({
    email: "rahul@example.com",
    otp: "12a",
  });
  assert.equal(invalid.isValid, false);
});

test("validateRegisterInput trims input and enforces minimum name length", () => {
  const shortName = validateRegisterInput({
    fullName: " A ",
    email: "valid@example.com",
    password: "password123",
  });
  assert.equal(shortName.isValid, false);
});

test("validateLoginInput rejects empty credentials", () => {
  const empty = validateLoginInput({
    email: "",
    password: "",
  });
  assert.equal(empty.isValid, false);
  assert.ok(empty.errors.length >= 2);
});

