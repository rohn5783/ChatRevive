import "./helpers/setup.js";
import fs from "node:fs/promises";
import path from "node:path";

import "./validation/validation.test.js";
import "./parser/whatsAppParser.test.js";
import "./models/user.model.test.js";
import "./auth/auth.test.js";
import "./auth/user-account.test.js";
import "./api/chats-upload.test.js";
import "./api/payment.test.js";
import "./integration/e2e-payment-flow.test.js";
import { run } from "./helpers/testRunner.js";

try {
  await run();
} finally {
  try {
    await fs.unlink(path.resolve(process.cwd(), "data/test-users.json"));
  } catch {}
}
