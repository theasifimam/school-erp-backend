// File: src/routes/auth.routes.ts
import express from "express";

import { protect } from "../middlewares/auth.middleware.js";
import {
  deleteUser,
  getUserById,
  getUsers,
  registerUser,
  toggleUserActive,
  updateMe,
  updatePassword,
  updateUser,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/register-user", protect, registerUser);
router.post("/update-me", protect, updateMe);
router.post("/update-user", protect, updateUser);
router.post("/update-password", protect, updatePassword);
router.get("/users", protect, getUsers);
router.get("/users/:id", protect, getUserById);
router.delete("/user/:id", protect, deleteUser);
router.patch("/user/:id", protect, toggleUserActive);

export default router;
