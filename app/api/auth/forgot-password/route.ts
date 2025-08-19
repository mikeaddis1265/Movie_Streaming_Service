import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import { handleApiError } from "@/lib/error-handler";

const Schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  try {
    const { email } = Schema.parse(await req.json());
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Always return success to prevent email enumeration
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000);
      await prisma.verificationToken.create({
        data: { identifier: email, token, expires },
      });
      await sendPasswordResetEmail({ email, token });
    }
    
    return NextResponse.json({ 
      data: { 
        message: "If an account with this email exists, a password reset link has been sent." 
      } 
    });
  } catch (error) {
    return handleApiError(error);
  }
}