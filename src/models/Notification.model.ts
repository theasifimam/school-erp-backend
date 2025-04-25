// File: src/models/Notification.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { INotification } from '../types';

const NotificationSchema: Schema = new Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['general', 'exam', 'holiday', 'fees', 'event'],
        required: true
    },
    recipients: [{
        recipientType: {
            type: String,
            enum: ['all', 'teachers', 'students', 'parents', 'class', 'individual'],
            required: true
        },
        recipientId: String
    }],
    isRead: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    expiryDate: Date,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

const Notification = mongoose.model<INotification & Document>('Notification', NotificationSchema);

export default Notification;