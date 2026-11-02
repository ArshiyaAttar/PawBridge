import mongoose from "mongoose";

const adoptionApplicationSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true },
  applicantPhone: { type: String, default: "" },
  experience: { type: String, default: "" },
  livingSituation: { type: String, default: "" },
  householdConsent: { type: Boolean, default: false },
  carePlan: { type: String, default: "", maxlength: 2000 },
  vetReference: { type: String, default: "", maxlength: 200 },
  homeDeliveryRequested: { type: Boolean, default: false },
  deliveryAddress: { type: String, default: "", maxlength: 500 },
  deliveryStatus: {
    type: String,
    enum: ["Not Requested", "Pending Review", "Approved", "Unavailable"],
    default: "Not Requested",
  },
  adoptionFee: { type: Number, min: 0, max: 1000000, default: 0 },
  paymentMethod: { type: String, enum: ["COD"], default: "COD" },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Not Required"],
    default: "Not Required",
  },
  paymentCollectedAt: { type: Date, default: null },
  paymentCollectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
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
