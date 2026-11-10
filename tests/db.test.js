import assert from "node:assert/strict";
import { connectDB } from "../src/lib/db.js";
import { test } from "./helpers/testRunner.js";

test("connectDB requires a MongoDB URI instead of using a fallback", async () => {
  const originalMongoUri = process.env.MONGODB_URI;
  const originalLegacyMongoUri = process.env.MONGO_URI;
  delete process.env.MONGODB_URI;
  delete process.env.MONGO_URI;

  try {
    await assert.rejects(connectDB(), /MONGODB_URI or MONGO_URI must be configured/);
  } finally {
    if (originalMongoUri === undefined) {
      delete process.env.MONGODB_URI;
    } else {
      process.env.MONGODB_URI = originalMongoUri;
    }

    if (originalLegacyMongoUri === undefined) {
      delete process.env.MONGO_URI;
    } else {
      process.env.MONGO_URI = originalLegacyMongoUri;
    }
  }
});
