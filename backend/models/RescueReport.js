import mongoose from "mongoose";

const rescueReportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  animalType: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  contactPhone: { type: String, required: true },
  image: { type: String, default: "" },
  status: {
    type: String,
    enum: ["Submitted", "Assigned", "In Progress", "Resolved", "Rejected"],
    default: "Submitted"
  },
  assignedRescuer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  rescueNotes: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("RescueReport", rescueReportSchema);
