
import express from "express";
import {
  applyForAdoption,
  getMyApplications,
  getShelterApplications,
  getApplicationById,
  reviewApplication,
} from "../controllers/adoptionController.js";

import {
  protect,
  authorize,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/:petId/apply",
  protect,
  authorize("adopter"),
  applyForAdoption
);

router.get(
  "/my",
  protect,
  authorize("adopter"),
  getMyApplications
);

router.get(
  "/manage",
  protect,
  authorize("shelter", "admin"),
  getShelterApplications
);

// Keep this route before the review route.
router.get(
  "/:id",
  protect,
  getApplicationById
);

router.patch(
  "/:id/review",
  protect,
  authorize("shelter", "admin"),
  reviewApplication
);

export default router;
