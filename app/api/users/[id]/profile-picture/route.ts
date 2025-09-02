import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await params;
    
    // Check if user is updating their own profile or is an admin
    if (session.user.id !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.formData();
    const file: File | null = data.get("profilePicture") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed" 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "File too large. Maximum size is 5MB" 
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "profile-pictures");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const filename = `${userId}-${timestamp}${extension}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Update user's profile picture in database
    const profilePictureUrl = `/uploads/profile-pictures/${filename}`;
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { image: profilePictureUrl },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: { ...updatedUser, profilePicture: updatedUser.image },
      message: "Profile picture updated successfully"
    });

  } catch (error) {
    console.error("Profile picture upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload profile picture" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: userId } = await params;
    
    // Check if user is updating their own profile or is an admin
    if (session.user.id !== userId && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Remove profile picture from database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { image: null },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { ...updatedUser, profilePicture: updatedUser.image },
      message: "Profile picture removed successfully"
    });

  } catch (error) {
    console.error("Profile picture removal error:", error);
    return NextResponse.json(
      { error: "Failed to remove profile picture" },
      { status: 500 }
    );
  }
}