import assert from "node:assert/strict";
import { uploadChat } from "../../controller/chat.controller.js";
import { createMockResponse } from "../helpers/mockHttp.js";
import { test } from "../helpers/testRunner.js";

test("uploadChat rejects free users after three uploads", async () => {
  const req = {
    file: {
      originalname: "chat.txt",
      buffer: Buffer.from("12/03/26, 9:00 am - Rahul: Hello"),
    },
    user: {
      _id: "user_123",
      plan: "free",
      trialUploadsUsed: 3,
      trialUploadsLimit: 3,
    },
  };
  const res = createMockResponse();

  await uploadChat(req, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
  assert.equal(
    res.body.message,
    "Free upload limit reached. Upgrade to continue uploading chats."
  );
});

test("uploadChat increments free upload usage after successful parse", async () => {
  const fakeUser = {
    _id: "user_123",
    fullName: "Rahul",
    email: "rahul@example.com",
    avatarUrl: null,
    authProvider: "local",
    plan: "free",
    isVerified: true,
    lastLoginAt: null,
    trialUploadsUsed: 2,
    trialUploadsLimit: 3,
    isTrialActive: true,
    createdAt: new Date("2026-03-22T00:00:00.000Z"),
    updatedAt: new Date("2026-03-22T00:00:00.000Z"),
    save: async function save() {
      this.updatedAt = new Date("2026-03-29T00:00:00.000Z");
      return this;
    },
  };

  const req = {
    file: {
      originalname: "chat.txt",
      buffer: Buffer.from("12/03/26, 9:00 am - Rahul: Hello"),
    },
    user: fakeUser,
  };
  const res = createMockResponse();

  await uploadChat(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(fakeUser.trialUploadsUsed, 3);
  assert.equal(res.body.user.trialUploadsUsed, 3);
  assert.equal(res.body.fileName, "chat.txt");
  assert.ok(Array.isArray(res.body.messages));
});
