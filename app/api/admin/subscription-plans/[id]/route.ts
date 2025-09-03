import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// DELETE subscription plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if plan is being used by active subscriptions
    const activeSubscriptions = await prisma.subscription.count({
      where: { 
        planId: id,
        status: 'ACTIVE'
      }
    });

    if (activeSubscriptions > 0) {
      // If plan is in use, deactivate instead of delete
      const plan = await prisma.subscriptionPlan.update({
        where: { id },
        data: { isActive: false },
      });

      return NextResponse.json({
        message: "Subscription plan deactivated (cannot delete as it has active subscribers)",
        data: plan,
      });
    } else {
      // If no active subscriptions, actually delete the plan
      await prisma.subscriptionPlan.delete({
        where: { id },
      });

      return NextResponse.json({
        message: "Subscription plan deleted successfully",
      });
    }
  } catch (error) {
    console.error("Admin subscription plan DELETE error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Subscription plan not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete subscription plan" },
      { status: 500 }
    );
  }
}

// PUT update subscription plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, price, currency, interval, features, isActive } = body;

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price && { price: parseFloat(price) }),
        ...(currency && { currency }),
        ...(interval && { interval }),
        ...(features && { features }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({
      message: "Subscription plan updated successfully",
      data: plan,
    });
  } catch (error) {
    console.error("Admin subscription plan PUT error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Subscription plan not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}