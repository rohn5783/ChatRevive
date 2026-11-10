import assert from "node:assert/strict";
import crypto from "node:crypto";
import {
  getPaymentConfig,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../../src/lib/payment.js";
import User from "../../src/models/user.model.js";
import { test } from "../helpers/testRunner.js";

const originalFindById = User.findById;

test.afterEach(() => {
  User.findById = originalFindById;
});

test("getPaymentConfig returns pricing, keys, and feature breakdown", () => {
  const config = getPaymentConfig();
  assert.ok(config.razorpayKeyId);
  assert.equal(config.plan.priceINR, 499);
  assert.equal(config.plan.currency, "INR");
  assert.ok(config.plan.features.length >= 4);
});

test("createRazorpayOrder rejects unauthenticated requests", async () => {
  const result = await createRazorpayOrder({ user: null });
  assert.equal(result.status, 401);
  assert.equal(result.body.success, false);
});

test("createRazorpayOrder returns valid order with amount in paise", async () => {
  const user = { _id: "user_rzp_123", email: "user@example.com" };
  const result = await createRazorpayOrder({ user, amount: 499, currency: "INR" });

  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.ok(result.body.orderId);
  assert.equal(result.body.amount, 49900);
  assert.equal(result.body.currency, "INR");
});

test("verifyRazorpayPayment rejects invalid HMAC signature", async () => {
  const user = {
    _id: "user_rzp_123",
    fullName: "User",
    email: "user@example.com",
    plan: "free",
    save: async function () {
      return this;
    },
  };

  const result = await verifyRazorpayPayment({
    user,
    razorpay_order_id: "order_123",
    razorpay_payment_id: "pay_123",
    razorpay_signature: "invalid_tampered_signature",
  });

  assert.equal(result.status, 400);
  assert.equal(result.body.success, false);
  assert.equal(result.body.message, "Invalid payment signature");
});

test("verifyRazorpayPayment verifies valid cryptographic signature and upgrades user to Pro", async () => {
  let saved = false;
  const user = {
    _id: "user_rzp_456",
    fullName: "Pooja",
    email: "pooja@example.com",
    plan: "free",
    trialUploadsLimit: 5,
    trialUploadsUsed: 5,
    paymentInfo: null,
    save: async function () {
      saved = true;
      return this;
    },
  };

  const orderId = "order_rzp_valid_999";
  const paymentId = "pay_rzp_valid_888";
  const secret = process.env.RAZORPAY_KEY_SECRET || "demo_razorpay_secret_key_87654321";
  const validSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const result = await verifyRazorpayPayment({
    user,
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: validSignature,
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.equal(saved, true);
  assert.equal(user.plan, "pro");
  assert.equal(user.trialUploadsLimit, 999999);
  assert.equal(user.paymentInfo.provider, "razorpay");
  assert.equal(user.paymentInfo.orderId, orderId);
  assert.equal(user.paymentInfo.paymentId, paymentId);
  assert.equal(user.paymentInfo.amount, 499);
});

test("verifyRazorpayPayment accepts demo signature in test environment", async () => {
  const user = {
    _id: "user_rzp_demo",
    fullName: "Demo User",
    email: "demouser@example.com",
    plan: "free",
    trialUploadsLimit: 5,
    trialUploadsUsed: 5,
    save: async function () {
      return this;
    },
  };

  const result = await verifyRazorpayPayment({
    user,
    razorpay_order_id: "order_demo_111",
    razorpay_payment_id: "pay_demo_222",
    razorpay_signature: "test_signature_valid",
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.equal(user.plan, "pro");
});

test("verifyRazorpayPayment rejects missing parameters with 400", async () => {
  const user = {
    _id: "user_rzp_missing",
    fullName: "User",
    email: "user@example.com",
    plan: "free",
  };

  const missingSig = await verifyRazorpayPayment({
    user,
    razorpay_order_id: "order_123",
    razorpay_payment_id: "pay_123",
    razorpay_signature: "",
  });
  assert.equal(missingSig.status, 400);
  assert.equal(missingSig.body.success, false);

  const missingOrder = await verifyRazorpayPayment({
    user,
    razorpay_order_id: "",
    razorpay_payment_id: "pay_123",
    razorpay_signature: "sig_123",
  });
  assert.equal(missingOrder.status, 400);
  assert.equal(missingOrder.body.success, false);
});

