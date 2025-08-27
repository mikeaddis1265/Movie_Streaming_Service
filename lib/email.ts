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
  try {
    console.log('Sending verification email to:', email);
    console.log('Using Resend API key:', process.env.RESEND_API_KEY ? 'Present' : 'Missing');
    console.log('From email:', process.env.MAIL_FROM);
    
    const verifyUrl = `${appUrl}/api/auth/verify-email?token=${encodeURIComponent(
      token
    )}`;
    
    console.log('Verification URL:', verifyUrl);
    
    const result = await resend.emails.send({
      from: process.env.MAIL_FROM || "noreply@example.com",
      to: email,
      subject: "Verify your email",
      html: `<p>Welcome! Click to verify your email:</p><p><a href="${verifyUrl}">Verify Email</a></p>`,
    });
    
    console.log('Email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
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
