// app/api/admin/users/restricted/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET - Get all restricted users
export async function GET(request: NextRequest) {
  try {
    // Authentication and admin authorization check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const includeExpired = searchParams.get('includeExpired') === 'true';

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;
    const now = new Date();

    // Build where clause
    const whereClause: any = {
      isRestricted: true,
    };

    // If not including expired restrictions, only get currently active ones
    if (!includeExpired) {
      whereClause.restrictedUntil = {
        gt: now
      };
    }

    // Get restricted users with pagination
    const [restrictedUsers, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          role: true,
          isRestricted: true,
          restrictedUntil: true,
          restrictedReason: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              reviews: true,
              ratings: true,
            }
          }
        },
        orderBy: {
          restrictedUntil: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.user.count({
        where: whereClause
      })
    ]);

    // Add status information for each user
    const usersWithStatus = restrictedUsers.map(user => ({
      ...user,
      isCurrentlyRestricted: user.restrictedUntil ? now < user.restrictedUntil : false,
      restrictionExpired: user.restrictedUntil ? now >= user.restrictedUntil : false,
      daysRemaining: user.restrictedUntil 
        ? Math.max(0, Math.ceil((user.restrictedUntil.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 0,
    }));

    return NextResponse.json({
      data: {
        restrictedUsers: usersWithStatus,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalUsers: totalCount,
          hasNextPage: page * limit < totalCount,
          hasPreviousPage: page > 1,
        },
        summary: {
          totalRestricted: totalCount,
          currentlyActive: usersWithStatus.filter(user => user.isCurrentlyRestricted).length,
          expired: usersWithStatus.filter(user => user.restrictionExpired).length,
        }
      }
    });

  } catch (error) {
    console.error('Get restricted users error:', error);
    return NextResponse.json(
      { error: 'Failed to get restricted users' },
      { status: 500 }
    );
  }
}