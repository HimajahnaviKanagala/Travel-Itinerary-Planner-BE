import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  shareTrip,
  getShares,
  removeShare,
} from "../controllers/tripShare.controller.js";

const router = express.Router();
router.use(authenticate);
router.post("/trips/:tripId/share", shareTrip);
router.get("/trips/:tripId/shares", getShares);
router.delete("/trips/:tripId/shares/:shareId", removeShare);

export default router;
