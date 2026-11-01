import express from "express";
import {
  createRescueReport,
  getRescueReports,
  updateRescueReport
} from "../controllers/rescueController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createRescueReport);
router.get("/", protect, getRescueReports);
router.patch("/:id", protect, authorize("rescuer", "admin"), updateRescueReport);

export default router;
