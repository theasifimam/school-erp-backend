// File: src/controllers/user.controller.js
import User from "../models/User.model.js";
import asyncHandler from "express-async-handler";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Utility function to validate email format
const validateEmail = (email) => {
  return (
    (validator.isEmail(email) && email.endsWith(".edu")) ||
    email.endsWith(".ac.")
  ); // School domain validation
};

// Utility function to validate password strength
const validatePassword = (password) => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[!@#$%^&*]/.test(password)
  );
};

// @desc    Register a new user with strict validation
// @route   POST /api/auth/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  // Validate all fields
  if (!username || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      error: "All fields are required",
    });
  }

  // Validate email format
  if (!validateEmail(email)) {
    return res.status(400).json({
      success: false,
      error: "Please provide a valid school email address",
    });
  }

  // Validate password strength
  if (!validatePassword(password)) {
    return res.status(400).json({
      success: false,
      error:
        "Password must be at least 8 characters with uppercase, number, and special character",
    });
  }

  // Check for existing user
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  }).collation({
    locale: "en",
    strength: 2, // Case-insensitive comparison
  });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: "User already exists with this email or username",
    });
  }

  // Create user with hashed password
  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username: validator.escape(username),
      email: validator.normalizeEmail(email),
      password: hashedPassword,
      role: ["admin", "teacher", "student", "parent"].includes(role)
        ? role
        : "student",
      isActive: role === "student", // Students active by default
    });

    // Generate token without sensitive data
    const token = user.getSignedJwtToken();

    return res.status(201).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error during registration",
    });
  }
});

// @desc    Authenticate user with secure session handling
// @route   POST /api/auth/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: "Email and password are required",
    });
  }

  try {
    // Find user with password field
    const user = await User.findOne({ email }).select(
      "+password +loginAttempts +lockUntil"
    );

    // Check if account is locked
    if (user?.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil(
        (user.lockUntil - Date.now()) / 1000 / 60
      );
      return res.status(423).json({
        success: false,
        error: `Account locked. Try again in ${remainingTime} minutes`,
      });
    }

    if (!user || !(await user.matchPassword(password))) {
      // Increment failed attempts
      if (user) {
        user.loginAttempts += 1;
        if (user.loginAttempts >= 5) {
          user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
        }
        await user.save();
      }

      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Reset login attempts on successful login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = user.getSignedJwtToken();

    // Set secure HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error during login",
    });
  }
});

// @desc    Get current user profile with proper authorization
// @route   GET /api/users/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -resetPasswordToken -resetPasswordExpire"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Role-based data filtering
    let userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };

    // Add additional fields for admins
    if (req.user.role === "admin") {
      userData = {
        ...userData,
        lastLogin: user.lastLogin,
        loginAttempts: user.loginAttempts,
      };
    }

    return res.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error("Profile error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error fetching profile",
    });
  }
});

// @desc    Update user profile with validation
// @route   PUT /api/users/me
// @access  Private
export const updateMe = asyncHandler(async (req, res) => {
  const { username, email } = req.body;

  // Validate input
  if (!username && !email) {
    return res.status(400).json({
      success: false,
      error: "At least one field to update is required",
    });
  }

  if (email && !validateEmail(email)) {
    return res.status(400).json({
      success: false,
      error: "Please provide a valid school email address",
    });
  }

  try {
    const updateData = {};
    if (username) updateData.username = validator.escape(username);
    if (email) updateData.email = validator.normalizeEmail(email);

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error updating profile",
    });
  }
});

// @desc    Change password with security checks
// @route   PUT /api/users/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validate input
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: "Current and new password are required",
    });
  }

  if (!validatePassword(newPassword)) {
    return res.status(400).json({
      success: false,
      error:
        "New password must be at least 8 characters with uppercase, number, and special character",
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      error: "New password must be different from current password",
    });
  }

  try {
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Verify current password
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        error: "Current password is incorrect",
      });
    }

    // Update password
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    // Generate new token
    const token = user.getSignedJwtToken();

    return res.json({
      success: true,
      data: { token },
    });
  } catch (error) {
    console.error("Password update error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error updating password",
    });
  }
});

// @desc    Logout user (clear token)
// @route   GET /api/auth/logout
// @access  Private
export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  return res.json({
    success: true,
    data: {},
  });
});

// ADMIN FUNCTIONS

// @desc    Get all users with pagination and filtering
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtering
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.active) filter.isActive = req.query.active === "true";

    // Sorting
    const sort = {};
    if (req.query.sort) {
      const parts = req.query.sort.split(":");
      sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const users = await User.find(filter)
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const total = await User.countDocuments(filter);

    return res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error fetching users",
    });
  }
});

// @desc    Get user by ID with audit logging
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -resetPasswordToken -resetPasswordExpire"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Log this access (in a real system, you'd save to an audit log)
    console.log(
      `Admin ${req.user.id} accessed user ${user._id} at ${new Date()}`
    );

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error fetching user",
    });
  }
});

// @desc    Update user with admin privileges
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  try {
    // Prevent role escalation
    if (req.body.role && !req.user.isSuperAdmin) {
      return res.status(403).json({
        success: false,
        error: "Only super admins can change roles",
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Admin update error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error updating user",
    });
  }
});

// @desc    Delete user with confirmation
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Prevent deleting self or other admins
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        error: "Cannot delete admin accounts",
      });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Cannot delete your own account",
      });
    }

    // Soft delete (set inactive) instead of actual deletion
    user.isActive = false;
    await user.save();

    return res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error deleting user",
    });
  }
});

// @desc    Toggle user active status with logging
// @route   PUT /api/admin/users/:id/toggleactive
// @access  Private/Admin
export const toggleUserActive = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Prevent deactivating self
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Cannot deactivate your own account",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    // Log this action (in a real system, save to audit log)
    console.log(
      `Admin ${req.user.id} ${user.isActive ? "activated" : "deactivated"} user ${user._id}`
    );

    return res.json({
      success: true,
      data: {
        id: user._id,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    console.error("Toggle active error:", error);
    return res.status(500).json({
      success: false,
      error: "Server error toggling user status",
    });
  }
});
