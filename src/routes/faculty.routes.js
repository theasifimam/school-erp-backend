// File: src/routes/teacher.routes.ts
import express from "express";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import {
  createFaculty,
  deleteFaculty,
  getAllFaculties,
  getFacultyById,
  updateFaculty,
} from "../controllers/faculty.controller.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getAllFaculties)
  .post(protect, authorize("admin"), createFaculty);

router
  .route("/:id")
  .get(protect, getFacultyById)
  .put(protect, authorize("admin"), updateFaculty)
  .delete(protect, authorize("admin"), deleteFaculty);

export default router;
