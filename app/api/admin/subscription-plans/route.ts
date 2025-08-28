import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET all plans
export async function GET(request: NextRequest) {
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
}

// POST create plan
export async function POST(request: NextRequest) {
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
    data: { name, price, currency, interval, features, isActive: true },
  });
  return NextResponse.json({ data: plan }, { status: 201 });
}

// PUT update plan
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id)
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  const plan = await prisma.subscriptionPlan.update({
    where: { id },
    data: updates,
  });
  return NextResponse.json({ data: plan });
}

// DELETE archive plan
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  const plan = await prisma.subscriptionPlan.update({
    where: { id },
    data: { isActive: false },
  });
  return NextResponse.json({ data: plan });
}
