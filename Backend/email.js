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
      subject: `Verify your ${config.siteName} account`,
      html: `
        <h2>Welcome to ${config.siteName}, ${name}</h2>

        <p>
          Thank you for creating your ${config.siteName} account.
          To complete your registration and help secure your account,
          please verify your email address by clicking the button below.
        </p>

        <p style="margin:30px 0;">
          <a href="${verifyUrl}" style="background:#2563eb;color:#ffffff;padding:14px 24px;text-decoration:none;border-radius:8px;font-weight:600;display:inline-block;">
             Verify My Email
          </a>
        </p>

        <p>
          This verification helps us confirm ownership of your email address
          and protect your ${config.siteName} account.
        </p>

        <p>
          If you did not create a ${config.siteName} account, you can safely ignore this email.
        </p>

        <br>

        <p>
          Regards,<br>
          ${config.siteName} Support Team<br>
          ${process.env.FRONTEND_URL || config.frontendUrl}
        </p>
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
