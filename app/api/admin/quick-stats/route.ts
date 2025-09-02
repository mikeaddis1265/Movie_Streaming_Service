import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 401 }
      );
    }

    // Get basic subscription data
    const activeSubscriptions = await prisma.subscription.count({
      where: {
        status: 'ACTIVE'
      }
    });

    // Get total users for conversion rate calculation
    const totalUsers = await prisma.user.count();
    const conversionRate = totalUsers > 0 ? (activeSubscriptions / totalUsers) * 100 : 0;

    // Simple stats - only conversion rate that actually works
    const quickStats = {
      conversionRate: Number(conversionRate.toFixed(1))
    };

    return NextResponse.json({
      success: true,
      data: quickStats
    });

  } catch (error) {
    console.error('Quick stats API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch quick stats',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}