// miscModels.js
import mongoose, { Schema } from "mongoose";

/* Subject Model */
const SubjectSchema = new mongoose.Schema({
  // Core Identification
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    match: /^[A-Z]{3,4}\d{3}$/, // Example: MATH101, SCIE202
  },

  // Categorization
  type: {
    type: String,
    enum: ["Core", "Elective", "Practical", "Project"],
    default: "Core",
  },
  department: {
    type: String,
    enum: ["Science", "Humanities", "Commerce", "Arts", "General"],
    required: true,
  },

  // Academic Metadata
  creditHours: {
    type: Number,
    min: 1,
    max: 5,
    default: 3,
  },
  difficultyLevel: {
    type: String,
    enum: ["Basic", "Intermediate", "Advanced"],
    default: "Intermediate",
  },

  // Resource References
  // syllabus: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Document",
  // },
  // textbook: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Book",
  // },

  // Administrative
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

/* Class Model */
const ClassSchema = new Schema({
  name: { type: String, required: true }, // e.g., "Class 10"
  section: { type: String }, // e.g., "A"
  academicYear: String,
  subjects: [{ type: Schema.Types.ObjectId, ref: "Subject" }],
  teacher: {
    type: Schema.Types.ObjectId,
    ref: "Faculty",
  },

  capacity: { type: Number, default: 0 },
  description: String,
  classTeacher: {
    type: Schema.Types.ObjectId,
    ref: "Faculty",
  },
  grade: String,
});

/* Grade Model */
const GradeSchema = new Schema({
  name: { type: String, required: true }, // e.g., "A+", "B"
  minMarks: Number,
  maxMarks: Number,
  remarks: String,
});

/* Attendance Model */
const AttendanceSchema = new Schema({
  date: { type: Date, required: true },
  studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
  status: {
    type: String,
    enum: ["Present", "Absent", "Late", "Excused"],
    required: true,
  },
  remarks: String,
});

/* Book Model */
const BookSchema = new Schema({
  title: { type: String, required: true },
  author: String,
  isbn: { type: String, unique: true },
  category: {
    type: String,
    enum: ["Fiction", "Non-Fiction", "Reference", "Textbook", "Other"],
    default: "Other",
  },
  quantity: { type: Number, default: 1 },
  shelfLocation: String,
  publisher: String,
  bookId: { type: String, unique: true },
  publicationYear: Number,
  available: Number,
});

/* Vehicle Model */
const VehicleSchema = new Schema(
  {
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      enum: ["bus", "van", "other"],
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    driver: {
      name: {
        type: String,
        required: true,
      },
      licenseNumber: {
        type: String,
        required: true,
      },
      contactNumber: {
        type: String,
        required: true,
      },
      address: String,
    },
    route: {
      type: Schema.Types.ObjectId,
      ref: "TransportRoute",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* Fee Category Model */
const FeeCategorySchema = new Schema({
  name: { type: String, required: true }, // e.g., "Tuition", "Transport"
  description: String,
  isRecurring: { type: Boolean, default: false },
});

/* Exam Model */
const ExamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    examType: {
      type: String,
      enum: ["quarterly", "half-yearly", "annual", "other"],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    classes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Class",
        required: true,
      },
    ],
    subjects: [
      {
        subject: {
          type: Schema.Types.ObjectId,
          ref: "Subject",
          required: true,
        },
        examDate: {
          type: Date,
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
        totalMarks: {
          type: Number,
          required: true,
        },
        passingMarks: {
          type: Number,
          required: true,
        },
      },
    ],
    academicYear: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/* Holiday Model */
const HolidaySchema = new Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  type: {
    type: String,
    enum: ["Public", "School Specific"],
    default: "Public",
  },
  description: String,
});

/* Event Model */
const EventSchema = new Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  description: String,
  location: String,
  type: {
    type: String,
    enum: ["Academic", "Cultural", "Sports", "Other"],
    default: "Academic",
  },
});
/* Notification Model */
const NotificationSchema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  recipientType: {
    type: String,
    enum: ["All", "Faculty", "Student", "Parent"],
    default: "All",
  },
  recipientId: { type: Schema.Types.ObjectId, refPath: "recipientType" },
});

const LibraryBookSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    isbn: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
    },
    publisher: String,
    publishYear: Number,
    edition: String,
    copies: {
      type: Number,
      required: true,
      default: 1,
    },
    availableCopies: {
      type: Number,
      required: true,
      default: 1,
    },
    price: Number,
    rack: String,
    description: String,
  },
  {
    timestamps: true,
  }
);

const BookIssueSchema = new Schema(
  {
    book: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: [true, "Book ID is required"],
    },
    issuedTo: {
      type: Schema.Types.ObjectId,
      required: [true, "Recipient ID is required"],
      refPath: "issuedToModel", // Dynamic reference
    },
    issuedToModel: {
      type: String,
      required: [true, "Recipient model type is required"],
      enum: ["User", "Student", "Faculty"], // Allowed models
    },
    issuedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Issuer ID is required"],
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
      validate: {
        validator: function (value) {
          // Ensure dueDate is after issueDate
          return value > this.issueDate;
        },
        message: "Due date must be after issue date",
      },
    },
    returnDate: {
      type: Date,
      validate: {
        validator: function (value) {
          // Ensure returnDate is after issueDate (if provided)
          return !value || value >= this.issueDate;
        },
        message: "Return date cannot be before issue date",
      },
    },
    status: {
      type: String,
      enum: ["issued", "returned", "overdue", "lost"],
      default: "issued",
    },
    fine: {
      type: Number,
      min: [0, "Fine cannot be negative"],
      default: 0,
    },
    remarks: {
      type: String,
      maxlength: [500, "Remarks cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Create and export models
export const Subject = mongoose.model("Subject", SubjectSchema);
export const Class = mongoose.model("Class", ClassSchema);
export const Grade = mongoose.model("Grade", GradeSchema);
export const Attendance = mongoose.model("Attendance", AttendanceSchema);
export const Book = mongoose.model("Book", BookSchema);
export const Vehicle = mongoose.model("Vehicle", VehicleSchema);
export const FeeCategory = mongoose.model("FeeCategory", FeeCategorySchema);
export const Exam = mongoose.model("Exam", ExamSchema);
export const Holiday = mongoose.model("Holiday", HolidaySchema);
export const Event = mongoose.model("Event", EventSchema);
export const Notification = mongoose.model("Notification", NotificationSchema);
export const LibraryBook = mongoose.model("LibraryBook", LibraryBookSchema);
export const BookIssue = mongoose.model("BookIssue", BookIssueSchema);
