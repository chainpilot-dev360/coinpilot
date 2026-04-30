import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

function getMailTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("EMAIL_USER or EMAIL_PASS is missing in .env");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

export async function sendWelcomeEmail(to, name) {
  try {
    const transporter = getMailTransporter();
    if (!transporter) return;

    await transporter.sendMail({
      from: `ChainPilot <${process.env.EMAIL_USER}>`,
      to,
      subject: "Welcome to ChainPilot",
      html: `
        <h2>Welcome to ChainPilot, ${name}</h2>
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

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
      from: `ChainPilot <${process.env.EMAIL_USER}>`,
      to,
      subject: "Verify your ChainPilot email",
      html: `
        <h2>Hello ${name},</h2>
        <p>Please verify your email address to activate your ChainPilot account.</p>

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

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `ChainPilot <${process.env.EMAIL_USER}>`,
      to,
      subject: "Reset your ChainPilot password",
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