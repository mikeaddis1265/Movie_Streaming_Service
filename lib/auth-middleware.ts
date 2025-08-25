import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { AppError, ErrorCodes } from "@/lib/error-handler";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
  };
}

export async function requireAuth(req: Request): Promise<AuthenticatedRequest> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user || !(session.user as any).id) {
    throw new AppError(
      ErrorCodes.UNAUTHORIZED,
      "Authentication required",
      401
    );
  }

  return {
    ...req,
    user: {
      id: (session.user as any).id,
      email: session.user.email!,
      name: session.user.name || undefined,
      role: (session.user as any).role || 'user',
    },
  } as AuthenticatedRequest;
}

export async function requireAdmin(req: Request): Promise<AuthenticatedRequest> {
  const authenticatedReq = await requireAuth(req);
  
  if (authenticatedReq.user.role !== 'admin') {
    throw new AppError(
      ErrorCodes.FORBIDDEN,
      "Admin access required",
      403
    );
  }

  return authenticatedReq;
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: Request) => {
    try {
      const authenticatedReq = await requireAuth(req);
      return await handler(authenticatedReq);
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { 
            error: {
              code: error.code,
              message: error.message
            }
          },
          { status: error.statusCode }
        );
      }
      return NextResponse.json(
        { 
          error: {
            code: ErrorCodes.INTERNAL_ERROR,
            message: "Authentication error"
          }
        },
        { status: 500 }
      );
    }
  };
}

export function withAdminAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: Request) => {
    try {
      const authenticatedReq = await requireAdmin(req);
      return await handler(authenticatedReq);
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { 
            error: {
              code: error.code,
              message: error.message
            }
          },
          { status: error.statusCode }
        );
      }
      return NextResponse.json(
        { 
          error: {
            code: ErrorCodes.INTERNAL_ERROR,
            message: "Authentication error"
          }
        },
        { status: 500 }
      );
    }
  };
}