import mongoose from "mongoose";

const petSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  species: { type: String, required: true, enum: ["Dog", "Cat", "Bird", "Other"] },
  breed: { type: String, default: "" },
  age: { type: Number, required: true, min: 0 },
  gender: { type: String, enum: ["Male", "Female", "Unknown"], default: "Unknown" },
  description: { type: String, required: true },
  image: { type: String, default: "" },
  location: { type: String, required: true },
  healthStatus: { type: String, default: "Not specified" },
  vaccinated: { type: Boolean, default: false },
  status: { type: String, enum: ["Available", "Pending", "Adopted"], default: "Available" },
  shelter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isActive: { type: Boolean, default: true },
  demoKey: { type: String, unique: true, sparse: true, index: true }
}, { timestamps: true });

export default mongoose.model("Pet", petSchema);
