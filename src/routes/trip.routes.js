import { Router } from "express";
import {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  getTripStats,
} from "../controllers/trip.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();
router.use(authenticate);
router.get("/", getTrips);
router.post("/", createTrip);
router.get("/:id", getTripById);
router.put("/:id", updateTrip);
router.delete("/:id", deleteTrip);
router.get("/:id/stats", getTripStats);
export default router;
