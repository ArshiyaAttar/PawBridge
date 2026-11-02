import User from "../models/User.js";
import Pet from "../models/Pet.js";
import AdoptionApplication from "../models/AdoptionApplication.js";
import RescueReport from "../models/RescueReport.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      adopters,
      shelters,
      rescuers,
      totalPets,
      pendingPetListings,
      availablePets,
      adoptedPets,
      totalApplications,
      pendingApplications,
      totalRescues,
      pendingRescues
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "adopter" }),
      User.countDocuments({ role: "shelter" }),
      User.countDocuments({ role: "rescuer" }),
      Pet.countDocuments({ isActive: true }),
      Pet.countDocuments({ isActive: true, listingApprovalStatus: "Pending" }),
      Pet.countDocuments({
        isActive: true,
        status: "Available",
        $or: [
          { listingApprovalStatus: "Approved" },
          { listingApprovalStatus: { $exists: false } },
        ],
      }),
      Pet.countDocuments({ isActive: true, status: "Adopted" }),
      AdoptionApplication.countDocuments(),
      AdoptionApplication.countDocuments({ status: "Pending" }),
      RescueReport.countDocuments(),
      RescueReport.countDocuments({ status: "Submitted" })
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        adopters,
        shelters,
        rescuers,
        totalPets,
        pendingPetListings,
        availablePets,
        adoptedPets,
        totalApplications,
        pendingApplications,
        totalRescues,
        pendingRescues
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to load dashboard statistics" });
  }
};

export const getPendingPetListings = async (_req, res) => {
  try {
    const pets = await Pet.find({
      isActive: true,
      listingApprovalStatus: "Pending",
    })
      .select("+listingContactPhone")
      .populate("shelter", "name email phone")
      .sort({ createdAt: 1 });

    return res.json({ success: true, count: pets.length, pets });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Unable to fetch pet listing requests",
    });
  }
};

export const reviewPetListing = async (req, res) => {
  try {
    const { status, notes } = req.body;
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Choose Approved or Rejected",
      });
    }

    if (notes !== undefined && (typeof notes !== "string" || notes.length > 1000)) {
      return res.status(400).json({
        success: false,
        message: "Review notes must be 1000 characters or fewer",
      });
    }

    const pet = await Pet.findOneAndUpdate(
      {
        _id: req.params.id,
        isActive: true,
        listingApprovalStatus: "Pending",
      },
      {
        $set: {
          listingApprovalStatus: status,
          listingReviewNotes: notes?.trim() || "",
          listingReviewedBy: req.user._id,
          listingReviewedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    ).populate("shelter", "name email phone");

    if (!pet) {
      return res.status(404).json({
        success: false,
        message: "Pending pet listing not found",
      });
    }

    return res.json({
      success: true,
      message: status === "Approved"
        ? "Pet listing approved and published"
        : "Pet listing rejected",
      pet,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to review pet listing",
    });
  }
};

export const getPendingPetListingPhoto = async (req, res) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.id,
      isActive: true,
      listingApprovalStatus: "Pending",
      hasPhoto: true,
    }).select("+photoData +photoContentType");

    if (!pet?.photoData || !pet.photoContentType) {
      return res.status(404).json({
        success: false,
        message: "Pet listing photo not found",
      });
    }

    res.set("Content-Type", pet.photoContentType);
    res.set("Cache-Control", "private, no-store");
    return res.send(pet.photoData);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid pet ID" });
    }
    return res.status(500).json({
      success: false,
      message: "Unable to fetch pet listing photo",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role) filter.role = role;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to fetch users" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ["adopter", "shelter", "rescuer", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid user role" });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot change your own role" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: "User role updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ success: false, message: "isActive must be true or false" });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot deactivate your own account" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User status updated", user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
