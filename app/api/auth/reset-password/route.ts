import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcrypt";
import { handleApiError, AppError, ErrorCodes } from "@/lib/error-handler";

const Schema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const { token, newPassword } = Schema.parse(await req.json());
    
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });
    
    if (!record) {
      throw new AppError(
        ErrorCodes.TOKEN_INVALID,
        "Invalid reset token",
        400
      );
    }
    
    if (record.expires < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      throw new AppError(
        ErrorCodes.TOKEN_EXPIRED,
        "Reset token has expired",
        400
      );
    }
    
    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.updateMany({
      where: { email: record.identifier },
      data: { password: hashed },
    });
    
    await prisma.verificationToken.deleteMany({
      where: { identifier: record.identifier },
    });
    
    return NextResponse.json({ 
      data: { 
        reset: true,
        message: "Password reset successfully"
      } 
    });
  } catch (error) {
    return handleApiError(error);
  }
}
