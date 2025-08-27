import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcrypt";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { ErrorCodes, handleApiError } from "@/lib/error-handler";

const Schema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return createErrorResponse(
        ErrorCodes.UNAUTHORIZED,
        "You must be logged in to change password",
        401
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = Schema.parse(body);

    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true }
    });

    if (!user || !user.password) {
      return createErrorResponse(
        ErrorCodes.NOT_FOUND,
        "User not found or no password set",
        404
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return createErrorResponse(
        ErrorCodes.INVALID_CREDENTIALS,
        "Current password is incorrect",
        400
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword }
    });

    return createSuccessResponse(
      { passwordChanged: true },
      "Password changed successfully"
    );

  } catch (error) {
    return handleApiError(error);
  }
}