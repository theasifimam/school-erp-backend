// File: src/app.ts
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/auth.routes.js";
// import studentRoutes from './routes/student.routes';
// import teacherRoutes from './routes/teacher.routes';
// import classRoutes from './routes/class.routes';
// import subjectRoutes from './routes/subject.routes';
// import attendanceRoutes from './routes/attendance.routes';
import { env } from "./configs/env.js";
// import examRoutes from './routes/exam.routes';
// import feeRoutes from './routes/fee.routes';
// import timetableRoutes from './routes/timetable.routes';
// import notificationRoutes from './routes/notification.routes';
// import libraryRoutes from './routes/library.routes';
// import transportRoutes from './routes/transport.routes';
// import reportRoutes from './routes/report.routes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose
  .connect(env.MONGODB_URI || "mongodb://0.0.0.0:27017/imams_academy")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// API Routes
app.use("/api/auth", authRoutes);
// app.use('/api/students', studentRoutes);
// app.use('/api/teachers', teacherRoutes);
// app.use('/api/classes', classRoutes);
// app.use('/api/subjects', subjectRoutes);
// app.use('/api/attendance', attendanceRoutes);
// app.use('/api/exams', examRoutes);
// app.use('/api/fees', feeRoutes);
// app.use('/api/timetable', timetableRoutes);
// app.use('/api/notifications', notificationRoutes);
// app.use('/api/library', libraryRoutes);
// app.use('/api/transport', transportRoutes);
// app.use('/api/reports', reportRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
});

// Start server
const PORT = env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

export default app;
