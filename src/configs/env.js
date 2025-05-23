import dotenv from "dotenv";

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI:
    process.env.MONGODB_URI || "mongodb://0.0.0.0:27017/imams_academy",
  JWT_SECRET: process.env.JWT_SECRET || "imam123123",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "30d",
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_COOKIE_EXPIRE: process.env.JWT_COOKIE_EXPIRE || 7,

  EMAIL_SERVICE: process.env.EMAIL_SERVICE || "gmail",
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_SECURE: process.env.EMAIL_SECURE || false,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  EMAIL_FROM: process.env.EMAIL_FROM,
};
