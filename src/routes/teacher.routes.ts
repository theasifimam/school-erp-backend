

// File: src/routes/teacher.routes.ts
import express from 'express';
import {
    getAllTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    deleteTeacher
} from '../controllers/teacher.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

router.route('/')
    .get(protect, getAllTeachers)
    .post(protect, authorize('admin'), createTeacher);

router.route('/:id')
    .get(protect, getTeacherById)
    .put(protect, authorize('admin'), updateTeacher)
    .delete(protect, authorize('admin'), deleteTeacher);

export default router;