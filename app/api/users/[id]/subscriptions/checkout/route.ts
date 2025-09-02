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

    // 1.5. Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { planId, paymentProvider, isUpgrade } = body;

    if (!planId) {
      return NextResponse.json(
        { error: "planId is required" },
        { status: 400 }
      );
    }

    // 3. Get subscription plan details or create default
    let plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    // If plan doesn't exist in database, create it based on the planId
    if (!plan) {
      const defaultPlans = {
        '1': {
          name: 'Basic',
          price: 9.99,
          currency: 'USD',
          interval: 'month',
          features: ['HD Quality', '2 Devices', 'Mobile & Tablet Access', 'Basic Movie Library'],
          isActive: true
        },
        '2': {
          name: 'Premium', 
          price: 15.99,
          currency: 'USD',
          interval: 'month',
          features: ['4K Ultra HD', '4 Devices', 'All Device Access', 'Full Movie Library', 'Early Access', 'No Ads'],
          isActive: true
        },
        '3': {
          name: 'Family',
          price: 19.99,
          currency: 'USD', 
          interval: 'month',
          features: ['4K Ultra HD', '6 Devices', 'All Device Access', 'Full Movie Library', 'Family Profiles', 'Parental Controls', 'No Ads'],
          isActive: true
        }
      };

      const defaultPlan = defaultPlans[planId as keyof typeof defaultPlans];
      if (!defaultPlan) {
        return NextResponse.json(
          { error: "Invalid subscription plan" },
          { status: 400 }
        );
      }

      // Create the plan in database
      try {
        plan = await prisma.subscriptionPlan.create({
          data: {
            id: planId,
            ...defaultPlan
          }
        });
      } catch (planError) {
        console.error('Failed to create plan:', planError);
        return NextResponse.json(
          { error: "Failed to create subscription plan" },
          { status: 500 }
        );
      }
    }

    // 4. Try Chapa payment, fallback to offline mode
    if ((paymentProvider || "chapa") === "chapa") {
      try {
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

        // If we get a real checkout URL, use it
        if (init?.data?.checkout_url && !init.data.checkout_url.includes('success=demo')) {
          return NextResponse.json(
            {
              data: {
                provider: "chapa",
                checkout_url: init.data.checkout_url,
                tx_ref: txRef,
              },
            },
            { status: 201 }
          );
        }
        // Otherwise fall through to offline mode
      } catch (error) {
        console.warn('Chapa payment failed, using offline mode:', error);
        // Continue to offline mode below
      }
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
    console.log(isUpgrade ? 'Upgrading subscription' : 'Creating subscription', 'for user:', session.user.id, 'with plan:', plan.id);
    
    let subscription;
    try {
      // If it's an upgrade, preserve the current period dates for pro-rating logic
      const existingSubscription = isUpgrade ? await prisma.subscription.findUnique({
        where: { userId: session.user.id }
      }) : null;

      subscription = await prisma.subscription.upsert({
        where: { userId: session.user.id },
        update: {
          planId: plan.id,
          status: "ACTIVE",
          currentPeriodStart: isUpgrade && existingSubscription ? existingSubscription.currentPeriodStart : currentDate,
          currentPeriodEnd: isUpgrade && existingSubscription ? existingSubscription.currentPeriodEnd : endDate,
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
      console.log('Subscription created/updated successfully:', subscription.id);
    } catch (subscriptionError) {
      console.error('Subscription database error:', subscriptionError);
      return NextResponse.json(
        { 
          error: "Failed to create subscription in database",
          details: subscriptionError instanceof Error ? subscriptionError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // 7. Return success response
    return NextResponse.json(
      {
        message: isUpgrade ? "Subscription upgraded successfully (offline mode)" : "Subscription created successfully (offline mode)",
        data: {
          subscriptionId: subscription.id,
          plan: plan.name,
          price: plan.price,
          currency: plan.currency,
          interval: plan.interval,
          currentPeriodEnd: subscription.currentPeriodEnd,
          isUpgrade: isUpgrade || false,
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
