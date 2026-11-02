import mongoose from "mongoose";

const petSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  species: { type: String, required: true, enum: ["Dog", "Cat", "Bird", "Other"] },
  category: {
    type: String,
    enum: ["Puppy", "Adult Dog", "Kitten", "Adult Cat", "Bird", "Senior", "Special Care", "Other"],
    default: "Other",
  },
  breed: { type: String, default: "" },
  age: { type: Number, required: true, min: 0 },
  gender: { type: String, enum: ["Male", "Female", "Unknown"], default: "Unknown" },
  description: { type: String, required: true },
  image: { type: String, default: "" },
  hasPhoto: { type: Boolean, default: false },
  photoData: { type: Buffer, select: false },
  photoContentType: { type: String, select: false },
  location: { type: String, required: true },
  listingContactPhone: {
    type: String,
    required: true,
    trim: true,
    select: false,
  },
  listingApprovalStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Approved",
    index: true,
  },
  listingReviewNotes: { type: String, default: "" },
  listingReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  listingReviewedAt: { type: Date, default: null },
  healthStatus: { type: String, default: "Not specified" },
  vaccinated: { type: Boolean, default: false },
  adoptionFee: {
    type: Number,
    min: 0,
    max: 1000000,
    default: 0,
    validate: Number.isInteger,
  },
  status: { type: String, enum: ["Available", "Pending", "Adopted"], default: "Available" },
  shelter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isActive: { type: Boolean, default: true },
  demoKey: { type: String, unique: true, sparse: true, index: true }
}, {
  timestamps: true,
  toJSON: {
    transform(_document, value) {
      delete value.photoData;
      delete value.photoContentType;
      return value;
    },
  },
});

export default mongoose.model("Pet", petSchema);
