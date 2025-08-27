// app/api/users/[id]/settings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication and authorization check
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== params.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { language, quality, autoplay } = body;

    // 3. Validate input
    const validLanguages = ['en', 'es', 'fr', 'de', 'it']; // Add more as needed
    const validQualities = ['sd', 'hd', '4k'];

    if (language && !validLanguages.includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language setting' },
        { status: 400 }
      );
    }

    if (quality && !validQualities.includes(quality)) {
      return NextResponse.json(
        { error: 'Invalid quality setting' },
        { status: 400 }
      );
    }

    // 4. Update user settings (upsert pattern)
    const updatedSettings = await prisma.userSettings.upsert({
      where: { userId: params.id },
      update: {
        ...(language && { language }),
        ...(quality && { quality }),
        ...(autoplay !== undefined && { autoplay }),
      },
      create: {
        userId: params.id,
        language: language || 'en',
        quality: quality || 'hd',
        autoplay: autoplay !== undefined ? autoplay : true,
      },
    });

    // 5. Return success response
    return NextResponse.json({
      message: 'Settings updated successfully',
      data: updatedSettings
    });

  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// GET - Get user settings
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== params.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user settings
    const settings = await prisma.userSettings.findUnique({
      where: { userId: params.id },
    });

    // Return default settings if none exist
    const defaultSettings = {
      language: 'en',
      quality: 'hd',
      autoplay: true,
    };

    return NextResponse.json({
      data: settings || defaultSettings
    });

  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to get settings' },
      { status: 500 }
    );
  }
}