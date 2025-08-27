// app/api/users/[id]/subscription/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication and authorization check
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== params.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Get user's subscription from database
    const subscription = await prisma.subscription.findUnique({
      where: { userId: params.id },
    });

    // 3. Check if subscription is active
    const currentDate = new Date();
    let isActive = false;
    let daysRemaining = 0;

    if (subscription && subscription.status === 'ACTIVE') {
      if (subscription.endDate && subscription.endDate > currentDate) {
        isActive = true;
        daysRemaining = Math.ceil(
          (subscription.endDate.getTime() - currentDate.getTime()) / 
          (1000 * 60 * 60 * 24)
        );
      }
    }

    // 4. Return subscription status
    return NextResponse.json({
      data: {
        hasSubscription: isActive,
        subscription: subscription ? {
          plan: subscription.plan,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          daysRemaining: isActive ? daysRemaining : 0,
        } : null,
      }
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}