import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";
import { handleApiError, AppError, ErrorCodes } from "@/lib/error-handler";
import { createSuccessResponse } from "@/lib/api-response";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
});

export async function POST(req: Request) {
  try {
    const { email, password, name } = Schema.parse(await req.json());
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new AppError(
        ErrorCodes.EMAIL_ALREADY_EXISTS,
        "User with this email already exists",
        409
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user (auto-verified in development)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: process.env.NODE_ENV === 'development' ? new Date() : null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });
    
    // Generate verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });
    
    // Send verification email
    await sendVerificationEmail({ email, token });
    
    const message = process.env.NODE_ENV === 'development' 
      ? "Registration successful! You can now login immediately."
      : "Registration successful. Please check your email to verify your account.";
      
    return createSuccessResponse(
      { user },
      message,
      201
    );
    
  } catch (error) {
    return handleApiError(error);
  }
}