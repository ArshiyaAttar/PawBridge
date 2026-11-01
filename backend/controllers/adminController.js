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
      Pet.countDocuments({ isActive: true, status: "Available" }),
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
