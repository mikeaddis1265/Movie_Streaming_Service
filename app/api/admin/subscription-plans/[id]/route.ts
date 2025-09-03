import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Type guard to check if error has a code property
function isPrismaError(error: unknown): error is { code: string; meta?: any } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as any).code === "string"
  );
}

// GET all plans
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }
    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { price: "asc" },
    });
    return NextResponse.json({ data: plans });
  } catch (error) {
    console.error("Get subscription plans error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription plans" },
      { status: 500 }
    );
  }
}

// POST create plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, price, currency = "USD", interval, features = [] } = body;

    if (!name || !price || !interval) {
      return NextResponse.json(
        { error: "name, price, interval are required" },
        { status: 400 }
      );
    }

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        price: parseFloat(price),
        currency,
        interval,
        features,
        isActive: true,
      },
    });

    return NextResponse.json({ data: plan }, { status: 201 });
  } catch (error) {
    console.error("Create subscription plan error:", error);
    return NextResponse.json(
      { error: "Failed to create subscription plan" },
      { status: 500 }
    );
  }
}

// PUT update plan
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = context.params;
    const body = await request.json();
    const { ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({ data: plan });
  } catch (error) {
    console.error("Update subscription plan error:", error);

    if (isPrismaError(error) && error.code === "P2025") {
      return NextResponse.json(
        { error: "Subscription plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update subscription plan" },
      { status: 500 }
    );
  }
}

// DELETE archive plan
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = context.params;
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ data: plan });
  } catch (error) {
    console.error("Admin subscription plan DELETE error:", error);

    if (isPrismaError(error) && error.code === "P2025") {
      return NextResponse.json(
        { error: "Subscription plan not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to archive subscription plan" },
      { status: 500 }
    );
  }
}