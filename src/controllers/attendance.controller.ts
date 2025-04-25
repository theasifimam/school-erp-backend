

// File: src/controllers/attendance.controller.ts
import { Request, Response } from 'express';
import Attendance from '../models/Attendance.model';
import Student from '../models/Student.model';

// Get attendance records
export const getAttendanceRecords = async (req: Request, res: Response) => {
    try {
        const { class: classId, section, student, date, startDate, endDate } = req.query;

        const filter: any = {};

        if (classId) filter.class = classId;
        if (section) filter.section = section;
        if (student) filter.student = student;

        if (date) {
            filter.date = new Date(date as string);
        } else if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate as string),
                $lte: new Date(endDate as string)
            };
        }

        const attendance = await Attendance.find(filter)
            .populate('student', 'firstName lastName admissionNo')
            .populate('class', 'name')
            .populate('section', 'name')
            .populate('createdBy', 'username')
            .sort({ date: -1 });

        res.status(200).json({
            status: 'success',
            count: attendance.length,
            data: attendance
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Create attendance record
export const createAttendanceRecord = async (req: Request, res: Response) => {
    try {
        const { student, classId, section, date, status, remark } = req.body;

        // Check if attendance record already exists
        const existingRecord = await Attendance.findOne({
            student,
            date: new Date(date)
        });

        if (existingRecord) {
            return res.status(400).json({
                status: 'error',
                message: 'Attendance record already exists for this student on this date'
            });
        }

        // Create attendance record
        const attendance = await Attendance.create({
            student,
            class: classId,
            section,
            date: new Date(date),
            status,
            remark,
            createdBy: req.user._id
        });

        res.status(201).json({
            status: 'success',
            data: attendance
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Create bulk attendance records
export const createBulkAttendance = async (req: Request, res: Response) => {
    try {
        const { classId, section, date, attendanceData } = req.body;

        if (!attendanceData || !Array.isArray(attendanceData)) {
            return res.status(400).json({
                status: 'error',
                message: 'Attendance data is required and must be an array'
            });
        }

        const formattedDate = new Date(date);

        // Get all students in the class and section
        // File: src/controllers/attendance.controller.ts (continued)
        // Get all students in the class and section
        const students = await Student.find({
            class: classId,
            section
        });

        const attendanceRecords = [];
        const errors = [];

        for (const data of attendanceData) {
            try {
                // Check if attendance record already exists
                const existingRecord = await Attendance.findOne({
                    student: data.student,
                    date: formattedDate
                });

                if (existingRecord) {
                    errors.push(`Attendance record already exists for student ID ${data.student}`);
                    continue;
                }

                // Create attendance record
                const attendance = await Attendance.create({
                    student: data.student,
                    class: classId,
                    section,
                    date: formattedDate,
                    status: data.status,
                    remark: data.remark || '',
                    createdBy: req.user._id
                });

                attendanceRecords.push(attendance);
            } catch (error: any) {
                errors.push(`Error for student ID ${data.student}: ${error.message}`);
            }
        }

        res.status(201).json({
            status: 'success',
            count: attendanceRecords.length,
            data: attendanceRecords,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update attendance record
export const updateAttendanceRecord = async (req: Request, res: Response) => {
    try {
        const { status, remark } = req.body;

        const attendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            {
                status,
                remark,
                updatedBy: req.user._id
            },
            { new: true, runValidators: true }
        ).populate('student', 'firstName lastName admissionNo')
            .populate('class', 'name')
            .populate('section', 'name');

        if (!attendance) {
            return res.status(404).json({
                status: 'error',
                message: 'Attendance record not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: attendance
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Delete attendance record
export const deleteAttendanceRecord = async (req: Request, res: Response) => {
    try {
        const attendance = await Attendance.findByIdAndDelete(req.params.id);

        if (!attendance) {
            return res.status(404).json({
                status: 'error',
                message: 'Attendance record not found'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Attendance record deleted successfully'
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
