import mongoose from "mongoose";
import ChatImport from "../models/chatImport.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { parseWhatsAppChat } from "./whatsAppParser.js";

const parseWhatsAppDate = (date, time) => {
  const [day, month, rawYear] = date.split(/[/-]/).map(Number);
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;
  const timeParts = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i);

  if (!timeParts) {
    throw new Error("Unable to parse a WhatsApp message timestamp.");
  }

  let hour = Number(timeParts[1]);
  const period = timeParts[4]?.toLowerCase();
  const minute = Number(timeParts[2]);
  const second = Number(timeParts[3] ?? 0);

  if (
    minute > 59 ||
    second > 59 ||
    (period && (hour < 1 || hour > 12)) ||
    (!period && hour > 23)
  ) {
    throw new Error("Unable to parse a WhatsApp message timestamp.");
  }

  if (period === "pm" && hour < 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;

  const parsedDate = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      second
    )
  );

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    throw new Error("Unable to parse a WhatsApp message date.");
  }

  return parsedDate;
};

export async function persistParsedChatUpload({
  user,
  fileName,
  fileContent,
  messages,
  saveUser,
}) {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async () => {
      const participantsByName = new Map();
      const parsedMessages = messages.map((message, sequenceNumber) => {
        participantsByName.set(message.sender, {
          name: message.sender,
          phoneNumber: null,
          isOwner: message.sender.toLowerCase() === user.fullName.toLowerCase(),
        });

        return {
          senderName: message.sender,
          content: message.message,
          messageType: message.media ? "media" : "text",
          sentAt: parseWhatsAppDate(message.date, message.time),
          rawDate: message.date,
          rawTime: message.time,
          isOwnerMessage: message.isMe,
          sequenceNumber,
        };
      });
      const participants = [...participantsByName.values()];
      const sortedMessages = [...parsedMessages].sort(
        (first, second) => first.sentAt - second.sentAt
      );
      const title = fileName.replace(/^.*[\\/]/, "").replace(/\.txt$/i, "").trim();

      const [chatImport] = await ChatImport.create(
        [
          {
            owner: user._id,
            originalFileName: fileName,
            fileSize: Buffer.isBuffer(fileContent)
              ? fileContent.byteLength
              : Buffer.byteLength(fileContent),
            importStatus: "parsed",
            totalMessages: parsedMessages.length,
          },
        ],
        { session }
      );

      const [conversation] = await Conversation.create(
        [
          {
            owner: user._id,
            chatImport: chatImport._id,
            title: title || "WhatsApp Chat",
            type: participants.length > 2 ? "group" : "direct",
            participants,
            dateRange: {
              startedAt: sortedMessages[0].sentAt,
              endedAt: sortedMessages[sortedMessages.length - 1].sentAt,
            },
            stats: {
              messageCount: parsedMessages.length,
              mediaCount: parsedMessages.filter(
                (message) => message.messageType === "media"
              ).length,
            },
            previewMessage: parsedMessages[0].content,
          },
        ],
        { session }
      );

      await Message.insertMany(
        parsedMessages.map((message) => ({
          ...message,
          conversation: conversation._id,
          owner: user._id,
        })),
        { session }
      );

      if (saveUser) {
        await user.save({ session });
      }
    });
  } finally {
    await session.endSession();
  }
}

export async function processChatUpload({
  user,
  fileName,
  fileContent,
  persist,
}) {
  if (!user) {
    return {
      status: 401,
      body: { success: false, message: "Authentication required" },
    };
  }

  const uploadLimit = Number(user.trialUploadsLimit ?? 5);
  const usedCount = Number(user.trialUploadsUsed ?? 0);

  // 5 Free Uploads Enforcement
  if (user.plan === "free" && usedCount >= uploadLimit) {
    return {
      status: 403,
      body: {
        success: false,
        message: "Free upload limit reached. Upgrade to continue uploading chats.",
        paymentRequired: true,
        trialUploadsUsed: usedCount,
        trialUploadsLimit: uploadLimit,
      },
    };
  }

  const safeFileName = fileName || "chat.txt";
  if (!safeFileName.toLowerCase().endsWith(".txt")) {
    return {
      status: 400,
      body: { success: false, message: "Only .txt chat export files are supported" },
    };
  }

  const text = typeof fileContent === "string" ? fileContent : fileContent.toString("utf-8");
  const userName = user.fullName || "You";
  const messages = parseWhatsAppChat(text, userName);

  if (messages.length === 0) {
    return {
      status: 400,
      body: { success: false, message: "No WhatsApp messages were found in this file." },
    };
  }

  if (user.plan === "free") {
    user.trialUploadsUsed = usedCount + 1;
  }

  try {
    if (persist) {
      await persist({
        user,
        fileName: safeFileName,
        fileContent,
        messages,
        saveUser: user.plan === "free",
      });
    } else if (user.plan === "free") {
      await user.save();
    }
  } catch (error) {
    if (user.plan === "free") {
      user.trialUploadsUsed = usedCount;
    }
    throw error;
  }

  return {
    status: 200,
    body: {
      success: true,
      fileName: safeFileName,
      messages,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        plan: user.plan,
        isVerified: user.isVerified,
        trialUploadsUsed: user.trialUploadsUsed,
        trialUploadsLimit: user.trialUploadsLimit,
        paymentInfo: user.paymentInfo,
      },
    },
  };
}
