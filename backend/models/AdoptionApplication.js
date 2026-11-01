import mongoose from "mongoose";

const adoptionApplicationSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true },
  experience: { type: String, default: "" },
  livingSituation: { type: String, default: "" },
  status: {
    type: String,
    enum: ["Pending", "Under Review", "Approved", "Rejected"],
    default: "Pending"
  },
  shelterNotes: { type: String, default: "" },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  reviewedAt: { type: Date, default: null }
}, { timestamps: true });

adoptionApplicationSchema.index(
  { pet: 1, applicant: 1 },
  { unique: true }
);

export default mongoose.model("AdoptionApplication", adoptionApplicationSchema);
