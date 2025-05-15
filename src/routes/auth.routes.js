// File: src/routes/auth.routes.ts
import express from "express";

import { protect } from "../middlewares/auth.middleware.js";
import {
  getMe,
  login,
  logout,
  register,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/logout", logout);

export default router;
