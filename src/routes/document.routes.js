import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getDocuments,
  addDocument,
  deleteDocument,
} from "../controllers/document.controller.js";

const router = express.Router();
router.use(authenticate);
router.get("/trips/:tripId/documents", getDocuments);
router.post("/trips/:tripId/documents", addDocument);
router.delete("/documents/:id", deleteDocument);

export default router;
