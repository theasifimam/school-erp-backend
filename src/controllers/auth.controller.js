// File: src/controllers/auth.controller.ts

import User from "../models/User.model.js";
// import jwt from 'jsonwebtoken';

export const testAPI = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is working",
  });
};

// Register user
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    console.log(username, email, password, role, ">>>>>>>>>>>>>>>>>>>>>>>>>");

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

// Login user
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate username & password
    if (!username || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please provide username and password",
      });
    }

    // Check for user
    const user = await User.findOne({
      username,
      isActive: true,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

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

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const jwtCookieExpire = process.env.JWT_COOKIE_EXPIRE
    ? parseInt(process.env.JWT_COOKIE_EXPIRE)
    : 7;

  const options = {
    expires: new Date(Date.now() + jwtCookieExpire * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      status: "success",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
};
