import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, AppError, ErrorCodes } from "@/lib/error-handler";

async function verify(token: string) {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) {
    throw new AppError(
      ErrorCodes.TOKEN_INVALID,
      "Invalid verification token",
      400
    );
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    throw new AppError(
      ErrorCodes.TOKEN_EXPIRED,
      "Verification token has expired",
      400
    );
  }

  await prisma.user.updateMany({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.deleteMany({
    where: { identifier: record.identifier },
  });

  return NextResponse.json({
    data: {
      verified: true,
      message: "Email verified successfully",
    },
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        "Verification token is required",
        400
      );
    }

    return await verify(token);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      throw new AppError(
        ErrorCodes.VALIDATION_ERROR,
        "Verification token is required",
        400
      );
    }

    return await verify(token);
  } catch (error) {
    return handleApiError(error);
  }
}
