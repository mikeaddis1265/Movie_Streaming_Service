import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSuccessResponse, createErrorResponse } from "@/lib/api-response";
import { ErrorCodes } from "@/lib/error-handler";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return createErrorResponse(
        ErrorCodes.UNAUTHORIZED,
        "No active session found",
        401
      );
    }

    // For JWT strategy, we can't invalidate tokens server-side
    // The client should clear the session cookie
    // In a production app with refresh tokens, you'd invalidate them here
    
    return createSuccessResponse(
      { loggedOut: true },
      "Successfully logged out"
    );
  } catch (error) {
    return createErrorResponse(
      ErrorCodes.INTERNAL_ERROR,
      "Failed to logout",
      500
    );
  }
}