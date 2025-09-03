// app/api/users/[id]/subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // 1. Authentication and authorization check
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get user's subscription from database
    console.log('=== SUBSCRIPTION STATUS CHECK ===');
    console.log('Looking for subscription for user:', id);
    console.log('Session user ID:', session.user.id);
    console.log('Request timestamp:', new Date().toISOString());
    
    const subscription = await prisma.subscription.findUnique({
      where: { userId: id },
      include: { user: { select: { email: true, name: true, image: true } } },
    });
    console.log('Found subscription:', subscription ? {
      id: subscription.id,
      userId: subscription.userId,
      planId: subscription.planId,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      userEmail: subscription.user?.email
    } : null);

    // 3. Check if subscription is active (based on currentPeriodEnd)
    const currentDate = new Date();
    let isActive = false;
    let daysRemaining = 0;

    if (subscription && subscription.status === "ACTIVE") {
      if (
        subscription.currentPeriodEnd &&
        subscription.currentPeriodEnd > currentDate
      ) {
        isActive = true;
        daysRemaining = Math.ceil(
          (subscription.currentPeriodEnd.getTime() - currentDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
      }
    }

    // 4. Log final determination and return subscription status
    console.log('=== SUBSCRIPTION STATUS RESULT ===');
    console.log('Subscription exists:', !!subscription);
    console.log('Status from DB:', subscription?.status);
    console.log('Current date:', currentDate.toISOString());
    console.log('Period end:', subscription?.currentPeriodEnd?.toISOString());
    console.log('Is active:', isActive);
    console.log('Days remaining:', daysRemaining);
    console.log('=====================================');
    
    return NextResponse.json({
      data: {
        hasSubscription: isActive,
        user: subscription?.user || null,
        subscription: subscription
          ? {
              planId: subscription.planId,
              status: subscription.status,
              currentPeriodStart: subscription.currentPeriodStart,
              currentPeriodEnd: subscription.currentPeriodEnd,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
              daysRemaining: isActive ? daysRemaining : 0,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Get subscription error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription status" },
      { status: 500 }
    );
  }
}

// POST cancel at period end
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const action = body?.action;
    if (action === "cancel") {
      await prisma.subscription.update({
        where: { userId: id },
        data: { cancelAtPeriodEnd: true },
      });
      return NextResponse.json({
        message: "Subscription set to cancel at period end",
      });
    }
    if (action === "resume") {
      await prisma.subscription.update({
        where: { userId: id },
        data: { cancelAtPeriodEnd: false, status: "ACTIVE" },
      });
      return NextResponse.json({ message: "Subscription resumed" });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Subscription action error:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 }
    );
  }
}

// DELETE subscription completely
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete subscription completely
    const deletedSubscription = await prisma.subscription.delete({
      where: { userId: id },
    });

    return NextResponse.json({ 
      message: "Subscription deleted successfully",
      data: deletedSubscription 
    });
  } catch (error: any) {
    console.error("Delete subscription error:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete subscription" },
      { status: 500 }
    );
  }
}
