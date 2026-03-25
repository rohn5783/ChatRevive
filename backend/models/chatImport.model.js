import mongoose from "mongoose";

const chatImportSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      enum: ["whatsapp"],
      default: "whatsapp",
    },
    importStatus: {
      type: String,
      enum: ["uploaded", "parsed", "failed"],
      default: "uploaded",
      index: true,
    },
    totalMessages: {
      type: Number,
      default: 0,
      min: 0,
    },
    importedAt: {
      type: Date,
      default: Date.now,
    },
    failedReason: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const ChatImport =
  mongoose.models.ChatImport ||
  mongoose.model("ChatImport", chatImportSchema);

export default ChatImport;
