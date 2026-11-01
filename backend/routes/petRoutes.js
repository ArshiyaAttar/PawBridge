import express from "express";
import {
  getPets,
  getPetById,
  getMyPets,
  createPet,
  updatePet,
  deletePet,
} from "../controllers/petController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getPets);

// IMPORTANT: Keep /mine before /:id
router.get("/mine", protect, authorize("shelter", "admin"), getMyPets);

router.get("/:id", getPetById);
router.post("/", protect, authorize("shelter", "admin"), createPet);
router.put("/:id", protect, authorize("shelter", "admin"), updatePet);
router.delete("/:id", protect, authorize("shelter", "admin"), deletePet);

export default router;