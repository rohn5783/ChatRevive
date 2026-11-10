const INVISIBLE_CHARACTER_REGEX = /[\u200b-\u200f\u202a-\u202e\u2060\ufeff]/g;

export function sanitizeText(value = "") {
  return String(value).replace(INVISIBLE_CHARACTER_REGEX, "").trim();
}

export function normalizeMediaFileName(fileName = "") {
  let normalizedName = sanitizeText(fileName).replace(/\\/g, "/");

  try {
    normalizedName = decodeURIComponent(normalizedName);
  } catch {
    // Keep original file name if malformed URI
  }

  normalizedName = normalizedName.split("/").pop() ?? normalizedName;
  normalizedName = normalizedName.replace(/^["']+|["']+$/g, "");

  return normalizedName.trim();
}

export function inferMediaKind(fileName = "") {
  const normalizedName = normalizeMediaFileName(fileName).toLowerCase();

  if (/\.(jpg|jpeg|png|gif|webp|bmp|heic|svg)$/i.test(normalizedName)) {
    return "image";
  }

  if (/\.(mp4|mov|avi|mkv|webm|3gp)$/i.test(normalizedName)) {
    return "video";
  }

  if (/\.(mp3|aac|wav|ogg|m4a|opus)$/i.test(normalizedName)) {
    return "audio";
  }

  return "document";
}

export function extractMediaInfo(messageText) {
  const trimmedText = sanitizeText(messageText);
  const attachedMatch =
    trimmedText.match(/^<attached:\s*(.+?)>$/i) ??
    trimmedText.match(/^(.+?)\s\((?:file attached|attached)\)$/i);

  if (attachedMatch) {
    const fileName = normalizeMediaFileName(attachedMatch[1]);
    return {
      fileName,
      kind: inferMediaKind(fileName),
      label: "Attachment",
    };
  }

  const omittedMatch = trimmedText.match(
    /^<?(?:(image|video|audio|voice message|document|sticker|gif)|media)\s+omitted>?$/i
  );

  if (omittedMatch) {
    const omittedType = omittedMatch[1]?.toLowerCase() ?? "media";
    const kind =
      omittedType === "image" || omittedType === "sticker" || omittedType === "gif"
        ? "image"
        : omittedType === "video"
        ? "video"
        : omittedType === "audio" || omittedType === "voice message"
        ? "audio"
        : omittedType === "document"
        ? "document"
        : "unknown";

    const label =
      omittedType === "media"
        ? "Media omitted"
        : `${omittedType.charAt(0).toUpperCase()}${omittedType.slice(1)} omitted`;

    return {
      fileName: null,
      kind,
      label,
    };
  }

  return null;
}

export function parseWhatsAppChat(text, myName) {
  if (!text || typeof text !== "string") return [];
  const lines = text.split(/\r?\n/);
  const messages = [];

  // Android: 12/03/26, 9:00 am - Sender: Message
  const androidRegex =
    /^(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?\s?(?:am|pm)??)\s-\s([^:]+?):\s([\s\S]*)$/i;

  // iOS: [12/03/26, 9:00:15 am] Sender: Message
  const iosRegex =
    /^\[(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}),\s(\d{1,2}:\d{2}(?::\d{2})?\s?(?:am|pm)??)\]\s([^:]+?):\s([\s\S]*)$/i;

  let lastMessage = null;

  for (let rawLine of lines) {
    const line = rawLine.replace(/[\u200e\u200f\u202a-\u202e]/g, "");
    const match = line.match(androidRegex) || line.match(iosRegex);

    if (match) {
      const sender = sanitizeText(match[3]);
      const content = match[4];
      const message = {
        sender,
        message: content,
        date: match[1],
        time: match[2],
        isMe: myName ? sender.toLowerCase() === myName.toLowerCase() : false,
        media: extractMediaInfo(content),
      };

      messages.push(message);
      lastMessage = message;
    } else if (lastMessage) {
      lastMessage.message += "\n" + rawLine;
    }
  }

  return messages;
}

