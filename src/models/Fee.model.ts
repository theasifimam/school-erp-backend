// File: src/models/Fee.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IFee } from '../types';

const FeeSchema: Schema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    feeType: {
        type: String,
        enum: ['tuition', 'transport', 'hostel', 'examination', 'other'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['paid', 'unpaid', 'partial'],
        default: 'unpaid'
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    paidDate: Date,
    paymentMethod: {
        type: String,
        enum: ['cash', 'cheque', 'online', 'other']
    },
    transactionId: String,
    receipt: String,
    academicYear: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Fee = mongoose.model<IFee & Document>('Fee', FeeSchema);

export default Fee;
