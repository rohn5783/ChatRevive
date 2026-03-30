process.env.NODE_ENV = "test";

import "./validation/user.validation.test.js";
import "./validation/chat.validation.test.js";
import "./parser/whatsAppParser.test.js";
import "./controller/user.controller.test.js";
import "./controller/chat.controller.test.js";
import "./middleware/auth.middleware.test.js";
import "./src/app.test.js";
import { run } from "./helpers/testRunner.js";

await run();
