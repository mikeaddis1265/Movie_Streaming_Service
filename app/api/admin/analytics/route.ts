// app/api/admin/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication and admin authorization check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // 2. Get date range from query parameters (default: last 30 days)
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 3. Fetch analytics data in parallel
    const [
      totalUsers,
      newUsers,
      totalSubscriptions,
      activeSubscriptions,
      totalWatchlistItems,
      totalRatings,
      totalReviews,
      userGrowth,
      popularGenres,
      activeUsers
    ] = await Promise.all([
      // Total users count
      prisma.user.count(),

      // New users in time period
      prisma.user.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),

      // Total subscriptions
      prisma.subscription.count(),

      // Active subscriptions
      prisma.subscription.count({
        where: {
          status: 'ACTIVE',
          currentPeriodEnd: { gt: new Date() }
        }
      }),

      // Total watchlist items
      prisma.watchlistItem.count(),

      // Total ratings
      prisma.rating.count(),

      // Total reviews
      prisma.review.count(),

      // User growth over time (grouped by day)
      prisma.user.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'asc' }
      }),

      // Most popular genres from watchlist (you'd need to track this separately)
      // This is a placeholder - you'd need to implement genre tracking
      Promise.resolve([]),

      // Active users (users with activity in last 7 days)
      prisma.user.count({
        where: {
          OR: [
            { watchlist: { some: { addedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } } },
            { viewingHistory: { some: { watchedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } } },
            { ratings: { some: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } } }
          ]
        }
      })
    ]);

    // 4. Format user growth data
    const formattedUserGrowth = userGrowth.map(item => ({
      date: item.createdAt.toISOString().split('T')[0],
      count: item._count.id
    }));

    // 5. Return comprehensive analytics
    return NextResponse.json({
      data: {
        overview: {
          totalUsers,
          newUsers,
          totalSubscriptions,
          activeSubscriptions,
          totalWatchlistItems,
          totalRatings,
          totalReviews,
          activeUsers,
        },
        growth: {
          userGrowth: formattedUserGrowth,
          period: `${days} days`,
        },
        popularGenres, // You'd need to implement this
        timestamp: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}