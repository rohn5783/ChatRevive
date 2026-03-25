process.env.NODE_ENV = "test";

import "./validation/user.validation.test.js";
import "./validation/chat.validation.test.js";
import "./controller/user.controller.test.js";
import "./middleware/auth.middleware.test.js";
import { run } from "./helpers/testRunner.js";

await run();
