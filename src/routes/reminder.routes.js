import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getReminders,
  addReminder,
  deleteReminder,
} from "../controllers/reminder.controller.js";

const router = express.Router();
router.use(authenticate);
router.get("/trips/:tripId/reminders", getReminders);
router.post("/trips/:tripId/reminders", addReminder);
router.delete("/reminders/:id", deleteReminder);

export default router;
