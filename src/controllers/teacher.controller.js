

// File: src/controllers/teacher.controller.ts
import { Request, Response } from 'express';
import Teacher from '../models/Teacher.model';
import User from '../models/User.model';
import mongoose from 'mongoose';

// Get all teachers
export const getAllTeachers = async (req: Request, res: Response) => {
    try {
        const { department, designation, active } = req.query;

        const filter: any = {};

        if (department) filter.department = department;
        if (designation) filter.designation = designation;
        if (active !== undefined) filter.isActive = active === 'true';

        const teachers = await Teacher.find(filter)
            .populate('user', 'username email')
            .populate('subjects', 'name code')
            .populate('classes', 'name')
            .populate('classTeacherOf', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            count: teachers.length,
            data: teachers
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get teacher by ID
export const getTeacherById = async (req: Request, res: Response) => {
    try {
        const teacher = await Teacher.findById(req.params.id)
            .populate('user', 'username email')
            .populate('subjects', 'name code')
            .populate('classes', 'name')
            .populate('classTeacherOf', 'name');

        if (!teacher) {
            return res.status(404).json({
                status: 'error',
                message: 'Teacher not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: teacher
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Create teacher
export const createTeacher = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            firstName,
            lastName,
            gender,
            dateOfBirth,
            joiningDate,
            qualification,
            experience,
            subjects,
            classes,
            contactNumber,
            email,
            address,
            designation,
            department,
            salary,
            isClassTeacher,
            classTeacherOf,
            password
        } = req.body;

        // Generate unique employee ID
        const lastTeacher = await Teacher.findOne().sort({ createdAt: -1 });
        let employeeId = 'EMP00001';

        if (lastTeacher) {
            const lastEmployeeId = lastTeacher.employeeId;
            const numericPart = parseInt(lastEmployeeId.substring(3));
            employeeId = `EMP${String(numericPart + 1).padStart(5, '0')}`;
        }

        // Create user account
        const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                status: 'error',
                message: 'Email already in use'
            });
        }

        const user = await User.create([{
            username,
            email,
            password: password || 'password123', // Default password if not provided
            role: 'teacher',
            isActive: true
        }], { session });

        // Create teacher
        const teacher = await Teacher.create([{
            user: user[0]._id,
            employeeId,
            firstName,
            lastName,
            gender,
            dateOfBirth,
            joiningDate: joiningDate || new Date(),
            qualification,
            experience,
            subjects,
            classes,
            contactNumber,
            email,
            address,
            designation,
            department,
            salary,
            isClassTeacher: isClassTeacher || false,
            classTeacherOf,
            isActive: true
        }], { session });

        await session.commitTransaction();

        res.status(201).json({
            status: 'success',
            data: teacher[0]
        });
    } catch (error: any) {
        await session.abortTransaction();

        res.status(500).json({
            status: 'error',
            message: error.message
        });
    } finally {
        session.endSession();
    }
};

// Update teacher
export const updateTeacher = async (req: Request, res: Response) => {
    try {
        const {
            firstName,
            lastName,
            gender,
            dateOfBirth,
            qualification,
            experience,
            subjects,
            classes,
            contactNumber,
            address,
            designation,
            department,
            salary,
            isClassTeacher,
            classTeacherOf,
            isActive
        } = req.body;

        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({
                status: 'error',
                message: 'Teacher not found'
            });
        }

        const updatedTeacher = await Teacher.findByIdAndUpdate(
            req.params.id,
            {
                firstName: firstName || teacher.firstName,
                lastName: lastName || teacher.lastName,
                gender: gender || teacher.gender,
                dateOfBirth: dateOfBirth || teacher.dateOfBirth,
                qualification: qualification || teacher.qualification,
                experience: experience !== undefined ? experience : teacher.experience,
                subjects: subjects || teacher.subjects,
                classes: classes || teacher.classes,
                contactNumber: contactNumber || teacher.contactNumber,
                address: address || teacher.address,
                designation: designation || teacher.designation,
                department: department || teacher.department,
                salary: salary !== undefined ? salary : teacher.salary,
                isClassTeacher: isClassTeacher !== undefined ? isClassTeacher : teacher.isClassTeacher,
                classTeacherOf: classTeacherOf || teacher.classTeacherOf,
                isActive: isActive !== undefined ? isActive : teacher.isActive
            },
            { new: true, runValidators: true }
        ).populate('user', 'username email')
            .populate('subjects', 'name code')
            .populate('classes', 'name')
            .populate('classTeacherOf', 'name');

        res.status(200).json({
            status: 'success',
            data: updatedTeacher
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Delete teacher
export const deleteTeacher = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({
                status: 'error',
                message: 'Teacher not found'
            });
        }

        // Delete teacher document
        await Teacher.findByIdAndDelete(req.params.id, { session });

        // Delete associated user account
        await User.findByIdAndDelete(teacher.user, { session });

        await session.commitTransaction();

        res.status(200).json({
            status: 'success',
            message: 'Teacher deleted successfully'
        });
    } catch (error: any) {
        await session.abortTransaction();

        res.status(500).json({
            status: 'error',
            message: error.message
        });
    } finally {
        session.endSession();
    }
};
