// File: src/controllers/admission.controller.js
import { v4 as uuidv4 } from "uuid";
import Student from "../models/Student.model.js";
import AdmissionDraft from "../models/AdmissionDraft.model.js";

/**
 * Save admission form as draft
 */
export const saveDraft = async (req, res) => {
  try {
    const { draftId, formData, lastCompletedSection, email } = req.body;

    // If draft already exists, update it
    if (draftId) {
      const existingDraft = await AdmissionDraft.findOne({ draftId });

      if (!existingDraft) {
        return res.status(404).json({
          success: false,
          message: "Draft not found",
        });
      }

      // Update the draft
      existingDraft.formData = formData;
      existingDraft.lastCompletedSection = lastCompletedSection;
      existingDraft.lastUpdated = new Date();
      if (email) existingDraft.email = email;

      await existingDraft.save();

      return res.status(200).json({
        success: true,
        message: "Draft updated successfully",
        draftId: existingDraft.draftId,
      });
    }

    // Create new draft
    const newDraftId = uuidv4();
    const newDraft = new AdmissionDraft({
      draftId: newDraftId,
      formData,
      lastCompletedSection,
      email,
    });

    await newDraft.save();

    return res.status(201).json({
      success: true,
      message: "Draft saved successfully",
      draftId: newDraftId,
    });
  } catch (error) {
    console.error("Error saving draft:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save draft",
      error: error.message,
    });
  }
};

/**
  Get a draft by ID
 */
export const getDraft = async (req, res) => {
  try {
    const { draftId } = req.params;

    const draft = await AdmissionDraft.findOne({ draftId });

    if (!draft) {
      return res.status(404).json({
        success: false,
        message: "Draft not found",
      });
    }

    return res.status(200).json({
      success: true,
      draft,
    });
  } catch (error) {
    console.error("Error fetching draft:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch draft",
      error: error.message,
    });
  }
};

/**
 * Submit completed admission form
 */
export const submitAdmission = async (req, res) => {
  try {
    const { formData, draftId } = req.body;

    // Extract data from different sections
    const {
      personalInfo = {},
      contactInfo = {},
      familyInfo = {},
      academicInfo = {},
      additionalInfo = {},
    } = formData;

    // Generate admission number (You can customize this logic)
    const year = new Date().getFullYear().toString().substr(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const admissionNo = `ADM-${year}${month}-${randomNum}`;

    // Create guardians array
    const guardians = [];

    if (familyInfo.fatherName) {
      guardians.push({
        type: "father",
        name: familyInfo.fatherName,
        occupation: familyInfo.fatherOccupation,
        phone: familyInfo.fatherPhone,
        email: familyInfo.fatherEmail,
      });
    }

    if (familyInfo.motherName) {
      guardians.push({
        type: "mother",
        name: familyInfo.motherName,
        occupation: familyInfo.motherOccupation,
        phone: familyInfo.motherPhone,
        email: familyInfo.motherEmail,
      });
    }

    // Create new student application
    const student = new Student({
      // Personal Info
      firstName: personalInfo.firstName,
      middleName: personalInfo.middleName,
      lastName: personalInfo.lastName,
      preferredName: personalInfo.preferredName,
      gender: personalInfo.gender,
      dateOfBirth: personalInfo.dob,
      photo: personalInfo.photo,
      bloodGroup: personalInfo.bloodGroup,
      medicalConditions: personalInfo.medicalConditions,

      // Contact Info
      email: contactInfo.email,
      phoneNumber: contactInfo.phone,
      alternatePhoneNumber: contactInfo.alternatePhone,
      address: {
        street: contactInfo.address,
        city: contactInfo.city,
        state: contactInfo.state,
        country: contactInfo.country,
        zipCode: contactInfo.zipCode,
      },
      emergencyContact: {
        name: contactInfo.emergencyContactName,
        phone: contactInfo.emergencyContactPhone,
        relationship: contactInfo.emergencyRelation,
      },

      // Family Info
      guardians,
      siblings: {
        count: familyInfo.siblings || 0,
        atSchool: familyInfo.siblingsAtSchool || false,
      },
      familyNotes: familyInfo.familyNotes,

      // Academic Info
      appliedClass: academicInfo.appliedClass,
      academicSession: academicInfo.session,
      admissionType: academicInfo.admissionType,
      board: academicInfo.board,
      previousSchool: {
        name: academicInfo.previousSchool,
        address: academicInfo.schoolAddress,
        lastClass: academicInfo.lastClass,
        lastGrade: academicInfo.lastGrade,
      },
      hasTransferCertificate: academicInfo.transferCertificate,
      stream: academicInfo.stream || "na",
      achievements: academicInfo.achievements,

      // Additional Info
      languages: additionalInfo.languages,
      transportRequired: additionalInfo.transport,
      hostelRequired: additionalInfo.hostel,
      activities: additionalInfo.activities,
      specialNeeds: additionalInfo.specialNeeds,
      hearAbout: additionalInfo.hearAbout,
      additionalInfo: additionalInfo.additionalInfo,
      termsAccepted: additionalInfo.termsAccepted,

      // System fields
      admissionNo,
      status: "submitted",
    });

    await student.save();

    // If draft exists, delete it since submission is complete
    if (draftId) {
      await AdmissionDraft.deleteOne({ draftId });
    }

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      referenceNumber: admissionNo,
      studentId: student._id,
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit application",
      error: error.message,
    });
  }
};

/**
 * Update admission status (for admin use)
 */
export const updateAdmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const validStatuses = ["under_review", "accepted", "rejected", "enrolled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student application not found",
      });
    }

    student.status = status;
    if (status === "enrolled") {
      student.isActive = true;
      student.admissionDate = new Date();
    }

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      student,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update application status",
      error: error.message,
    });
  }
};

/**
 * Get all admission applications with filters
 */
export const getAdmissions = async (req, res) => {
  try {
    const {
      status,
      appliedClass,
      academicSession,
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter
    const filter = {};

    if (status) filter.status = status;
    if (appliedClass) filter.appliedClass = appliedClass;
    if (academicSession) filter.academicSession = academicSession;

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const students = await Student.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Student.countDocuments(filter);

    return res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      students,
    });
  } catch (error) {
    console.error("Error fetching admissions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admissions",
      error: error.message,
    });
  }
};
