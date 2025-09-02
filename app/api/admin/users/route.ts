import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, AppError, ErrorCodes } from "@/lib/error-handler";
import { withAdminAuth } from "@/lib/auth-middleware";
import { z } from "zod";

// Get all users (admin only)
export async function GET(req: Request) {
  return withAdminAuth(async (authenticatedReq) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return NextResponse.json({ 
        data: { 
          users,
          total: users.length
        } 
      });
    } catch (error) {
      return handleApiError(error);
    }
  })(req);
}

const PromoteUserSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['USER', 'ADMIN']),
});

// Promote/demote user role (super admin only)
export async function PATCH(req: Request) {
  return withAdminAuth(async (authenticatedReq) => {
    try {
      const body = await req.json();
      const { userId, role } = PromoteUserSchema.parse(body);

      // Prevent self-demotion
      if (userId === authenticatedReq.user.id && role === 'USER') {
        throw new AppError(
          ErrorCodes.FORBIDDEN,
          "Cannot demote yourself from admin",
          403
        );
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        }
      });

      return NextResponse.json({ 
        data: { 
          user: updatedUser,
          message: `User role updated to ${role}`
        } 
      });
    } catch (error) {
      return handleApiError(error);
    }
  })(req);
}