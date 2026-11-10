import assert from "node:assert/strict";
import { processChatUpload } from "../../src/lib/chatUpload.js";
import { test } from "../helpers/testRunner.js";

test("processChatUpload rejects unauthenticated requests", async () => {
  const result = await processChatUpload({
    user: null,
    fileName: "chat.txt",
    fileContent: "12/03/26, 9:00 am - Rahul: Hello",
  });

  assert.equal(result.status, 401);
  assert.equal(result.body.success, false);
});

test("processChatUpload rejects free users after five uploads", async () => {
  const fakeUser = {
    _id: "user_limit_123",
    fullName: "Rahul",
    email: "rahul@example.com",
    plan: "free",
    trialUploadsUsed: 5,
    trialUploadsLimit: 5,
  };

  const result = await processChatUpload({
    user: fakeUser,
    fileName: "chat.txt",
    fileContent: "12/03/26, 9:00 am - Rahul: Hello",
  });

  assert.equal(result.status, 403);
  assert.equal(result.body.success, false);
  assert.equal(result.body.paymentRequired, true);
  assert.equal(
    result.body.message,
    "Free upload limit reached. Upgrade to continue uploading chats."
  );
  assert.equal(result.body.trialUploadsUsed, 5);
  assert.equal(result.body.trialUploadsLimit, 5);
});

test("processChatUpload increments free upload usage on successful parse (4 -> 5)", async () => {
  let saved = false;
  const fakeUser = {
    _id: "user_inc_123",
    fullName: "Rahul",
    email: "rahul@example.com",
    plan: "free",
    trialUploadsUsed: 4,
    trialUploadsLimit: 5,
    save: async function () {
      saved = true;
      return this;
    },
  };

  const result = await processChatUpload({
    user: fakeUser,
    fileName: "chat.txt",
    fileContent: "12/03/26, 9:00 am - Rahul: Hello there!",
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  assert.equal(saved, true);
  assert.equal(fakeUser.trialUploadsUsed, 5);
  assert.equal(result.body.user.trialUploadsUsed, 5);
  assert.equal(result.body.messages.length, 1);
});

test("processChatUpload rejects non-.txt files", async () => {
  const fakeUser = {
    _id: "user_pdf_123",
    plan: "free",
    trialUploadsUsed: 0,
    trialUploadsLimit: 5,
  };

  const result = await processChatUpload({
    user: fakeUser,
    fileName: "document.pdf",
    fileContent: "dummy content",
  });

  assert.equal(result.status, 400);
  assert.equal(result.body.success, false);
  assert.ok(result.body.message.includes(".txt"));
});

test("processChatUpload allows pro user unlimited uploads without count limit", async () => {
  const proUser = {
    _id: "user_pro_999",
    fullName: "Pro User",
    email: "pro@example.com",
    plan: "pro",
    trialUploadsUsed: 50,
    trialUploadsLimit: 999999,
    save: async function () {
      return this;
    },
  };

  const result = await processChatUpload({
    user: proUser,
    fileName: "chat.txt",
    fileContent: "12/03/26, 9:00 am - Rahul: Pro unlimited test",
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.success, true);
  // Usage shouldn't force block or increment beyond
  assert.equal(result.body.user.plan, "pro");
});

test("processChatUpload enforces quota per-user independently", async () => {
  const userA = {
    _id: "user_a_exhausted",
    plan: "free",
    trialUploadsUsed: 5,
    trialUploadsLimit: 5,
  };
  const userB = {
    _id: "user_b_fresh",
    plan: "free",
    trialUploadsUsed: 1,
    trialUploadsLimit: 5,
    save: async function () {
      return this;
    },
  };

  const resA = await processChatUpload({
    user: userA,
    fileName: "chat.txt",
    fileContent: "12/03/26, 9:00 am - UserA: Hello",
  });
  assert.equal(resA.status, 403);
  assert.equal(resA.body.paymentRequired, true);

  const resB = await processChatUpload({
    user: userB,
    fileName: "chat.txt",
    fileContent: "12/03/26, 9:00 am - UserB: Hello",
  });
  assert.equal(resB.status, 200);
  assert.equal(resB.body.success, true);
  assert.equal(userB.trialUploadsUsed, 2);
});

