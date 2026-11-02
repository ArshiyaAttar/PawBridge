import mongoose from "mongoose";

const emailNotificationSchema = new mongoose.Schema(
  {
    dedupeKey: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending",
    },
    errorCode: { type: String, default: "" },
    sentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("EmailNotification", emailNotificationSchema);
