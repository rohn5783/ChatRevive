import assert from "node:assert/strict";
import crypto from "node:crypto";
import User from "../../src/models/user.model.js";
import { processChatUpload } from "../../src/lib/chatUpload.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../../src/lib/payment.js";
import { test } from "../helpers/testRunner.js";

test("E2E User Flow: 5 Free uploads -> 6th blocked -> Razorpay unlock -> Unlimited Pro uploads", async () => {
  // Step 1: User registers
  const email = `e2e_rzp_${Date.now()}@example.com`;
  const user = await User.create({
    fullName: "Aman Gupta",
    email,
    password: "securepassword123",
  });

  assert.equal(user.plan, "free");
  assert.equal(user.trialUploadsLimit, 5);
  assert.equal(user.trialUploadsUsed, 0);

  // Step 2: Upload 1 through 5 successfully
  for (let i = 1; i <= 5; i++) {
    const uploadRes = await processChatUpload({
      user,
      fileName: `chat_backup_${i}.txt`,
      fileContent: `12/03/26, 10:0${i} am - Aman: Test message number ${i}`,
    });

    assert.equal(uploadRes.status, 200, `Upload ${i} should succeed`);
    assert.equal(uploadRes.body.success, true);
    assert.equal(user.trialUploadsUsed, i, `Used count should be ${i}`);
  }

  // Step 3: Attempt 6th upload - MUST BE BLOCKED
  const sixthBlockedRes = await processChatUpload({
    user,
    fileName: "chat_backup_6.txt",
    fileContent: "12/03/26, 10:06 am - Aman: This should be blocked",
  });

  assert.equal(sixthBlockedRes.status, 403);
  assert.equal(sixthBlockedRes.body.success, false);
  assert.equal(sixthBlockedRes.body.paymentRequired, true);
  assert.equal(
    sixthBlockedRes.body.message,
    "Free upload limit reached. Upgrade to continue uploading chats."
  );

  // Step 4: Create Razorpay Order
  const orderRes = await createRazorpayOrder({ user, amount: 499, currency: "INR" });
  assert.equal(orderRes.status, 200);
  assert.equal(orderRes.body.success, true);
  assert.ok(orderRes.body.orderId);
  assert.equal(orderRes.body.amount, 49900);

  // Step 5: Verify Razorpay Payment with cryptographic HMAC
  const secret = process.env.RAZORPAY_KEY_SECRET || "demo_razorpay_secret_key_87654321";
  const paymentId = `pay_e2e_${Date.now()}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${orderRes.body.orderId}|${paymentId}`)
    .digest("hex");

  const verifyRes = await verifyRazorpayPayment({
    user,
    razorpay_order_id: orderRes.body.orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature,
  });

  assert.equal(verifyRes.status, 200);
  assert.equal(verifyRes.body.success, true);
  assert.equal(user.plan, "pro");

  // Step 6: 6th, 7th, 8th upload now succeed with Pro Unlimited!
  for (let i = 6; i <= 8; i++) {
    const proUploadRes = await processChatUpload({
      user,
      fileName: `chat_backup_pro_${i}.txt`,
      fileContent: `12/03/26, 10:0${i} am - Aman: Pro upload ${i}`,
    });

    assert.equal(proUploadRes.status, 200, `Pro upload ${i} must succeed`);
    assert.equal(proUploadRes.body.success, true);
  }
});
