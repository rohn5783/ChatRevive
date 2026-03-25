import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      default: null,
      trim: true,
    },
    isOwner: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const conversationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    chatImport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatImport",
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      enum: ["whatsapp"],
      default: "whatsapp",
    },
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },
    participants: {
      type: [participantSchema],
      default: [],
      validate: {
        validator: (value) => value.length > 0,
        message: "At least one participant is required.",
      },
    },
    dateRange: {
      startedAt: {
        type: Date,
        default: null,
      },
      endedAt: {
        type: Date,
        default: null,
      },
    },
    stats: {
      messageCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      mediaCount: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    previewMessage: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ owner: 1, updatedAt: -1 });
conversationSchema.index({ owner: 1, title: 1 });

const Conversation =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", conversationSchema);

export default Conversation;
