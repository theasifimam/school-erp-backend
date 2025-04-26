// File: src/controllers/bookIssue.controller.ts
import { Request, Response } from 'express';
import BookIssue from '../models/BookIssue.model';
import mongoose from 'mongoose';

class BookIssueController {
    // Create a new book issue
    async createBookIssue(req: Request, res: Response) {
        try {
            const { book, issuedTo, issuedBy, dueDate, remarks } = req.body;

            // Validate required fields
            if (!book || !issuedTo || !issuedBy || !dueDate) {
                return res.status(400).json({ message: 'Missing required fields' });
            }

            // Validate date format
            if (isNaN(new Date(dueDate).getTime())) {
                return res.status(400).json({ message: 'Invalid due date format' });
            }

            const newIssue = new BookIssue({
                book,
                issuedTo,
                issuedBy,
                dueDate: new Date(dueDate),
                remarks
            });

            const savedIssue = await newIssue.save();
            res.status(201).json(savedIssue);
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Server error', error });
        }
    }

    // Get all book issues
    async getAllBookIssues(req: Request, res: Response) {
        try {
            const { status, userId } = req.query;
            let filter = {};

            if (status) {
                filter = { ...filter, status };
            }

            if (userId) {
                filter = { ...filter, issuedTo: userId };
            }

            const issues = await BookIssue.find(filter)
                .populate('book', 'title author isbn')
                .populate('issuedTo', 'name email')
                .populate('issuedBy', 'name email')
                .sort({ issueDate: -1 });

            res.json(issues);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }

    // Get a single book issue by ID
    async getBookIssueById(req: Request, res: Response) {
        try {
            const issue = await BookIssue.findById(req.params.id)
                .populate('book')
                .populate('issuedTo')
                .populate('issuedBy');

            if (!issue) {
                return res.status(404).json({ message: 'Book issue not found' });
            }

            res.json(issue);
        } catch (error) {
            if (error instanceof mongoose.Error.CastError) {
                return res.status(400).json({ message: 'Invalid book issue ID' });
            }
            res.status(500).json({ message: 'Server error', error });
        }
    }

    // Update a book issue
    async updateBookIssue(req: Request, res: Response) {
        try {
            const { status, returnDate, fine, remarks } = req.body;
            const updateFields: any = {};

            if (status) updateFields.status = status;
            if (returnDate) updateFields.returnDate = new Date(returnDate);
            if (fine !== undefined) updateFields.fine = fine;
            if (remarks !== undefined) updateFields.remarks = remarks;

            // Check if book is being returned
            if (status === 'returned' && !returnDate) {
                updateFields.returnDate = new Date();
            }

            const updatedIssue = await BookIssue.findByIdAndUpdate(
                req.params.id,
                updateFields,
                { new: true, runValidators: true }
            );

            if (!updatedIssue) {
                return res.status(404).json({ message: 'Book issue not found' });
            }

            res.json(updatedIssue);
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                return res.status(400).json({ message: error.message });
            }
            if (error instanceof mongoose.Error.CastError) {
                return res.status(400).json({ message: 'Invalid book issue ID' });
            }
            res.status(500).json({ message: 'Server error', error });
        }
    }

    // Delete a book issue
    async deleteBookIssue(req: Request, res: Response) {
        try {
            const deletedIssue = await BookIssue.findByIdAndDelete(req.params.id);

            if (!deletedIssue) {
                return res.status(404).json({ message: 'Book issue not found' });
            }

            res.json({ message: 'Book issue deleted successfully' });
        } catch (error) {
            if (error instanceof mongoose.Error.CastError) {
                return res.status(400).json({ message: 'Invalid book issue ID' });
            }
            res.status(500).json({ message: 'Server error', error });
        }
    }

    // Get overdue books
    async getOverdueBooks(req: Request, res: Response) {
        try {
            const today = new Date();
            const overdueIssues = await BookIssue.find({
                dueDate: { $lt: today },
                status: { $ne: 'returned' }
            })
                .populate('book', 'title author')
                .populate('issuedTo', 'name email')
                .sort({ dueDate: 1 });

            res.json(overdueIssues);
        } catch (error) {
            res.status(500).json({ message: 'Server error', error });
        }
    }

    // Calculate fine for a book issue
    async calculateFine(req: Request, res: Response) {
        try {
            const issue = await BookIssue.findById(req.params.id);

            if (!issue) {
                return res.status(404).json({ message: 'Book issue not found' });
            }

            if (issue.status === 'returned') {
                return res.json({ fine: issue.fine || 0 });
            }

            const today = new Date();
            const dueDate = new Date(issue.dueDate);

            if (today <= dueDate) {
                return res.json({ fine: 0 });
            }

            const diffTime = Math.abs(today.getTime() - dueDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const fineAmount = diffDays * 10; // Assuming $10 per day fine

            // Update the fine in the database
            issue.fine = fineAmount;
            await issue.save();

            res.json({ fine: fineAmount });
        } catch (error) {
            if (error instanceof mongoose.Error.CastError) {
                return res.status(400).json({ message: 'Invalid book issue ID' });
            }
            res.status(500).json({ message: 'Server error', error });
        }
    }
}

export default new BookIssueController();