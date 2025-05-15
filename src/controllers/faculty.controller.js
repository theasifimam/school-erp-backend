// File: src/controllers/Faculty.controller.js

import Faculty from "../models/Faculty.model.js";
import User from "../models/User.model.js";
import mongoose from "mongoose";

// Get all teachers
export const getAllFaculties = async (req, res) => {
  try {
    const { department, designation, active } = req.query;

    const filter = {};

    if (department) filter.department = department;
    if (designation) filter.designation = designation;
    if (active !== undefined) filter.isActive = active === "true";

    const teachers = await Faculty.find(filter)
      .populate("user", "username email")
      .populate("subjects", "name code")
      .populate("classes", "name")
      .populate("classTeacherOf", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      count: teachers.length,
      data: teachers,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get teacher by ID
export const getFacultyById = async (req, res) => {
  try {
    const teacher = await Faculty.findById(req.params.id)
      .populate("user", "username email")
      .populate("subjects", "name code")
      .populate("classes", "name")
      .populate("classTeacherOf", "name");

    if (!teacher) {
      return res.status(404).json({
        status: "error",
        message: "Teacher not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: teacher,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Create teacher
export const createFaculty = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      joiningDate,
      qualification,
      experience,
      subjects,
      classes,
      contactNumber,
      email,
      address,
      designation,
      department,
      salary,
      isClassTeacher,
      classTeacherOf,
      password,
    } = req.body;

    // Generate unique employee ID
    const lastTeacher = await Faculty.findOne().sort({ createdAt: -1 });
    let employeeId = "EMP00001";

    if (lastTeacher) {
      const lastEmployeeId = lastFaculty.employeeId;
      const numericPart = parseInt(lastEmployeeId.substring(3));
      employeeId = `EMP${String(numericPart + 1).padStart(5, "0")}`;
    }

    // Create user account
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: "error",
        message: "Email already in use",
      });
    }

    const user = await User.create(
      [
        {
          username,
          email,
          password: password || "password123", // Default password if not provided
          role: "teacher",
          isActive: true,
        },
      ],
      { session }
    );

    // Create teacher
    const teacher = await Faculty.create(
      [
        {
          user: user[0]._id,
          employeeId,
          firstName,
          lastName,
          gender,
          dateOfBirth,
          joiningDate: joiningDate || new Date(),
          qualification,
          experience,
          subjects,
          classes,
          contactNumber,
          email,
          address,
          designation,
          department,
          salary,
          isClassTeacher: isClassTeacher || false,
          classTeacherOf,
          isActive: true,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      status: "success",
      data: teacher[0],
    });
  } catch (error) {
    await session.abortTransaction();

    res.status(500).json({
      status: "error",
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Update teacher
export const updateFaculty = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      qualification,
      experience,
      subjects,
      classes,
      contactNumber,
      address,
      designation,
      department,
      salary,
      isClassTeacher,
      classTeacherOf,
      isActive,
    } = req.body;

    const teacher = await Faculty.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        status: "error",
        message: "Teacher not found",
      });
    }

    const updatedTeacher = await Faculty.findByIdAndUpdate(
      req.params.id,
      {
        firstName: firstName || Faculty.firstName,
        lastName: lastName || Faculty.lastName,
        gender: gender || Faculty.gender,
        dateOfBirth: dateOfBirth || Faculty.dateOfBirth,
        qualification: qualification || Faculty.qualification,
        experience: experience !== undefined ? experience : Faculty.experience,
        subjects: subjects || Faculty.subjects,
        classes: classes || Faculty.classes,
        contactNumber: contactNumber || Faculty.contactNumber,
        address: address || Faculty.address,
        designation: designation || Faculty.designation,
        department: department || Faculty.department,
        salary: salary !== undefined ? salary : Faculty.salary,
        isClassTeacher:
          isClassTeacher !== undefined
            ? isClassTeacher
            : Faculty.isClassTeacher,
        classTeacherOf: classTeacherOf || Faculty.classTeacherOf,
        isActive: isActive !== undefined ? isActive : Faculty.isActive,
      },
      { new: true, runValidators: true }
    )
      .populate("user", "username email")
      .populate("subjects", "name code")
      .populate("classes", "name")
      .populate("classTeacherOf", "name");

    res.status(200).json({
      status: "success",
      data: updatedTeacher,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Delete teacher
export const deleteFaculty = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const teacher = await Faculty.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({
        status: "error",
        message: "Teacher not found",
      });
    }

    // Delete teacher document
    await Faculty.findByIdAndDelete(req.params.id, { session });

    // Delete associated user account
    await User.findByIdAndDelete(Faculty.user, { session });

    await session.commitTransaction();

    res.status(200).json({
      status: "success",
      message: "Teacher deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();

    res.status(500).json({
      status: "error",
      message: error.message,
    });
  } finally {
    session.endSession();
  }
};
