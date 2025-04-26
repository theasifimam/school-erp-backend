
// File: src/routes/attendance.routes.ts
import express from 'express';
import {
    getAttendanceRecords,
    createAttendanceRecord,
    createBulkAttendance,
    updateAttendanceRecord,
    deleteAttendanceRecord
} from '../controllers/attendance.controller';
import { protect, authorize } from '../middlewares/auth.middleware';

const router = express.Router();

router.route('/')
    .get(protect, getAttendanceRecords)
    .post(protect, authorize('admin', 'teacher'), createAttendanceRecord);

router.route('/bulk')
    .post(protect, authorize('admin', 'teacher'), createBulkAttendance);

router.route('/:id')
    .put(protect, authorize('admin', 'teacher'), updateAttendanceRecord)
    .delete(protect, authorize('admin'), deleteAttendanceRecord);

export default router;