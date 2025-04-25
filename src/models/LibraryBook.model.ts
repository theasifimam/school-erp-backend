

// File: src/models/LibraryBook.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { ILibraryBook } from '../types';

const LibraryBookSchema: Schema = new Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    isbn: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true
    },
    publisher: String,
    publishYear: Number,
    edition: String,
    copies: {
        type: Number,
        required: true,
        default: 1
    },
    availableCopies: {
        type: Number,
        required: true,
        default: 1
    },
    price: Number,
    rack: String,
    description: String
}, {
    timestamps: true
});

const LibraryBook = mongoose.model<ILibraryBook & Document>('LibraryBook', LibraryBookSchema);

export default LibraryBook;