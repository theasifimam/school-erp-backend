
// File: src/routes/student.routes.ts
import express from 'express';
import {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent
} from '../controllers/student.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

router.route('/')
    .get(protect, getAllStudents)
    .post(protect, authorize('admin'), createStudent);

router.route('/:id')
    .get(protect, getStudentById)
    .put(protect, authorize('admin'), updateStudent)
    .delete(protect, authorize('admin'), deleteStudent);

export default router;