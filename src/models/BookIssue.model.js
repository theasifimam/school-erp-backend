// File: src/models/BookIssue.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IBookIssue } from '../types';

const BookIssueSchema: Schema = new Schema({
    book: {
        type: Schema.Types.ObjectId,
        ref: 'LibraryBook',
        required: true
    },
    issuedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    issuedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    issueDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    returnDate: Date,
    status: {
        type: String,
        enum: ['issued', 'returned', 'overdue', 'lost'],
        default: 'issued'
    },
    fine: Number,
    remarks: String
}, {
    timestamps: true
});

const BookIssue = mongoose.model<IBookIssue & Document>('BookIssue', BookIssueSchema);

export default BookIssue;
