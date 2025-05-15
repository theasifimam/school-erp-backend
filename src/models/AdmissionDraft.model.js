// File: src/models/AdmissionDraft.model.ts
import mongoose, { Schema } from "mongoose";

// This model is used to store admission form drafts
const AdmissionDraftSchema = new Schema(
  {
    draftId: {
      type: String,
      required: true,
      unique: true,
    },
    formData: {
      personalInfo: {
        type: Schema.Types.Mixed,
        default: {},
      },
      contactInfo: {
        type: Schema.Types.Mixed,
        default: {},
      },
      familyInfo: {
        type: Schema.Types.Mixed,
        default: {},
      },
      academicInfo: {
        type: Schema.Types.Mixed,
        default: {},
      },
      additionalInfo: {
        type: Schema.Types.Mixed,
        default: {},
      },
    },
    lastCompletedSection: {
      type: String,
      enum: [
        "personalInfo",
        "contactInfo",
        "familyInfo",
        "academicInfo",
        "additionalInfo",
        null,
      ],
      default: null,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    expiresAt: {
      type: Date,
      default: function () {
        // Draft expires after 30 days
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date;
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance and TTL
AdmissionDraftSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
AdmissionDraftSchema.index({ email: 1 });
AdmissionDraftSchema.index({ draftId: 1 });

const AdmissionDraft = mongoose.model("AdmissionDraft", AdmissionDraftSchema);

export default AdmissionDraft;
