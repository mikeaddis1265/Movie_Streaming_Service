import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chapaVerify } from "@/lib/chapa";

export async function POST(request: NextRequest) {
  try {
    console.log("=== CHAPA WEBHOOK RECEIVED ===");
    const payload = await request.json();
    console.log("Webhook payload:", JSON.stringify(payload, null, 2));
    
    const txRef: string | undefined = payload?.tx_ref || payload?.data?.tx_ref;
    console.log("Extracted tx_ref:", txRef);

    if (!txRef) {
      console.error("No tx_ref found in payload");
      return NextResponse.json({ error: "Missing tx_ref" }, { status: 400 });
    }

    // Verify with Chapa
    console.log("Verifying payment with Chapa API...");
    const verify = await chapaVerify(txRef);
    console.log("Chapa verification response:", JSON.stringify(verify, null, 2));
    
    const data = verify?.data;

    if (!data || data.status !== "success") {
      console.error("Verification failed - Status:", data?.status);
      console.error("Full verification response:", verify);
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }

    console.log("Payment verified successfully");
    console.log("Payment data:", JSON.stringify(data, null, 2));

    const userId: string | undefined = data.meta?.userId;
    const planId: string | undefined = data.meta?.planId;
    console.log("Extracted metadata - userId:", userId, "planId:", planId);

    if (!userId || !planId) {
      console.error("Missing metadata in payment data");
      console.error("Available meta:", data.meta);
      return NextResponse.json({ error: "Missing user/plan metadata" }, { status: 400 });
    }

    console.log("Looking up plan with ID:", planId);
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: parseInt(planId) } });
    if (!plan) {
      console.error("Plan not found in database:", planId);
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    console.log("Found plan:", plan.name);

    const currentDate = new Date();
    const endDate = new Date();
    if (plan.interval === "month") endDate.setMonth(endDate.getMonth() + 1);
    else if (plan.interval === "year") endDate.setFullYear(endDate.getFullYear() + 1);

    console.log("Creating/updating subscription for user:", userId);
    console.log("Plan details:", { 
      planId: plan.id, 
      planName: plan.name, 
      interval: plan.interval,
      currentDate: currentDate.toISOString(),
      endDate: endDate.toISOString()
    });
    
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

    console.log("Subscription created/updated successfully:");
    console.log("- Subscription ID:", subscription.id);
    console.log("- User ID:", subscription.userId);
    console.log("- Plan ID:", subscription.planId);
    console.log("- Status:", subscription.status);
    console.log("- Period:", subscription.currentPeriodStart, "to", subscription.currentPeriodEnd);
    
    // Verify the subscription was created by fetching it back
    const verifySubscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { user: { select: { email: true } } }
    });
    console.log("Verification - Subscription exists:", !!verifySubscription);
    console.log("Verification - User email:", verifySubscription?.user?.email);
    
    console.log("=== WEBHOOK PROCESSED SUCCESSFULLY ===");
    return NextResponse.json({ 
      ok: true, 
      subscriptionId: subscription.id,
      status: subscription.status,
      userId: subscription.userId 
    });
  } catch (error) {
    console.error("Chapa webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
