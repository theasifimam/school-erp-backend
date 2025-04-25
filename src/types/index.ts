import { Types } from "mongoose";


// File: src/types/index.ts
export interface IUser {
    _id?: string;
    username: string;
    email: string;
    password: string;
    role: 'admin' | 'teacher' | 'student' | 'parent';
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    lastLogin?: Date;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface IGuardian {
    relation: 'father' | 'mother' | 'guardian' | 'brother' | 'sister' | 'uncle' | 'aunt' | 'other';
    name: string;
    occupation?: string;
    contactNumber: string;
    email?: string;
    address?: string;
}

export interface IStudent extends Document {
    _id: string;
    user: string | IUser;
    admissionNo: string;
    firstName: string;
    lastName: string;
    gender: 'male' | 'female' | 'other';
    dateOfBirth: Date;
    class: string | IClass;
    section: string | ISection;
    guardians: IGuardian[];
    admissionDate: Date;
    bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
    address: string;
    phoneNumber?: string;
    rollNumber?: string;
    photo?: string;
    academicYear: string;
    transportRoute?: string | ITransportRoute;
    medicalInfo?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITeacher {
    _id?: string;
    user: string | IUser;
    employeeId: string;
    firstName: string;
    lastName: string;
    gender: 'male' | 'female' | 'other';
    dateOfBirth: Date;
    joiningDate: Date;
    qualification: string;
    experience?: number;
    subjects: string[] | ISubject[];
    classes: string[] | IClass[];
    contactNumber: string;
    email: string;
    address?: string;
    designation: string;
    department?: string;
    salary?: number;
    isClassTeacher?: boolean;
    classTeacherOf?: string | IClass;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IClass {
    _id?: string;
    name: string;
    sections: string[] | ISection[];
    classTeacher?: string | ITeacher;
    academicYear: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ISection {
    _id?: string;
    name: string;
    class: string | IClass;
    students: string[] | IStudent[];
    createdAt?: Date;
    updatedAt?: Date;
}



export interface ISubject {
    _id?: string;
    name: string;
    code: string;
    description?: string;
    class: string | IClass;
    teachers: string[] | ITeacher[];
    createdAt?: Date;
    updatedAt?: Date;
    guardians: IGuardian[];
    transportRoute?: Types.ObjectId;
}



export interface IAttendance {
    _id?: string;
    student: string | IStudent;
    class: string | IClass;
    section: string | ISection;
    date: Date;
    status: 'present' | 'absent' | 'late' | 'excused';
    remark?: string;
    createdBy: string | IUser;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IExam {
    _id?: string;
    name: string;
    examType: 'quarterly' | 'half-yearly' | 'annual' | 'other';
    startDate: Date;
    endDate: Date;
    classes: string[] | IClass[];
    subjects: Array<{
        subject: string | ISubject;
        examDate: Date;
        startTime: string;
        endTime: string;
        totalMarks: number;
        passingMarks: number;
    }>;
    academicYear: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IExamResult {
    _id?: string;
    exam: string | IExam;
    student: string | IStudent;
    class: string | IClass;
    section: string | ISection;
    results: Array<{
        subject: string | ISubject;
        marks: number;
        grade?: string;
        remarks?: string;
    }>;
    totalMarks: number;
    percentage: number;
    grade?: string;
    rank?: number;
    createdBy: string | IUser;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IFee {
    _id?: string;
    student: string | IStudent;
    feeType: 'tuition' | 'transport' | 'hostel' | 'examination' | 'other';
    amount: number;
    dueDate: Date;
    status: 'paid' | 'unpaid' | 'partial';
    paidAmount?: number;
    paidDate?: Date;
    paymentMethod?: 'cash' | 'cheque' | 'online' | 'other';
    transactionId?: string;
    receipt?: string;
    academicYear: string;
    createdBy: string | IUser;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ITimetable {
    _id?: string;
    class: string | IClass;
    section: string | ISection;
    academicYear: string;
    schedule: Array<{
        day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
        periods: Array<{
            period: number;
            subject: string | ISubject;
            teacher: string | ITeacher;
            startTime: string;
            endTime: string;
        }>;
    }>;
    createdBy: string | IUser;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface INotification {
    _id?: string;
    title: string;
    message: string;
    type: 'general' | 'exam' | 'holiday' | 'fees' | 'event';
    recipients: Array<{
        recipientType: 'all' | 'teachers' | 'students' | 'parents' | 'class' | 'individual';
        recipientId?: string;
    }>;
    isRead?: string[];
    expiryDate?: Date;
    createdBy: string | IUser;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ILibraryBook {
    _id?: string;
    title: string;
    author: string;
    isbn: string;
    category: string;
    publisher?: string;
    publishYear?: number;
    edition?: string;
    copies: number;
    availableCopies: number;
    price?: number;
    rack?: string;
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IBookIssue {
    _id?: string;
    book: string | ILibraryBook;
    issuedTo: string | IUser;
    issuedBy: string | IUser;
    issueDate: Date;
    dueDate: Date;
    returnDate?: Date;
    status: 'issued' | 'returned' | 'overdue' | 'lost';
    fine?: number;
    remarks?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ITransportVehicle {
    _id?: string;
    vehicleNumber: string;
    vehicleType: 'bus' | 'van' | 'other';
    capacity: number;
    driver: {
        name: string;
        licenseNumber: string;
        contactNumber: string;
        address?: string;
    };
    route: string | ITransportRoute;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ITransportRoute {
    _id?: string;
    name: string;
    description?: string;
    stops: Array<{
        name: string;
        time: string;
        distance?: number;
    }>;
    vehicle: string | ITransportVehicle;
    fare: number;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
