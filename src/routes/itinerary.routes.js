import express from "express";
import {
  getItinerary,
  addItem,
  updateItem,
  deleteItem,
} from "../controllers/itinerary.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();
router.use(authenticate);
router.get("/trips/:tripId/itinerary", getItinerary);
router.post("/trips/:tripId/itinerary", addItem);
router.put("/itinerary/:id", updateItem);
router.delete("/itinerary/:id", deleteItem);

export default router;
