// File: src/routes/admission.routes.ts
import express from "express";
import {
  saveDraft,
  getDraft,
  submitAdmission,
  updateAdmissionStatus,
  getAdmissions,
} from "../controllers/admission.controller.js";
import { protect, isAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Draft management routes
router.post("/draft", saveDraft);
router.get("/draft/:draftId", getDraft);

// Admission submission route
router.post("/submit", submitAdmission);

// Admin routes (protected)
router.put("/:id/status", protect, isAdmin, updateAdmissionStatus);
router.get("/", protect, isAdmin, getAdmissions);

export default router;
