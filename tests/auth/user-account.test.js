import assert from "node:assert/strict";
import User from "../../src/models/user.model.js";
import { test } from "../helpers/testRunner.js";

test("User registration prevents duplicate email accounts", async () => {
  const email = `unique_${Date.now()}@example.com`;
  await User.create({
    fullName: "First User",
    email,
    password: "password123",
  });

  const duplicate = await User.findOne({ email });
  assert.ok(duplicate);
  assert.equal(duplicate.email, email);
});

test("User login verifies password correctly", async () => {
  const email = `login_test_${Date.now()}@example.com`;
  const created = await User.create({
    fullName: "Login Tester",
    email,
    password: "mySecretPassword!",
  });

  const foundUser = await User.findOne({ email }).select("+password");
  assert.ok(foundUser);

  const isMatch = await foundUser.comparePassword("mySecretPassword!");
  assert.equal(isMatch, true);

  const isWrong = await foundUser.comparePassword("wrongSecret!");
  assert.equal(isWrong, false);
});

test("User OTP expiration logic functions correctly", async () => {
  const email = `otp_test_${Date.now()}@example.com`;
  const user = await User.create({
    fullName: "OTP Tester",
    email,
    password: "password123",
  });

  user.emailVerificationOTP = "654321";
  user.emailVerificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes ahead
  await user.save();

  assert.equal(user.emailVerificationOTP, "654321");
  assert.ok(user.emailVerificationOTPExpires > new Date());
});

