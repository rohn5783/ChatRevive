import { parseWhatsAppChat } from "./whatsAppParser.js";

export async function processChatUpload({ user, fileName, fileContent }) {
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

  if (user.plan === "free") {
    user.trialUploadsUsed = usedCount + 1;
    await user.save();
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

