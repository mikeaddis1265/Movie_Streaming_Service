import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId, planId } = await request.json();
    
    console.log("Testing subscription creation for:", { userId, planId });
    
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log("User found:", user.email);

    // Check if plan exists, create if not
    let plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      console.log("Plan not found, creating default plan...");
      const defaultPlans = {
        '1': { name: 'Basic', price: 9.99, currency: 'USD', interval: 'month', features: ['HD Quality'], isActive: true },
        '2': { name: 'Premium', price: 15.99, currency: 'USD', interval: 'month', features: ['4K Ultra HD'], isActive: true },
        '3': { name: 'Family', price: 19.99, currency: 'USD', interval: 'month', features: ['4K Ultra HD', '6 Devices'], isActive: true }
      };
      
      const defaultPlan = defaultPlans[planId as keyof typeof defaultPlans];
      if (defaultPlan) {
        plan = await prisma.subscriptionPlan.create({
          data: { id: planId, ...defaultPlan }
        });
        console.log("Created plan:", plan.name);
      } else {
        return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 });
      }
    }

    // Create subscription
    const currentDate = new Date();
    const endDate = new Date();
    if (plan.interval === "month") endDate.setMonth(endDate.getMonth() + 1);
    else if (plan.interval === "year") endDate.setFullYear(endDate.getFullYear() + 1);

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      update: {
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: currentDate,
        currentPeriodEnd: endDate,
        cancelAtPeriodEnd: false,
      },
      create: {
        userId,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: currentDate,
        currentPeriodEnd: endDate,
        cancelAtPeriodEnd: false,
      },
    });

    console.log("Subscription created:", subscription.id);

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        planName: plan.name,
        status: subscription.status,
        expiresAt: subscription.currentPeriodEnd,
      }
    });

  } catch (error) {
    console.error("Test subscription error:", error);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "Test subscription endpoint",
    usage: "POST with { userId, planId }" 
  });
}