// File: src/routes/teacher.routes.ts
import express from "express";
import { protect, authorize } from "../middlewares/auth.middleware.js";
import {
  addSubjectsToClass,
  createClass,
  deleteClass,
  getAllClasses,
  getClass,
  updateClass,
} from "../controllers/class.controller.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getAllClasses)
  .post(protect, authorize("admin"), createClass);

router
  .route("/:id")
  .get(protect, getClass)
  .put(protect, authorize("admin"), updateClass)
  .delete(protect, authorize("admin"), deleteClass);

router.put("/add-subject/:id", protect, authorize("admin"), addSubjectsToClass);

export default router;
