import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderName: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: "",
      trim: true,
    },
    messageType: {
      type: String,
      enum: ["text", "media", "system"],
      default: "text",
    },
    sentAt: {
      type: Date,
      required: true,
      index: true,
    },
    rawDate: {
      type: String,
      default: null,
      trim: true,
    },
    rawTime: {
      type: String,
      default: null,
      trim: true,
    },
    isOwnerMessage: {
      type: Boolean,
      default: false,
    },
    sequenceNumber: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ conversation: 1, sequenceNumber: 1 }, { unique: true });
messageSchema.index({ conversation: 1, sentAt: 1 });
messageSchema.index({ owner: 1, senderName: 1 });

const MessageModel =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export default MessageModel;
