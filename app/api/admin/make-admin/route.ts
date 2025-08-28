import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/error-handler";
import { z } from "zod";

// Temporary endpoint to create first admin user
// TODO: Remove this in production or protect it better
const MakeAdminSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Not available in production' } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email } = MakeAdminSchema.parse(body);

    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });

    return NextResponse.json({ 
      data: { 
        user,
        message: `User ${email} is now an admin` 
      } 
    });
  } catch (error) {
    return handleApiError(error);
  }
}