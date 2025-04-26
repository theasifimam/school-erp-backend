// File: src/middlewares/auth.middleware.ts
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { env } from "../configs/env.js";

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  // Check if auth header exists and starts with Bearer
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Not authorized to access this route",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "User not found",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: "error",
        message: "User account is inactive",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Not authorized to access this route",
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
