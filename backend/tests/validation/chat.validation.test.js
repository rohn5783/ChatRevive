import assert from "node:assert/strict";
import { validateChatUpload } from "../../validation/chat.validation.js";
import {
  createMockResponse,
  createNextSpy,
} from "../helpers/mockHttp.js";
import { test } from "../helpers/testRunner.js";

test("validateChatUpload rejects missing file", () => {
  const req = {};
  const res = createMockResponse();
  const next = createNextSpy();

  validateChatUpload(req, res, next);

  assert.equal(next.called, false);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    success: false,
    message: "Chat file is required",
  });
});

test("validateChatUpload rejects unsupported file type", () => {
  const req = {
    file: {
      mimetype: "application/pdf",
      originalname: "chat.pdf",
      buffer: Buffer.from("hello"),
    },
  };
  const res = createMockResponse();
  const next = createNextSpy();

  validateChatUpload(req, res, next);

  assert.equal(next.called, false);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, {
    success: false,
    message: "Only .txt chat files are allowed",
  });
});

test("validateChatUpload accepts valid txt file", () => {
  const req = {
    file: {
      mimetype: "text/plain",
      originalname: "chat.txt",
      buffer: Buffer.from("22/03/2026, 10:20 am - Rahul: Hello"),
    },
  };
  const res = createMockResponse();
  const next = createNextSpy();

  validateChatUpload(req, res, next);

  assert.equal(next.called, true);
  assert.equal(res.statusCode, 200);
});
