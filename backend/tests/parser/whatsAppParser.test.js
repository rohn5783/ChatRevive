import assert from "node:assert/strict";
import { parseWhatsAppChat } from "../../parser/whatsAppParser.js";
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
