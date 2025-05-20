// File: src/middlewares/auth.middleware.ts
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { env } from "../configs/env.js";

/**
 * Middleware to check if user is admin
 */
export const isAdmin = (req, res, next) => {
  // Check if user exists and has admin role
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
};

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  // 1) Get token from cookie
  token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      status: "error",
      message: "Not authorized to access this route",
    });
  }

  try {
    // 2) Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // 3) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "User not found",
      });
    }

    // 4) Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        status: "error",
        message: "User account is inactive",
      });
    }

    // 5) Grant access
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Session expired. Please login again",
      });
    }
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
