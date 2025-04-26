

// File: src/models/Attendance.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IAttendance } from '../types';

const AttendanceSchema: Schema = new Schema({
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
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late', 'excused'],
        required: true
    },
    remark: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Ensure a student can have only one attendance record per day
AttendanceSchema.index({ student: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model<IAttendance & Document>('Attendance', AttendanceSchema);

export default Attendance;