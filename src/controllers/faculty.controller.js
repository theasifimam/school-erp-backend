// File: src/controllers/Faculty.controller.js

import Faculty from "../models/Faculty.model.js";
import { Class, Subject } from "../models/Misc.model.js";
import User from "../models/User.model.js";
import mongoose from "mongoose";

// Get all teachers
export const getAllFaculties = async (req, res) => {
  try {
    const { department, designation, status } = req.query;

    const filter = {};

    if (department) filter.department = department;
    if (designation) filter.designation = designation;
    if (status !== undefined) filter.isActive = status === "true";

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
    const lastFaculty = await Faculty.findOne().sort({ createdAt: -1 });
    let employeeId = "EMP00001";

    if (lastFaculty) {
      const lastEmployeeId = lastFaculty.employeeId;
      const numericPart = parseInt(lastEmployeeId.substring(3));
      employeeId = `EMP${String(numericPart + 1).padStart(5, "0")}`;
    }

    // Check if email exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        status: "error",
        message: "Email already in use",
      });
    }

    // Create user account
    const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
    const user = await User.create({
      username,
      email,
      password: password || "password123",
      role: "faculty",
      isActive: true,
    });

    // Create faculty
    const faculty = await Faculty.create({
      user: user._id,
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
    });

    res.status(201).json({
      status: "success",
      data: faculty,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
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
      subjects: subjectNames, // array of subject names
      classes: classNames, // array of class names
      contactNumber,
      address,
      designation,
      department,
      salary,
      isClassTeacher,
      classTeacherOf: classTeacherOfName, // class name
      isActive,
    } = req.body;

    const teacher = await Faculty.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        status: "error",
        message: "Teacher not found",
      });
    }

    // Convert subject names to ObjectIds
    let subjectIds = teacher.subjects;
    if (subjectNames && Array.isArray(subjectNames)) {
      const subjects = await Subject.find({ name: { $in: subjectNames } });
      subjectIds = subjects.map((sub) => sub._id);
    }

    // Convert class names to ObjectIds
    let classIds = teacher.classes;
    if (classNames && Array.isArray(classNames)) {
      const classes = await Class.find({ name: { $in: classNames } });
      classIds = classes.map((cls) => cls._id);
    }

    // Convert classTeacherOf name to ObjectId
    let classTeacherOfId = teacher.classTeacherOf;
    if (classTeacherOfName) {
      const classTeacher = await Class.findOne({ name: classTeacherOfName });
      if (classTeacher) classTeacherOfId = classTeacher._id;
    }

    const updatedTeacher = await Faculty.findByIdAndUpdate(
      req.params.id,
      {
        firstName: firstName || teacher.firstName,
        lastName: lastName || teacher.lastName,
        gender: gender || teacher.gender,
        dateOfBirth: dateOfBirth || teacher.dateOfBirth,
        qualification: qualification || teacher.qualification,
        experience: experience !== undefined ? experience : teacher.experience,
        subjects: subjectIds,
        classes: classIds,
        contactNumber: contactNumber || teacher.contactNumber,
        address: address || teacher.address,
        designation: designation || teacher.designation,
        department: department || teacher.department,
        salary: salary !== undefined ? salary : teacher.salary,
        isClassTeacher:
          isClassTeacher !== undefined
            ? isClassTeacher
            : teacher.isClassTeacher,
        classTeacherOf: classTeacherOfId,
        isActive: isActive !== undefined ? isActive : teacher.isActive,
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
