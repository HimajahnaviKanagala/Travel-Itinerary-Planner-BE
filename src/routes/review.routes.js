import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  addReview,
  getReviews,
  deleteReview,
} from "../controllers/review.contoller.js";

const router = express.Router();
router.use(authenticate);
router.get("/trips/:tripId/reviews", getReviews);
router.post("/trips/:tripId/reviews", addReview);
router.delete("/reviews/:id", deleteReview);

export default router;
