// subjectController.js
import mongoose from "mongoose";
import { Subject } from "../models/Misc.model.js";

// Get all subjects
export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single subject
export const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        error: "Subject not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Create new subject
export const createSubject = async (req, res) => {
  try {
    // Create a clean copy of request body
    const subjectData = { ...req.body };

    // Input validation for required fields
    const { name, code, department } = subjectData;

    if (!name || !code || !department) {
      return res.status(400).json({
        success: false,
        error: "Please provide name, code and department",
      });
    }

    // Validate code format
    if (!code.match(/^[A-Z]{3,4}\d{3}$/)) {
      return res.status(400).json({
        success: false,
        error: "Subject code must match pattern (e.g., MATH101, SCIE202)",
      });
    }

    // Check if department is valid
    const validDepartments = [
      "Science",
      "Humanities",
      "Commerce",
      "Arts",
      "General",
    ];
    if (!validDepartments.includes(department)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid department. Must be one of: Science, Humanities, Commerce, Arts, General",
      });
    }

    // Check if type is valid when provided
    if (subjectData.type) {
      const validTypes = ["Core", "Elective", "Practical", "Project"];
      if (!validTypes.includes(subjectData.type)) {
        return res.status(400).json({
          success: false,
          error:
            "Invalid type. Must be one of: Core, Elective, Practical, Project",
        });
      }
    }

    // Validate difficulty level if provided
    if (subjectData.difficultyLevel) {
      const validLevels = ["Basic", "Intermediate", "Advanced"];
      if (!validLevels.includes(subjectData.difficultyLevel)) {
        return res.status(400).json({
          success: false,
          error:
            "Invalid difficulty level. Must be one of: Basic, Intermediate, Advanced",
        });
      }
    }

    // Validate credit hours if provided
    if (subjectData.creditHours) {
      if (subjectData.creditHours < 1 || subjectData.creditHours > 5) {
        return res.status(400).json({
          success: false,
          error: "Credit hours must be between 1 and 5",
        });
      }
    }

    // Handle syllabus and textbook fields
    // Remove if not valid ObjectId or empty string
    // if (subjectData.syllabus) {
    //   if (!mongoose.Types.ObjectId.isValid(subjectData.syllabus)) {
    //     return res.status(400).json({
    //       success: false,
    //       error: "Invalid syllabus ID. Must be a valid MongoDB ObjectId",
    //     });
    //   }
    // } else {
    //   delete subjectData.syllabus;
    // }

    // if (subjectData.textbook) {
    //   if (!mongoose.Types.ObjectId.isValid(subjectData.textbook)) {
    //     return res.status(400).json({
    //       success: false,
    //       error: "Invalid textbook ID. Must be a valid MongoDB ObjectId",
    //     });
    //   }
    // } else {
    //   delete subjectData.textbook;
    // }

    const subject = await Subject.create(subjectData);
    res.status(201).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `Subject with this ${field} already exists`,
      });
    }

    // Handle validation errors from Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      error: "Server Error",
      details: error.message,
    });
  }
};

// Update subject
export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        error: "Subject not found",
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Subject with this name or code already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete subject
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({
        success: false,
        error: "Subject not found",
      });
    }

    await subject.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get subjects by type
export const getSubjectsByType = async (req, res) => {
  try {
    const subjects = await Subject.find({ type: req.params.type });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
