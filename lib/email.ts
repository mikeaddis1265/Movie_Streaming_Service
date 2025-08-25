import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");

const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

export async function sendVerificationEmail({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const verifyUrl = `${appUrl}/api/auth/verify-email?token=${encodeURIComponent(
    token
  )}`;
  await resend.emails.send({
    from: process.env.MAIL_FROM || "noreply@example.com",
    to: email,
    subject: "Verify your email",
    html: `<p>Welcome! Click to verify your email:</p><p><a href="${verifyUrl}">Verify Email</a></p>`,
  });
}

export async function sendPasswordResetEmail({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const resetUrl = `${appUrl}/auth/reset?token=${encodeURIComponent(token)}`;
  await resend.emails.send({
    from: process.env.MAIL_FROM || "noreply@example.com",
    to: email,
    subject: "Reset your password",
    html: `<p>You requested a password reset.</p><p>Reset here: <a href="${resetUrl}">Reset Password</a></p>`,
  });
}
