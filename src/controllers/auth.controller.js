// File: src/controllers/auth.controller.ts

import { env } from "../configs/env.js";
import User from "../models/User.model.js";
// import jwt from 'jsonwebtoken';

// Register user
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide username, email and password",
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({
        status: "error",
        message: "User already exists",
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: role || "student",
    });

    // sendTokenResponse(user, 201, res);
  } catch (error) {
    console.log(error, "error in register user controller");
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Login controller
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide username and password",
      });
    }

    // Find user
    const user = await User.findOne({
      username,
      isActive: true,
    }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get current logged in user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Log user out / clear cookie
export const logout = async (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    data: {},
  });
};

// Token response handler
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const jwtCookieExpire = env.JWT_COOKIE_EXPIRE
    ? parseInt(env.JWT_COOKIE_EXPIRE)
    : 7;

  const options = {
    expires: new Date(Date.now() + jwtCookieExpire * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
  };

  res.status(statusCode);
  res
    .cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "strict", // or 'lax' for development
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .json({
      status: "success",
      token, // Only for non-HTTP-only usage if needed
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
};
