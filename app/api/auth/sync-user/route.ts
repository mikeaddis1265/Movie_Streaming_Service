import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No authenticated session found' },
        { status: 401 }
      );
    }

    // Check if user exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'User already exists in database',
        userId: existingUser.id
      });
    }

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        email: session.user.email,
        name: session.user.name || '',
        image: session.user.image || null,
        emailVerified: new Date(),
        role: 'USER'
      }
    });

    console.log('Synced OAuth user to database:', newUser.id);

    return NextResponse.json({
      success: true,
      message: 'User synced to database successfully',
      userId: newUser.id
    });

  } catch (error) {
    console.error('Error syncing user to database:', error);
    return NextResponse.json(
      { error: 'Failed to sync user to database' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}