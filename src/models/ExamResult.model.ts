// File: src/models/ExamResult.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IExamResult } from '../types';

const ExamResultSchema: Schema = new Schema({
    exam: {
        type: Schema.Types.ObjectId,
        ref: 'Exam',
        required: true
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    class: {
        type: Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    section: {
        type: Schema.Types.ObjectId,
        ref: 'Section',
        required: true
    },
    results: [{
        subject: {
            type: Schema.Types.ObjectId,
            ref: 'Subject',
            required: true
        },
        marks: {
            type: Number,
            required: true
        },
        grade: String,
        remarks: String
    }],
    totalMarks: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    grade: String,
    rank: Number,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Ensure a student can have only one result per exam
ExamResultSchema.index({ exam: 1, student: 1 }, { unique: true });

const ExamResult = mongoose.model<IExamResult & Document>('ExamResult', ExamResultSchema);

export default ExamResult;