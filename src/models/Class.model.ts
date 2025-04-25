
// File: src/models/Class.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IClass } from '../types';

const ClassSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    sections: [{
        type: Schema.Types.ObjectId,
        ref: 'Section'
    }],
    classTeacher: {
        type: Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    academicYear: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Class = mongoose.model<IClass & Document>('Class', ClassSchema);

export default Class;