import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getPacking,
  addPackingItem,
  togglePackingItem,
  deletePackingItem,
} from "../controllers/packing.controller.js";

const router = express.Router();
router.use(authenticate);
router.get("/trips/:tripId/packing", getPacking);
router.post("/trips/:tripId/packing", addPackingItem);
router.put("/packing/:id/toggle", togglePackingItem);
router.delete("/packing/:id", deletePackingItem);

export default router;
