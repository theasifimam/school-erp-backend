

// File: src/models/Exam.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IExam } from '../types';

const ExamSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    examType: {
        type: String,
        enum: ['quarterly', 'half-yearly', 'annual', 'other'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    classes: [{
        type: Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    }],
    subjects: [{
        subject: {
            type: Schema.Types.ObjectId,
            ref: 'Subject',
            required: true
        },
        examDate: {
            type: Date,
            required: true
        },
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        },
        totalMarks: {
            type: Number,
            required: true
        },
        passingMarks: {
            type: Number,
            required: true
        }
    }],
    academicYear: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Exam = mongoose.model<IExam & Document>('Exam', ExamSchema);

export default Exam;