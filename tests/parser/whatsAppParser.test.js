import assert from "node:assert/strict";
import { parseWhatsAppChat } from "../../src/lib/whatsAppParser.js";
import { test } from "../helpers/testRunner.js";

test("parseWhatsAppChat extracts attached media filenames", () => {
  const chatText =
    "30/03/26, 1:10 pm - Rohit: IMG-20260330-WA0001.jpg (file attached)";

  const [message] = parseWhatsAppChat(chatText, "Rohit");

  assert.equal(message.media.fileName, "IMG-20260330-WA0001.jpg");
  assert.equal(message.media.kind, "image");
});

test("parseWhatsAppChat handles hidden characters in attached media labels", () => {
  const chatText =
    "30/03/26, 1:11 pm - Rohit: \u200e<attached: VID-20260330-WA0002.mp4>";

  const [message] = parseWhatsAppChat(chatText, "Rohit");

  assert.equal(message.media.fileName, "VID-20260330-WA0002.mp4");
  assert.equal(message.media.kind, "video");
});

test("parseWhatsAppChat recognizes omitted media variants", () => {
  const chatText =
    "30/03/26, 1:12 pm - Rohit: \u200eimage omitted\n30/03/26, 1:13 pm - Amit: <media omitted>";

  const [imageMessage, genericMessage] = parseWhatsAppChat(chatText, "Rohit");

  assert.equal(imageMessage.media.label, "Image omitted");
  assert.equal(imageMessage.media.kind, "image");
  assert.equal(genericMessage.media.label, "Media omitted");
  assert.equal(genericMessage.media.kind, "unknown");
});

test("parseWhatsAppChat parses multi-line and participants correctly", () => {
  const chatText = [
    "28/02/2026, 10:15 - Alice: Hey Bob, here is the plan:",
    "Step 1: Wireframe",
    "Step 2: Develop Next.js",
    "28/02/2026, 10:16 - Bob: Sounds awesome! Let's do it."
  ].join("\n");

  const messages = parseWhatsAppChat(chatText, "Alice");
  assert.equal(messages.length, 2);
  assert.equal(messages[0].sender, "Alice");
  assert.ok(messages[0].message.includes("Step 1: Wireframe"));
  assert.equal(messages[0].isMe, true);
  assert.equal(messages[1].sender, "Bob");
  assert.equal(messages[1].isMe, false);
});

test("parseWhatsAppChat handles iOS bracket format with seconds and audio files", () => {
  const iosChat = "[15/04/2026, 14:30:22] Priya 🌸: AUD-20260415-WA0005.opus (file attached)\n[15/04/2026, 14:31:05] Priya 🌸: Project_Proposal.pdf (file attached)";
  const messages = parseWhatsAppChat(iosChat, "Priya 🌸");

  assert.equal(messages.length, 2);
  assert.equal(messages[0].isMe, true);
  assert.equal(messages[0].media.kind, "audio");
  assert.equal(messages[0].media.fileName, "AUD-20260415-WA0005.opus");

  assert.equal(messages[1].media.kind, "document");
  assert.equal(messages[1].media.fileName, "Project_Proposal.pdf");
});

test("parseWhatsAppChat handles emojis and special characters cleanly", () => {
  const emojiChat = "01/05/26, 8:45 pm - Vikram: Namaste dosto! 🙏🚀🔥\nKaisi chal rahi hai taiyari?";
  const messages = parseWhatsAppChat(emojiChat, "Rohan");

  assert.equal(messages.length, 1);
  assert.equal(messages[0].sender, "Vikram");
  assert.ok(messages[0].message.includes("🙏🚀🔥"));
  assert.ok(messages[0].message.includes("Kaisi chal rahi hai taiyari?"));
});

