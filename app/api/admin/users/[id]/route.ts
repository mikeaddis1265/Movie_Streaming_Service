// app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // 1. Authentication and admin authorization check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { role, banned, emailVerified } = body;

    // 3. Validate input
    const updateData: any = {};

    if (role !== undefined) {
      if (!["USER", "ADMIN"].includes(role)) {
        return NextResponse.json(
          { error: "Role must be USER or ADMIN" },
          { status: 400 }
        );
      }
      updateData.role = role as Role;
    }

    if (banned !== undefined) {
      // For banning, you might want to implement a separate banned flag
      // or handle it through user status field
      updateData.banned = banned;
    }

    if (emailVerified !== undefined) {
      updateData.emailVerified = emailVerified ? new Date() : null;
    }

    // 4. Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // 5. Return success response
    return NextResponse.json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("Admin update user error:", error);

    if (error.code === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// GET - Get user details for admin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Authentication and admin authorization check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get user details with related data
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        watchlist: {
          take: 5,
          orderBy: { addedAt: "desc" },
        },
        viewingHistory: {
          take: 5,
          orderBy: { watchedAt: "desc" },
        },
        ratings: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("Admin get user error:", error);
    return NextResponse.json(
      { error: "Failed to get user details" },
      { status: 500 }
    );
  }
}
