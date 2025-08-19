import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";
import { handleApiError, AppError, ErrorCodes } from "@/lib/error-handler";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = RegisterSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError(
        ErrorCodes.EMAIL_ALREADY_EXISTS,
        "This email is already registered",
        409
      );
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: name || null,
      },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    console.log('Attempting to send verification email to:', email);
    try {
      await sendVerificationEmail({ email, token });
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue anyway - user is registered, they can request new verification
    }

    return NextResponse.json({ 
      data: { 
        id: user.id, 
        message: "Registration successful. Please check your email to verify your account." 
      } 
    });
  } catch (error) {
    return handleApiError(error);
  }
}
