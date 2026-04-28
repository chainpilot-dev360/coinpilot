import dotenv from "dotenv";
import { Resend } from "resend";

dotenv.config();

function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is missing in .env");
    return null;
  }

  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendWelcomeEmail(to, name) {
  try {
    const resend = getResendClient();
    if (!resend) return;

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
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
    const resend = getResendClient();
    if (!resend) return;

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
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