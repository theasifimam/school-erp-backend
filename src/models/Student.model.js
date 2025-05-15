// File: src/models/Student.model.ts
import mongoose, { Schema } from "mongoose";

// Guardian schema - updated to match form fields
const GuardianSchema = new Schema({
  relation: {
    type: String,
    enum: [
      "father",
      "mother",
      "guardian",
      "brother",
      "sister",
      "uncle",
      "aunt",
      "other",
    ],
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  occupation: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  contactNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        if (!v) return true; // optional
        return /^[0-9]{10,15}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        if (!v) return true; // optional
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
});

// Main student schema - updated with form fields
const StudentSchema = new Schema(
  {
    // Personal Information
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    middleName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    preferredName: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    gender: {
      type: String,
      enum: ["male", "female", "nonbinary", "other", "prefernottosay"],
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    photo: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true; // optional
          return /\.(jpg|jpeg|png|gif)$/i.test(v);
        },
        message: "Photo must be a valid image URL or file path",
      },
    },
    bloodGroup: {
      type: String,
      enum: ["a+", "a-", "b+", "b-", "ab+", "ab-", "o+", "o-", null],
      lowercase: true,
    },
    medicalConditions: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // Contact Information
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{10,15}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    alternatePhoneNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // optional
          return /^[0-9]{10,15}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
        maxlength: 100,
      },
      phone: {
        type: String,
        trim: true,
        validate: {
          validator: function (v) {
            if (!v) return true; // optional
            return /^[0-9]{10,15}$/.test(v);
          },
          message: (props) => `${props.value} is not a valid phone number!`,
        },
      },
      relationship: {
        type: String,
        trim: true,
        maxlength: 50,
      },
    },
    address: {
      street: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },
      city: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },
      state: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },
      country: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20,
      },
    },

    // Family Information
    guardians: [
      {
        type: {
          type: String,
          enum: ["father", "mother", "guardian"],
          required: true,
        },
        name: {
          type: String,
          required: true,
          trim: true,
          maxlength: 100,
        },
        occupation: {
          type: String,
          trim: true,
          maxlength: 100,
        },
        phone: {
          type: String,
          trim: true,
          validate: {
            validator: function (v) {
              if (!v) return true; // optional
              return /^[0-9]{10,15}$/.test(v);
            },
            message: (props) => `${props.value} is not a valid phone number!`,
          },
        },
        email: {
          type: String,
          trim: true,
          lowercase: true,
          validate: {
            validator: function (v) {
              if (!v) return true; // optional
              return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: (props) => `${props.value} is not a valid email address!`,
          },
        },
      },
    ],
    siblings: {
      count: {
        type: Number,
        min: 0,
        default: 0,
      },
      atSchool: {
        type: Boolean,
        default: false,
      },
    },
    familyNotes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // Academic Information
    appliedClass: {
      type: String,
      required: true,
      enum: [
        "nursery",
        "kg",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
      ],
    },
    academicSession: {
      type: String,
      required: true,
      match: [
        /^\d{4}-\d{4}$/,
        "Please enter a valid academic year format (YYYY-YYYY)",
      ],
    },
    admissionType: {
      type: String,
      required: true,
      enum: ["new", "transfer", "readmission"],
    },
    board: {
      type: String,
      enum: ["cbse", "icse", "state", "ib", "igcse", null],
    },
    previousSchool: {
      name: {
        type: String,
        trim: true,
        maxlength: 200,
      },
      address: {
        type: String,
        trim: true,
        maxlength: 300,
      },
      lastClass: {
        type: String,
        trim: true,
        maxlength: 50,
      },
      lastGrade: {
        type: String,
        trim: true,
        maxlength: 20,
      },
    },
    hasTransferCertificate: {
      type: Boolean,
      default: false,
    },
    stream: {
      type: String,
      enum: ["science", "commerce", "arts", "na", null],
    },
    achievements: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // Additional Information
    languages: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    transportRequired: {
      type: Boolean,
      default: false,
    },
    hostelRequired: {
      type: Boolean,
      default: false,
    },
    activities: {
      type: String,
      enum: [
        "sports",
        "music",
        "dance",
        "art",
        "debate",
        "science",
        "coding",
        "other",
        null,
      ],
    },
    specialNeeds: {
      type: Boolean,
      default: false,
    },
    hearAbout: {
      type: String,
      enum: [
        "website",
        "social",
        "newspaper",
        "friend",
        "event",
        "other",
        null,
      ],
    },
    additionalInfo: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    termsAccepted: {
      type: Boolean,
      default: false,
    },

    // System fields
    admissionNo: {
      type: String,
      trim: true,
      uppercase: true,
    },
    rollNumber: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "under_review",
        "accepted",
        "rejected",
        "enrolled",
      ],
      default: "draft",
    },
    admissionDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Add index for better query performance
StudentSchema.index({ status: 1 });
StudentSchema.index({ email: 1 });
StudentSchema.index({ admissionNo: 1 });
StudentSchema.index({ appliedClass: 1 });
StudentSchema.index({ academicSession: 1 });

// Create model
const Student = mongoose.model("Student", StudentSchema);

export default Student;
