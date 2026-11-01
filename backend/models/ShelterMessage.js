import mongoose from "mongoose";

const shelterMessageSchema = new mongoose.Schema(
  {
    pet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pet",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 2000,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

shelterMessageSchema.index({ pet: 1, sender: 1, recipient: 1, createdAt: 1 });

export default mongoose.model("ShelterMessage", shelterMessageSchema);
