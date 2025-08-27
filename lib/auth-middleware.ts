import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { AppError, ErrorCodes } from "@/lib/error-handler";
import { createErrorResponse } from "@/lib/api-response";

export type Role = 'USER' | 'ADMIN';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

export async function requireAuth(req: Request): Promise<AuthenticatedRequest> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new AppError(
      ErrorCodes.UNAUTHORIZED,
      "Authentication required",
      401
    );
  }

  return {
    ...req,
    user: {
      id: session.user.id,
      email: session.user.email || "",
      name: session.user.name || undefined,
      role: session.user.role || 'USER',
    },
  } as AuthenticatedRequest;
}

/**
 * Alternative auth check that returns Response instead of throwing
 */
export async function getAuthUser(request: NextRequest): Promise<AuthenticatedUser | Response> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return createErrorResponse(
      ErrorCodes.UNAUTHORIZED,
      "Authentication required",
      401
    );
  }

  return {
    id: session.user.id,
    email: session.user.email || "",
    name: session.user.name || undefined,
    role: session.user.role || "USER"
  };
}

export async function requireAdmin(req: Request): Promise<AuthenticatedRequest> {
  const authenticatedReq = await requireAuth(req);
  
  if (authenticatedReq.user.role !== 'ADMIN') {
    throw new AppError(
      ErrorCodes.FORBIDDEN,
      "Admin access required",
      403
    );
  }

  return authenticatedReq;
}

/**
 * Check if user has required role
 */
export async function requireRole(req: Request, requiredRole: Role): Promise<AuthenticatedRequest> {
  const authenticatedReq = await requireAuth(req);
  
  if (authenticatedReq.user.role !== requiredRole) {
    throw new AppError(
      ErrorCodes.FORBIDDEN,
      `${requiredRole} role required`,
      403
    );
  }

  return authenticatedReq;
}

/**
 * Check if user has permission for resource
 */
export function hasPermission(
  user: AuthenticatedUser, 
  resourceUserId?: string
): boolean {
  // Admin can access everything
  if (user.role === 'ADMIN') {
    return true;
  }
  
  // User can only access their own resources
  if (resourceUserId) {
    return user.id === resourceUserId;
  }
  
  return false;
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