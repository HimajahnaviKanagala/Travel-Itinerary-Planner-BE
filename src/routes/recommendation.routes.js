import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getRecommendations,
  getAllRecommendations,
  createRecommendation,
  deleteRecommendation,
  addRecommendation,
} from "../controllers/recommendation.controller.js";

const router = express.Router();
router.use(authenticate);
router.get("/trips/:tripId/recommendations", getRecommendations);
router.post("/trips/:tripId/recommendations", addRecommendation);
router.get("/", getAllRecommendations);
router.post("/", createRecommendation);
router.delete("/:id", deleteRecommendation);

export default router;
