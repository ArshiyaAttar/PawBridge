import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const getProfile = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      profileImage: req.user.profileImage,
      createdAt: req.user.createdAt
    }
  });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, profileImage } = req.body;

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 60) {
        return res.status(400).json({ success: false, message: "Name must be between 2 and 60 characters" });
      }
      req.user.name = name.trim();
    }

    if (phone !== undefined) req.user.phone = phone;
    if (profileImage !== undefined) req.user.profileImage = profileImage;

    await req.user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role,
        profileImage: req.user.profileImage
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Provide your current password and a new password of at least 8 characters"
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully. Please log in again." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to change password" });
  }
};
