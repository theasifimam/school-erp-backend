import dotenv from 'dotenv';

dotenv.config();

export const env = {
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://0.0.0.0:27017/school_erp',
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
    NODE_ENV: process.env.NODE_ENV || 'development',
};