import express from "express";
import {
  getPetConversation,
  sendPetMessage,
} from "../controllers/messageController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/pet/:petId",
  protect,
  authorize("adopter", "shelter", "admin"),
  getPetConversation
);
router.post(
  "/pet/:petId",
  protect,
  authorize("adopter"),
  sendPetMessage
);

export default router;
