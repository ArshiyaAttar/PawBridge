import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  getPendingPetListings,
  reviewPetListing,
  getPendingPetListingPhoto,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/stats", getDashboardStats);
router.get("/pet-listings", getPendingPetListings);
router.get("/pet-listings/:id/photo", getPendingPetListingPhoto);
router.patch("/pet-listings/:id/review", reviewPetListing);
router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/status", updateUserStatus);

export default router;
