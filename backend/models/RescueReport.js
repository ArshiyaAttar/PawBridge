import mongoose from "mongoose";

const rescueReportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  animalType: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  contactPhone: { type: String, required: true },
  image: { type: String, default: "" },
  donationAmount: { type: Number, min: 0, max: 1000000, default: 0 },
  donationStatus: {
    type: String,
    enum: ["None", "Pledged", "Collected"],
    default: "None",
  },
  donationCollectedAt: { type: Date, default: null },
  donationCollectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  status: {
    type: String,
    enum: ["Submitted", "Assigned", "In Progress", "Resolved", "Rejected"],
    default: "Submitted"
  },
  assignedRescuer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  rescueNotes: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("RescueReport", rescueReportSchema);
