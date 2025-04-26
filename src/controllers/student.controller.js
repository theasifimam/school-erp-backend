


// File: src/controllers/student.controller.ts
import { Request, Response } from 'express';
import Student from '../models/Student.model';
import User from '../models/User.model';
import Section from '../models/Section.model';
import mongoose from 'mongoose';
import { IStudent } from '../types';

// Get all students
export const getAllStudents = async (req: Request, res: Response) => {
    try {
        const { class: classId, section, academicYear, active } = req.query;

        const filter: any = {};

        if (classId) filter.class = classId;
        if (section) filter.section = section;
        if (academicYear) filter.academicYear = academicYear;
        if (active !== undefined) filter.isActive = active === 'true';

        const students = await Student.find(filter)
            .populate('user', 'username email')
            .populate('class', 'name')
            .populate('section', 'name')
            .populate('transportRoute', 'name')
            .sort({ admissionNo: 1 });

        res.status(200).json({
            status: 'success',
            count: students.length,
            data: students
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get student by ID
export const getStudentById = async (req: Request, res: Response) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('user', 'username email')
            .populate('class', 'name')
            .populate('section', 'name')
            .populate('transportRoute', 'name');

        if (!student) {
            return res.status(404).json({
                status: 'error',
                message: 'Student not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: student
        });
    } catch (error: any) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Create student
export const createStudent = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            firstName,
            lastName,
            gender,
            dateOfBirth,
            classId,
            section,
            guardians,
            admissionDate,
            bloodGroup,
            address,
            phoneNumber,
            rollNumber,
            academicYear,
            transportRoute,
            medicalInfo,
            password
        } = req.body;

        // Generate unique admission number
        const lastStudent = await Student.findOne().sort({ createdAt: -1 });
        let admissionNo = `${new Date().getFullYear()}0001`;

        if (lastStudent) {
            const lastAdmNo = lastStudent.admissionNo;
            const year = new Date().getFullYear().toString();

            if (lastAdmNo.startsWith(year)) {
                const numericPart = parseInt(lastAdmNo.substring(4));
                admissionNo = `${year}${String(numericPart + 1).padStart(4, '0')}`;
            }
        }

        // Create user account
        const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
        const email = `${username}@school.com`;

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({
                status: 'error',
                message: 'Username already in use'
            });
        }

        const user = await User.create([{
            username,
            email,
            password: password || 'student123', // Default password if not provided
            role: 'student',
            isActive: true
        }], { session });

        // Create student
        const student = await Student.create([{
            user: user[0]._id,
            admissionNo,
            firstName,
            lastName,
            gender,
            dateOfBirth,
            class: classId,
            section,
            guardians,
            admissionDate: admissionDate || new Date(),
            bloodGroup,
            address,
            phoneNumber,
            rollNumber,
            academicYear,
            transportRoute,
            medicalInfo,
            isActive: true
        }], { session });

        // Add student to section
        await Section.findByIdAndUpdate(
            section,
            { $push: { students: student[0]._id } },
            { session }
        );

        await session.commitTransaction();

        res.status(201).json({
            status: 'success',
            data: student[0]
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

// Update student
export const updateStudent = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const {
            firstName,
            lastName,
            gender,
            dateOfBirth,
            classId,
            section: newSectionId,
            guardians,
            bloodGroup,
            address,
            phoneNumber,
            rollNumber,
            academicYear,
            transportRoute,
            medicalInfo,
            isActive
        } = req.body;

        const studentId = req.params.id;

        // Validate student ID
        if (!mongoose.Types.ObjectId.isValid(studentId)) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid student ID'
            });
        }

        const student = await Student.findById(studentId).session(session);

        if (!student) {
            return res.status(404).json({
                status: 'error',
                message: 'Student not found'
            });
        }

        // Handle section change
        if (newSectionId && student.section.toString() !== newSectionId) {
            // Validate new section ID
            if (!mongoose.Types.ObjectId.isValid(newSectionId)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid section ID'
                });
            }

            const newSection = await Section.findById(newSectionId).session(session);
            if (!newSection) {
                return res.status(404).json({
                    status: 'error',
                    message: 'New section not found'
                });
            }

            // Verify new section belongs to the same class
            if (classId && newSection.class.toString() !== classId) {
                return res.status(400).json({
                    status: 'error',
                    message: 'New section does not belong to the specified class'
                });
            }

            // Remove from old section
            await Section.findByIdAndUpdate(
                student.section,
                { $pull: { students: student._id } },
                { session }
            );

            // Add to new section
            await Section.findByIdAndUpdate(
                newSectionId,
                { $push: { students: student._id } },
                { session }
            );
        }

        // Prepare update data
        const updateData: Partial<IStudent> = {
            firstName: firstName ?? student.firstName,
            lastName: lastName ?? student.lastName,
            gender: gender ?? student.gender,
            dateOfBirth: dateOfBirth ?? student.dateOfBirth,
            class: classId ?? student.class,
            section: newSectionId ?? student.section,
            guardians: guardians ?? student.guardians,
            bloodGroup: bloodGroup ?? student.bloodGroup,
            address: address ?? student.address,
            phoneNumber: phoneNumber ?? student.phoneNumber,
            rollNumber: rollNumber ?? student.rollNumber,
            academicYear: academicYear ?? student.academicYear,
            transportRoute: transportRoute ?? student.transportRoute,
            medicalInfo: medicalInfo ?? student.medicalInfo,
            isActive: isActive !== undefined ? isActive : student.isActive
        };

        // Update student
        const updatedStudent = await Student.findByIdAndUpdate(
            studentId,
            updateData,
            {
                new: true,
                runValidators: true,
                session,
                context: 'query' // Needed for proper validation
            }
        )
            .populate('user', 'username email')
            .populate('class', 'name')
            .populate('section', 'name')
            .populate('transportRoute', 'name')
            .session(session);

        if (!updatedStudent) {
            throw new Error('Failed to update student');
        }

        await session.commitTransaction();

        res.status(200).json({
            status: 'success',
            data: updatedStudent
        });
    } catch (error: any) {
        await session.abortTransaction();

        console.error('Error updating student:', error);

        const statusCode = error.name === 'ValidationError' ? 400 : 500;
        const message = error.name === 'ValidationError'
            ? error.message
            : 'An error occurred while updating the student';

        res.status(statusCode).json({
            status: 'error',
            message
        });
    } finally {
        session.endSession();
    }
};

// Delete student
export const deleteStudent = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({
                status: 'error',
                message: 'Student not found'
            });
        }

        // Remove student from section
        await Section.findByIdAndUpdate(
            student.section,
            { $pull: { students: student._id } },
            { session }
        );

        // Delete student document
        await Student.findByIdAndDelete(req.params.id, { session });

        // Delete associated user account
        await User.findByIdAndDelete(student.user, { session });

        await session.commitTransaction();

        res.status(200).json({
            status: 'success',
            message: 'Student deleted successfully'
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
