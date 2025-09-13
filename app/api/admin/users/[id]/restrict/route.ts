// app/api/admin/users/[id]/restrict/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// POST - Restrict/Freeze a user
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Authentication and admin authorization check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { days = 10, reason = 'Account violation' } = body;

    // Validate input
    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Restriction days must be between 1 and 365' },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Restriction reason is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const userToRestrict = await prisma.user.findUnique({
      where: { id },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true,
        isRestricted: true,
        restrictedUntil: true 
      }
    });

    if (!userToRestrict) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent admin from restricting another admin
    if (userToRestrict.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot restrict admin users' },
        { status: 400 }
      );
    }

    // Prevent admin from restricting themselves
    if (userToRestrict.id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot restrict yourself' },
        { status: 400 }
      );
    }

    // Calculate restriction end date
    const restrictedUntil = new Date();
    restrictedUntil.setDate(restrictedUntil.getDate() + days);

    // Update user restriction status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isRestricted: true,
        restrictedUntil,
        restrictedReason: reason.trim(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isRestricted: true,
        restrictedUntil: true,
        restrictedReason: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      message: `User restricted successfully for ${days} days`,
      data: updatedUser
    });

  } catch (error) {
    console.error('Restrict user error:', error);
    return NextResponse.json(
      { error: 'Failed to restrict user' },
      { status: 500 }
    );
  }
}

// DELETE - Unrestrict/Unfreeze a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Authentication and admin authorization check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Check if user exists
    const userToUnrestrict = await prisma.user.findUnique({
      where: { id },
      select: { 
        id: true, 
        email: true, 
        name: true, 
        isRestricted: true,
        restrictedUntil: true 
      }
    });

    if (!userToUnrestrict) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is actually restricted
    if (!userToUnrestrict.isRestricted) {
      return NextResponse.json(
        { error: 'User is not currently restricted' },
        { status: 400 }
      );
    }

    // Remove user restriction
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isRestricted: false,
        restrictedUntil: null,
        restrictedReason: null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isRestricted: true,
        restrictedUntil: true,
        restrictedReason: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      message: 'User restriction removed successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Unrestrict user error:', error);
    return NextResponse.json(
      { error: 'Failed to remove user restriction' },
      { status: 500 }
    );
  }
}

// GET - Get user restriction status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Authentication and admin authorization check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get user restriction info
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isRestricted: true,
        restrictedUntil: true,
        restrictedReason: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if restriction has expired
    const now = new Date();
    const isCurrentlyRestricted = user.isRestricted && user.restrictedUntil && now < user.restrictedUntil;

    return NextResponse.json({
      data: {
        ...user,
        isCurrentlyRestricted,
        restrictionExpired: user.isRestricted && user.restrictedUntil && now >= user.restrictedUntil,
      }
    });

  } catch (error) {
    console.error('Get user restriction status error:', error);
    return NextResponse.json(
      { error: 'Failed to get user restriction status' },
      { status: 500 }
    );
  }
}