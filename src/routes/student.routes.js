// File: src/routes/student.routes.ts
import express from "express";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getAllStudents);
router.post("/", protect, authorize("admin"), createStudent);

router.get("/:id", protect, getStudentById);
router.put("/:id", protect, authorize("admin"), updateStudent);

router.delete("/:id", protect, authorize("admin"), deleteStudent);

export default router;
