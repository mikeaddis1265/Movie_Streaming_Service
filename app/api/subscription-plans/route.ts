import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all active plans - public endpoint
export async function GET(request: NextRequest) {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true
      },
      orderBy: { 
        price: "asc" 
      },
    });

    // If no plans exist in database, return default plans
    if (plans.length === 0) {
      const defaultPlans = [
        {
          id: '1',
          name: 'Basic',
          price: 9.99,
          currency: 'USD',
          interval: 'month',
          features: [
            'HD Quality',
            '2 Devices',
            'Mobile & Tablet Access',
            'Basic Movie Library'
          ],
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Premium',
          price: 15.99,
          currency: 'USD',
          interval: 'month',
          features: [
            '4K Ultra HD',
            '4 Devices',
            'All Device Access',
            'Full Movie Library',
            'Early Access',
            'No Ads'
          ],
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Family',
          price: 19.99,
          currency: 'USD',
          interval: 'month',
          features: [
            '4K Ultra HD',
            '6 Devices',
            'All Device Access',
            'Full Movie Library',
            'Family Profiles',
            'Parental Controls',
            'No Ads'
          ],
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];

      return NextResponse.json({ 
        success: true,
        data: defaultPlans 
      });
    }

    return NextResponse.json({ 
      success: true,
      data: plans 
    });

  } catch (error) {
    console.error('Subscription plans API error:', error);
    
    // Fallback to default plans on any error
    const defaultPlans = [
      {
        id: '1',
        name: 'Basic',
        price: 9.99,
        currency: 'USD',
        interval: 'month',
        features: [
          'HD Quality',
          '2 Devices',
          'Mobile & Tablet Access',
          'Basic Movie Library'
        ],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Premium',
        price: 15.99,
        currency: 'USD',
        interval: 'month',
        features: [
          '4K Ultra HD',
          '4 Devices',
          'All Device Access',
          'Full Movie Library',
          'Early Access',
          'No Ads'
        ],
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'Family',
        price: 19.99,
        currency: 'USD',
        interval: 'month',
        features: [
          '4K Ultra HD',
          '6 Devices',
          'All Device Access',
          'Full Movie Library',
          'Family Profiles',
          'Parental Controls',
          'No Ads'
        ],
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];

    return NextResponse.json({ 
      success: true,
      data: defaultPlans 
    });
  } finally {
    await prisma.$disconnect();
  }
}