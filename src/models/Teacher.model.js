// File: src/models/Teacher.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { ITeacher } from '../types';

const TeacherSchema: Schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeId: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    joiningDate: {
        type: Date,
        required: true
    },
    qualification: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        default: 0
    },
    subjects: [{
        type: Schema.Types.ObjectId,
        ref: 'Subject'
    }],
    classes: [{
        type: Schema.Types.ObjectId,
        ref: 'Class'
    }],
    contactNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    address: String,
    designation: {
        type: String,
        required: true
    },
    department: String,
    salary: Number,
    isClassTeacher: {
        type: Boolean,
        default: false
    },
    classTeacherOf: {
        type: Schema.Types.ObjectId,
        ref: 'Class'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Teacher = mongoose.model<ITeacher & Document>('Teacher', TeacherSchema);

export default Teacher;