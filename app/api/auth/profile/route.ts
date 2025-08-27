import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { ErrorCodes, handleApiError } from "@/lib/error-handler";

const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return createErrorResponse(
        ErrorCodes.UNAUTHORIZED,
        "You must be logged in to view profile",
        401
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return createErrorResponse(
        ErrorCodes.NOT_FOUND,
        "User not found",
        404
      );
    }

    return createSuccessResponse(user);

  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return createErrorResponse(
        ErrorCodes.UNAUTHORIZED,
        "You must be logged in to update profile",
        401
      );
    }

    const body = await request.json();
    const updateData = UpdateProfileSchema.parse(body);

    // Check if username is already taken (if updating username)
    if (updateData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: updateData.username,
          NOT: { id: session.user.id }
        }
      });

      if (existingUser) {
        return createErrorResponse(
          ErrorCodes.VALIDATION_ERROR,
          "Username is already taken",
          400
        );
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        role: true,
        updatedAt: true
      }
    });

    return createSuccessResponse(
      updatedUser,
      "Profile updated successfully"
    );

  } catch (error) {
    return handleApiError(error);
  }
}