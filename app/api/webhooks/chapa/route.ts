import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { chapaVerify } from "@/lib/chapa";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const txRef: string | undefined = payload?.tx_ref || payload?.data?.tx_ref;

    if (!txRef) {
      return NextResponse.json({ error: "Missing tx_ref" }, { status: 400 });
    }

    // Verify with Chapa
    const verify = await chapaVerify(txRef);
    const data = verify?.data;

    if (!data || data.status !== "success") {
      console.error("Verification failed:", verify);
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }

    const userId: string | undefined = data.meta?.userId;
    const planId: string | undefined = data.meta?.planId;

    if (!userId || !planId) {
      console.error("Missing metadata:", data);
      return NextResponse.json({ error: "Missing user/plan metadata" }, { status: 400 });
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const currentDate = new Date();
    const endDate = new Date();
    if (plan.interval === "month") endDate.setMonth(endDate.getMonth() + 1);
    else if (plan.interval === "year") endDate.setFullYear(endDate.getFullYear() + 1);

    await prisma.subscription.upsert({
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

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Chapa webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
