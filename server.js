import express from "express";
import dotenv from "dotenv";
import dbConnectionCheck from "./src/utils/dbHealthCheck.js";
import cors from "cors";

import authRoutes from "./src/routes/auth.routes.js";
import tripRoutes from "./src/routes/trip.routes.js";
import itineraryRoutes from "./src/routes/itinerary.routes.js";
import expenseRoutes from "./src/routes/expense.routes.js";
import documentRoutes from "./src/routes/document.routes.js";
import packingRoutes from "./src/routes/packing.routes.js";
import tripShareRoutes from "./src/routes/tripShare.routes.js";
import reviewRoutes from "./src/routes/review.routes.js";
import reminderRoutes from "./src/routes/reminder.routes.js";
import recommendationRoutes from "./src/routes/recommendation.routes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Travel Itinerary API is running!",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/itinerary", itineraryRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/packing", packingRoutes);
app.use("/api/trip-shares", tripShareRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/recommendations", recommendationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    await dbConnectionCheck();
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.log("Error Occured While Connection to database!");
  }
});
