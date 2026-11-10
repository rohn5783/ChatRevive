import assert from "node:assert/strict";
import User from "../../src/models/user.model.js";
import { test } from "../helpers/testRunner.js";

test("UserModel initializes default values: 5 free trial uploads", async () => {
  const testEmail = `test_defaults_${Date.now()}@example.com`;
  const user = await User.create({
    fullName: "Trial User",
    email: testEmail,
    password: "securepassword123",
  });

  assert.equal(user.plan, "free");
  assert.equal(user.trialUploadsLimit, 5);
  assert.equal(user.trialUploadsUsed, 0);
  assert.equal(user.isTrialActive, true);
  assert.ok(user.password !== "securepassword123"); // Hashed
});

test("UserModel comparePassword works accurately", async () => {
  const testEmail = `test_pw_${Date.now()}@example.com`;
  const user = await User.create({
    fullName: "Password Tester",
    email: testEmail,
    password: "mypassword456",
  });

  const correctMatch = await user.comparePassword("mypassword456");
  const wrongMatch = await user.comparePassword("wrongpassword");

  assert.equal(correctMatch, true);
  assert.equal(wrongMatch, false);
});

