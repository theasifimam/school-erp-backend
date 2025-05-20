// File: src/models/Timetable.model.ts
import mongoose, { Schema, Document } from "mongoose";

const TimetableSchema = new Schema(
  {
    class: {
      type: Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    section: {
      type: Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    schedule: [
      {
        day: {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
          ],
          required: true,
        },
        periods: [
          {
            period: {
              type: Number,
              required: true,
            },
            subject: {
              type: Schema.Types.ObjectId,
              ref: "Subject",
              required: true,
            },
            teacher: {
              type: Schema.Types.ObjectId,
              ref: "Teacher",
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
          },
        ],
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a class and section can have only one timetable per academic year
TimetableSchema.index(
  { class: 1, section: 1, academicYear: 1 },
  { unique: true }
);

const Timetable = mongoose.model("Timetable", TimetableSchema);

export default Timetable;
