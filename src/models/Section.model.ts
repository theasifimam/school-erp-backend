
// File: src/models/Section.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { ISection } from '../types';

const SectionSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    class: {
        type: Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'Student'
    }]
}, {
    timestamps: true
});

// Ensure unique name per class
SectionSchema.index({ name: 1, class: 1 }, { unique: true });

const Section = mongoose.model<ISection & Document>('Section', SectionSchema);

export default Section;