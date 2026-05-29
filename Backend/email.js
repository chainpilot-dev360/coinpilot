import dotenv from "dotenv";
import nodemailer from "nodemailer";
import config from "./config.js";

dotenv.config();

function getMailTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("SMTP_USER or SMTP_PASS is missing in environment variables");
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

function getSender() {
  return process.env.SMTP_FROM || `${config.siteName} <${process.env.SMTP_USER}>`;
}

export async function sendWelcomeEmail(to, name) {
  try {
    const transporter = getMailTransporter();
    if (!transporter) return;

    await transporter.sendMail({
      from: getSender(),
      to,
      subject: `Welcome to ${config.siteName}`,
      html: `
        <h2>Welcome to ${config.siteName}, ${name}</h2>
        <p>Your account has been created successfully.</p>
      `,
    });
  } catch (error) {
    console.error("Welcome email failed:", error);
  }
}

export async function sendVerificationEmail(to, name, token) {
  try {
    const transporter = getMailTransporter();
    if (!transporter) return;

    const verifyUrl = `${process.env.FRONTEND_URL || config.frontendUrl}/verify-email?token=${token}`;

    await transporter.sendMail({
      from: getSender(),
      to,
      subject: `Verify your ${config.siteName} email`,
      html: `
        <h2>Hello ${name},</h2>
        <p>Please verify your email address to activate your ${config.siteName} account.</p>

        <p>
          <a href="${verifyUrl}" style="background:#2563eb;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;">
            Verify Email
          </a>
        </p>

        <p>If the button does not work, copy this link:</p>
        <p>${verifyUrl}</p>
      `,
    });
  } catch (error) {
    console.error("Verification email failed:", error);
  }
}

export async function sendPasswordResetEmail(to, name, token) {
  try {
    const transporter = getMailTransporter();
    if (!transporter) return;

    const resetUrl = `${process.env.FRONTEND_URL || config.frontendUrl}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: getSender(),
      to,
      subject: `Reset your ${config.siteName} password`,
      html: `
        <h2>Hello ${name},</h2>
        <p>You requested to reset your password.</p>

        <p>
          <a href="${resetUrl}" style="background:#dc2626;color:white;padding:12px 18px;border-radius:8px;text-decoration:none;">
            Reset Password
          </a>
        </p>

        <p>If you did not request this, ignore this email.</p>
        <p>${resetUrl}</p>
      `,
    });
  } catch (error) {
    console.error("Password reset email failed:", error);
  }
}
