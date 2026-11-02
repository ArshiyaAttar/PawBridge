import express from "express";
import {
  getPets,
  getPetById,
  getMyPets,
  createPet,
  updatePet,
  deletePet,
  getPetPhoto,
  getMyPetById,
} from "../controllers/petController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { uploadPetPhoto } from "../middleware/petPhotoUpload.js";

const router = express.Router();

router.get("/", getPets);

// IMPORTANT: Keep /mine before /:id
router.get("/mine", protect, getMyPets);
router.get("/mine/:id", protect, getMyPetById);

router.get("/:id/photo", getPetPhoto);
router.get("/:id", getPetById);
router.post("/", protect, uploadPetPhoto, createPet);
router.put("/:id", protect, uploadPetPhoto, updatePet);
router.delete("/:id", protect, deletePet);

export default router;