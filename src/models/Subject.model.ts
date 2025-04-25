




// File: src/models/Subject.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { ISubject } from '../types';

const SubjectSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    class: {
        type: Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    teachers: [{
        type: Schema.Types.ObjectId,
        ref: 'Teacher'
    }]
}, {
    timestamps: true
});

const Subject = mongoose.model<ISubject & Document>('Subject', SubjectSchema);

export default Subject;