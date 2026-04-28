import { Resend } from "resend";

const resend = new Resend("paste_your_api_key_here");

export async function sendWelcomeEmail(to, name) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      subject: "Welcome to ChainPilot",
      html: `
        <h2>Welcome to ChainPilot, ${name}</h2>
        <p>Your account has been created successfully.</p>
        <p>You can now log in, manage your wallet, and start investing.</p>
      `,
    });
  } catch (error) {
    console.error("Email send failed:", error);
  }
}