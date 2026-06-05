import dotenv from "dotenv";
import config from "./config.js";

dotenv.config();

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

async function sendBrevoEmail({ to, subject, html }) {
  if (!process.env.BREVO_API_KEY) {
    console.error("BREVO_API_KEY is missing");
    return;
  }

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "CoinPilot",
        email: "noreply@coinpilot.us",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Brevo API email failed: ${response.status} ${errorText}`);
  }
}

export async function sendWelcomeEmail(to, name) {
  try {
    await sendBrevoEmail({
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
    const verifyUrl = `${process.env.FRONTEND_URL || config.frontendUrl}/verify-email?token=${token}`;

    await sendBrevoEmail({
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
    const resetUrl = `${process.env.FRONTEND_URL || config.frontendUrl}/reset-password?token=${token}`;

    await sendBrevoEmail({
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
