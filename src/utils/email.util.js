import nodemailer from "nodemailer";
import { env } from "../configs/env.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: env.EMAIL_USERNAME,
    pass: env.EMAIL_PASSWORD,
  },
});

export const sendEmail = async ({ email, subject, message }) => {
  const mailOptions = {
    from: env.EMAIL_FROM,
    to: email,
    subject,
    text: message,
  };

  await transporter.sendMail(mailOptions);
};
