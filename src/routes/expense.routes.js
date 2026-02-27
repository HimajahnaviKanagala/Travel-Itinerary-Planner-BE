import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller.js";

const router = express.Router();
router.use(authenticate);
router.get("/trips/:tripId/expenses", getExpenses);
router.post("/trips/:tripId/expenses", addExpense);
router.put("/expenses/:id", updateExpense);
router.delete("/expenses/:id", deleteExpense);

export default router;
