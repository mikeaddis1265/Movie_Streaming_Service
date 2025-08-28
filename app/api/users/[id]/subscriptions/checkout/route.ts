// app/api/subscriptions/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { chapaInitialize } from "@/lib/chapa";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { planId, paymentProvider } = body;

    if (!planId) {
      return NextResponse.json(
        { error: "planId is required" },
        { status: 400 }
      );
    }

    // 3. Get subscription plan details
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { error: "Invalid subscription plan" },
        { status: 400 }
      );
    }

    // 4. Initialize payment (Chapa or offline/test)
    if ((paymentProvider || "chapa") === "chapa") {
      const txRef = `sub_${session.user.id}_${Date.now()}`;
      const init = await chapaInitialize({
        amount: plan.price,
        currency: plan.currency,
        email: session.user.email || "user@example.com",
        tx_ref: txRef,
        callback_url: env.CHAPA_CALLBACK_URL,
        return_url: env.CHAPA_RETURN_URL,
        custom_fields: {
          userId: session.user.id,
          planId: plan.id,
        },
      });

      // Return payment link so client redirects to Chapa checkout
      return NextResponse.json(
        {
          data: {
            provider: "chapa",
            checkout_url: init?.data?.checkout_url,
            tx_ref: txRef,
          },
        },
        { status: 201 }
      );
    }

    // 5. Fallback: simulate payment and create subscription
    const currentDate = new Date();
    const endDate = new Date();

    // Calculate end date based on plan interval
    if (plan.interval === "month") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.interval === "year") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // 6. Create or update subscription in database
    const subscription = await prisma.subscription.upsert({
      where: { userId: session.user.id },
      update: {
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: currentDate,
        currentPeriodEnd: endDate,
        cancelAtPeriodEnd: false,
      },
      create: {
        userId: session.user.id,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: currentDate,
        currentPeriodEnd: endDate,
        cancelAtPeriodEnd: false,
      },
    });

    // 7. Return success response
    return NextResponse.json(
      {
        message: "Subscription created successfully (offline mode)",
        data: {
          subscriptionId: subscription.id,
          plan: plan.name,
          price: plan.price,
          currency: plan.currency,
          interval: plan.interval,
          currentPeriodEnd: subscription.currentPeriodEnd,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}
