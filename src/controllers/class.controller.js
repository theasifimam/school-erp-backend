// classController.js
import { Class, Subject } from "../models/Misc.model.js";

// Get all classes
export const getAllClasses = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};

    // If search is provided, match against name, section, or academicYear
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { section: { $regex: search, $options: "i" } },
        { academicYear: { $regex: search, $options: "i" } },
      ];
    }

    const classes = await Class.find(query)
      .populate({
        path: "subjects",
        select: "name code", // Only include name and code from subjects
      })
      .populate({
        path: "classTeacher",
        select: "firstName lastName email contactNumber designation", // Specific fields from class teacher
      })
      .sort({ name: 1, section: 1 }); // Sort by name then section

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single class
export const getClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id).populate("subjects");

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      data: classData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Create new class
export const createClass = async (req, res) => {
  try {
    const { name, grade, teacher, capacity, description, section } = req.body;

    if (!name || !grade || !section) {
      return res.status(400).json({
        success: false,
        error: "Please provide name, grade, and an array of sections",
      });
    }

    const newClass = await Class.create({
      name,
      grade,
      teacher,
      capacity: capacity || 30,
      description: description || "",
      section, // Just one section per class
    });

    res.status(201).json({
      success: true,
      message: `${newClass.name} class created successfully.`,
      data: newClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update class
export const updateClass = async (req, res) => {
  console.log(req.body, "req.body");
  try {
    const classData = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: "Class not found",
      });
    }

    res.status(200).json({
      success: true,
      data: classData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete class
export const deleteClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: "Class not found",
      });
    }

    await classData.deleteOne();

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

// Add subjects to a class
export const addSubjectsToClass = async (req, res) => {
  try {
    const { subjectIds } = req.body;

    if (!subjectIds || !Array.isArray(subjectIds)) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of subject IDs",
      });
    }

    // Verify all subject IDs exist
    for (const id of subjectIds) {
      const subject = await Subject.findById(id);
      if (!subject) {
        return res.status(404).json({
          success: false,
          error: `Subject with ID ${id} not found`,
        });
      }
    }

    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: "Class not found",
      });
    }

    // Add subjects without duplicates
    const uniqueSubjects = [
      ...new Set([
        ...classData.subjects.map((id) => id.toString()),
        ...subjectIds,
      ]),
    ];
    classData.subjects = uniqueSubjects;

    await classData.save();

    const updatedClass = await Class.findById(req.params.id).populate(
      "subjects"
    );

    res.status(200).json({
      success: true,
      data: updatedClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Remove subjects from a class
export const removeSubjectsFromClass = async (req, res) => {
  try {
    const { subjectIds } = req.body;

    if (!subjectIds || !Array.isArray(subjectIds)) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of subject IDs",
      });
    }

    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({
        success: false,
        error: "Class not found",
      });
    }

    // Remove specified subjects
    classData.subjects = classData.subjects.filter(
      (subjectId) => !subjectIds.includes(subjectId.toString())
    );

    await classData.save();

    const updatedClass = await Class.findById(req.params.id).populate(
      "subjects"
    );

    res.status(200).json({
      success: true,
      data: updatedClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get classes by academic year
export const getClassesByAcademicYear = async (req, res) => {
  try {
    const classes = await Class.find({
      academicYear: req.params.year,
    }).populate("subjects");

    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
