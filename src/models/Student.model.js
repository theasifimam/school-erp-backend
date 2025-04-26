// File: src/models/Student.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IStudent } from '../types';

const GuardianSchema = new Schema({
    relation: {
        type: String,
        enum: ['father', 'mother', 'guardian', 'brother', 'sister', 'uncle', 'aunt', 'other'],
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    occupation: {
        type: String,
        trim: true,
        maxlength: 100
    },
    contactNumber: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (v: string) {
                return /^[0-9]{10,15}$/.test(v);
            },
            message: (props: any) => `${props.value} is not a valid phone number!`
        }
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        validate: {
            validator: function (v: string) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: (props: any) => `${props.value} is not a valid email address!`
        }
    },
    address: {
        type: String,
        trim: true,
        maxlength: 200
    }
});

const StudentSchema: Schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    admissionNo: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true,
        validate: {
            validator: function (this: IStudent, dob: Date) {
                // Validate that date of birth is in the past and student is at least 3 years old
                const minAgeDate = new Date();
                minAgeDate.setFullYear(minAgeDate.getFullYear() - 3);
                return dob < minAgeDate;
            },
            message: 'Student must be at least 3 years old'
        }
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
    guardians: {
        type: [GuardianSchema],
        validate: {
            validator: function (guardians: any[]) {
                // Require at least one guardian
                return guardians && guardians.length > 0;
            },
            message: 'At least one guardian is required'
        }
    },
    admissionDate: {
        type: Date,
        default: Date.now,
        validate: {
            validator: function (this: IStudent, admissionDate: Date) {
                // Admission date should not be in the future
                return admissionDate <= new Date();
            },
            message: 'Admission date cannot be in the future'
        }
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null],
        uppercase: true
    },
    address: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    phoneNumber: {
        type: String,
        trim: true,
        validate: {
            validator: function (v: string) {
                if (!v) return true; // optional
                return /^[0-9]{10,15}$/.test(v);
            },
            message: (props: any) => `${props.value} is not a valid phone number!`
        }
    },
    rollNumber: {
        type: String,
        trim: true,
        uppercase: true
    },
    photo: {
        type: String,
        validate: {
            validator: function (v: string) {
                if (!v) return true; // optional
                return /\.(jpg|jpeg|png|gif)$/i.test(v);
            },
            message: 'Photo must be a valid image URL'
        }
    },
    academicYear: {
        type: String,
        required: true,
        match: [/^\d{4}-\d{4}$/, 'Please enter a valid academic year format (YYYY-YYYY)']
    },
    transportRoute: {
        type: Schema.Types.ObjectId,
        ref: 'TransportRoute'
    },
    medicalInfo: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
            return ret;
        }
    },
    toObject: {
        virtuals: true
    }
});

// Add index for better query performance
StudentSchema.index({ admissionNo: 1 });
StudentSchema.index({ class: 1, section: 1 });
StudentSchema.index({ isActive: 1 });

const Student = mongoose.model<IStudent & Document>('Student', StudentSchema);

export default Student;