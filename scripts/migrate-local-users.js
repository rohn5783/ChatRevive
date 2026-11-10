import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import "../src/models/user.model.js";
import { connectDB } from "../src/lib/db.js";

const userStorePath = process.env.DATA_STORE_PATH
  ? path.resolve(process.cwd(), process.env.DATA_STORE_PATH)
  : path.resolve(process.cwd(), "data/users.json");

const persistedUserFields = [
  "_id",
  "fullName",
  "email",
  "password",
  "avatarUrl",
  "authProvider",
  "googleId",
  "plan",
  "isVerified",
  "lastLoginAt",
  "emailVerificationOTP",
  "emailVerificationOTPExpires",
  "trialUploadsUsed",
  "trialUploadsLimit",
  "isTrialActive",
  "paymentInfo",
  "createdAt",
  "updatedAt",
];

const readLocalUsers = async () => {
  const users = JSON.parse(await fs.readFile(userStorePath, "utf8"));
  if (!Array.isArray(users)) {
    throw new Error("The local user data file must contain a JSON array.");
  }
  return users;
};

const toMongoRecord = (user) => {
  const record = {};
  for (const field of persistedUserFields) {
    if (user[field] !== undefined) {
      record[field] = user[field];
    }
  }

  if (typeof record.email !== "string" || !record.email.trim()) {
    throw new Error("A local user record is missing its email.");
  }
  if (typeof record.password !== "string" || !record.password) {
    throw new Error("A local user record is missing its password hash.");
  }

  if (mongoose.isValidObjectId(record._id)) {
    record._id = new mongoose.Types.ObjectId(record._id);
  } else {
    delete record._id;
  }

  record.email = String(record.email).trim().toLowerCase();
  for (const field of [
    "lastLoginAt",
    "emailVerificationOTPExpires",
    "createdAt",
    "updatedAt",
  ]) {
    if (record[field]) {
      record[field] = new Date(record[field]);
    }
  }

  return record;
};

const run = async () => {
  await connectDB();
  await mongoose.model("User").init();

  const users = await readLocalUsers();
  if (users.length === 0) {
    console.log("No local user records to migrate.");
    return;
  }

  const collection = mongoose.model("User").collection;
  const operations = users.map((user) => {
    const record = toMongoRecord(user);
    return {
      updateOne: {
        filter: { email: record.email },
        update: { $setOnInsert: record },
        upsert: true,
      },
    };
  });

  const result = await collection.bulkWrite(operations, { ordered: true });
  console.log(
    `Migration complete. Inserted ${result.upsertedCount} user record(s); existing accounts were left unchanged.`
  );
};

try {
  await run();
} finally {
  await mongoose.disconnect();
}
