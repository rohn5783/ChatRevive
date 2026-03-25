import bcrypt from "bcryptjs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    avatarUrl: {
      type: String,
      default: null,
      trim: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      default: null,
      trim: true,
    },
    plan: {
      type: String,
      enum: ["free", "pro", "team"],
      default: "free",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    emailVerificationOTP: {
      type: String,
      default: null,
      select: false,
    },
    emailVerificationOTPExpires: {
      type: Date,
      default: null,
      select: false,
    },
    trialUploadsUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
    trialUploadsLimit: {
      type: Number,
      default: 3,
      min: 0,
    },
    isTrialActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function savePassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.canUseTrial = function canUseTrial() {
  return (
    this.isVerified &&
    this.isTrialActive &&
    this.trialUploadsUsed < this.trialUploadsLimit
  );
};

const MongoUserModel =
  mongoose.models.User || mongoose.model("User", userSchema);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const userStorePath = path.resolve(__dirname, "../data/users.json");

const isMongoConnected = () => mongoose.connection.readyState === 1;

const ensureUserStore = async () => {
  await fs.mkdir(path.dirname(userStorePath), { recursive: true });

  try {
    await fs.access(userStorePath);
  } catch {
    await fs.writeFile(userStorePath, "[]\n", "utf8");
  }
};

const toStoredRecord = (record) => ({
  ...record,
  createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : null,
  updatedAt: record.updatedAt ? new Date(record.updatedAt).toISOString() : null,
  lastLoginAt: record.lastLoginAt
    ? new Date(record.lastLoginAt).toISOString()
    : null,
  emailVerificationOTPExpires: record.emailVerificationOTPExpires
    ? new Date(record.emailVerificationOTPExpires).toISOString()
    : null,
});

const fromStoredRecord = (record) => ({
  ...record,
  createdAt: record.createdAt ? new Date(record.createdAt) : null,
  updatedAt: record.updatedAt ? new Date(record.updatedAt) : null,
  lastLoginAt: record.lastLoginAt ? new Date(record.lastLoginAt) : null,
  emailVerificationOTPExpires: record.emailVerificationOTPExpires
    ? new Date(record.emailVerificationOTPExpires)
    : null,
});

const readUsersFromStore = async () => {
  await ensureUserStore();
  const raw = await fs.readFile(userStorePath, "utf8");
  const users = JSON.parse(raw || "[]");
  return users.map(fromStoredRecord);
};

const writeUsersToStore = async (users) => {
  await ensureUserStore();
  await fs.writeFile(
    userStorePath,
    `${JSON.stringify(users.map(toStoredRecord), null, 2)}\n`,
    "utf8"
  );
};

const matchesQuery = (record, query = {}) =>
  Object.entries(query).every(([key, value]) => {
    if (record[key] instanceof Date && value instanceof Date) {
      return record[key].getTime() === value.getTime();
    }

    return String(record[key]) === String(value);
  });

const createLocalUserDocument = (record, selectedFields = "") => {
  const visibleRecord = {
    _id: record._id,
    fullName: record.fullName,
    email: record.email,
    avatarUrl: record.avatarUrl ?? null,
    authProvider: record.authProvider ?? "local",
    googleId: record.googleId ?? null,
    plan: record.plan ?? "free",
    isVerified: Boolean(record.isVerified),
    lastLoginAt: record.lastLoginAt ?? null,
    trialUploadsUsed: record.trialUploadsUsed ?? 0,
    trialUploadsLimit: record.trialUploadsLimit ?? 3,
    isTrialActive: record.isTrialActive ?? true,
    createdAt: record.createdAt ?? new Date(),
    updatedAt: record.updatedAt ?? new Date(),
  };

  if (selectedFields.includes("+password")) {
    visibleRecord.password = record.password;
  }

  if (selectedFields.includes("+emailVerificationOTP")) {
    visibleRecord.emailVerificationOTP = record.emailVerificationOTP ?? null;
  }

  if (selectedFields.includes("+emailVerificationOTPExpires")) {
    visibleRecord.emailVerificationOTPExpires =
      record.emailVerificationOTPExpires ?? null;
  }

  return {
    ...visibleRecord,
    async comparePassword(password) {
      return bcrypt.compare(password, record.password);
    },
    canUseTrial() {
      return (
        this.isVerified &&
        this.isTrialActive &&
        this.trialUploadsUsed < this.trialUploadsLimit
      );
    },
    async save() {
      const users = await readUsersFromStore();
      const index = users.findIndex((user) => String(user._id) === String(this._id));

      if (index === -1) {
        throw new Error("User not found");
      }

      const existingRecord = users[index];
      const nextPassword =
        typeof this.password === "string" && this.password !== existingRecord.password
          ? await bcrypt.hash(this.password, 10)
          : existingRecord.password;

      const nextRecord = {
        ...existingRecord,
        fullName: this.fullName,
        email: this.email,
        password: nextPassword,
        avatarUrl: this.avatarUrl ?? null,
        authProvider: this.authProvider ?? "local",
        googleId: this.googleId ?? null,
        plan: this.plan ?? "free",
        isVerified: Boolean(this.isVerified),
        lastLoginAt: this.lastLoginAt ?? null,
        emailVerificationOTP:
          "emailVerificationOTP" in this
            ? this.emailVerificationOTP ?? null
            : existingRecord.emailVerificationOTP ?? null,
        emailVerificationOTPExpires:
          "emailVerificationOTPExpires" in this
            ? this.emailVerificationOTPExpires ?? null
            : existingRecord.emailVerificationOTPExpires ?? null,
        trialUploadsUsed: this.trialUploadsUsed ?? 0,
        trialUploadsLimit: this.trialUploadsLimit ?? 3,
        isTrialActive: this.isTrialActive ?? true,
        createdAt: existingRecord.createdAt ?? new Date(),
        updatedAt: new Date(),
      };

      users[index] = nextRecord;
      await writeUsersToStore(users);

      Object.assign(this, createLocalUserDocument(nextRecord, selectedFields));
      return this;
    },
  };
};

const createLocalFindOneQuery = (query) => ({
  async select(selectedFields = "") {
    const users = await readUsersFromStore();
    const record = users.find((user) => matchesQuery(user, query));
    return record ? createLocalUserDocument(record, selectedFields) : null;
  },
  then(resolve, reject) {
    return this.select().then(resolve, reject);
  },
});

const UserModel = {
  findOne(query) {
    if (isMongoConnected()) {
      return MongoUserModel.findOne(query);
    }

    return createLocalFindOneQuery(query);
  },
  async findById(id) {
    if (isMongoConnected()) {
      return MongoUserModel.findById(id);
    }

    const users = await readUsersFromStore();
    const record = users.find((user) => String(user._id) === String(id));
    return record ? createLocalUserDocument(record) : null;
  },
  async create(payload) {
    if (isMongoConnected()) {
      return MongoUserModel.create(payload);
    }

    const users = await readUsersFromStore();
    const normalizedEmail = payload.email.trim().toLowerCase();

    if (users.some((user) => user.email === normalizedEmail)) {
      throw new Error("User already exists");
    }

    const now = new Date();
    const nextRecord = {
      _id: new mongoose.Types.ObjectId().toString(),
      fullName: payload.fullName.trim(),
      email: normalizedEmail,
      password: await bcrypt.hash(payload.password, 10),
      avatarUrl: payload.avatarUrl ?? null,
      authProvider: payload.authProvider ?? "local",
      googleId: payload.googleId ?? null,
      plan: payload.plan ?? "free",
      isVerified: Boolean(payload.isVerified),
      lastLoginAt: payload.lastLoginAt ?? null,
      emailVerificationOTP: payload.emailVerificationOTP ?? null,
      emailVerificationOTPExpires: payload.emailVerificationOTPExpires ?? null,
      trialUploadsUsed: payload.trialUploadsUsed ?? 0,
      trialUploadsLimit: payload.trialUploadsLimit ?? 3,
      isTrialActive: payload.isTrialActive ?? true,
      createdAt: now,
      updatedAt: now,
    };

    users.push(nextRecord);
    await writeUsersToStore(users);

    return createLocalUserDocument(nextRecord);
  },
};

export default UserModel;
