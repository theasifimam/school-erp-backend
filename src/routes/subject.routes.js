import express from "express";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import {
  createSubject,
  deleteSubject,
  getAllSubjects,
  getSubject,
  updateSubject,
} from "../controllers/subject.controller.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getAllSubjects)
  .post(protect, authorize("admin"), createSubject);

router
  .route("/:id")
  .get(protect, getSubject)
  .put(protect, authorize("admin"), updateSubject)
  .delete(protect, authorize("admin"), deleteSubject);

export default router;
