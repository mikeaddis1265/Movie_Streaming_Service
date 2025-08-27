// app/api/movies/[tmdbId]/rating/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { MediaType } from '@prisma/client';

// POST - Submit a rating
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tmdbId: string }> }
) {
  try {
    // 1. Await params first
    const { tmdbId } = await params;
    
    // 2. Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const { value, mediaType = 'MOVIE' } = body;

    // 4. Validate input
    if (value === undefined || value < 1 || value > 5) {
      return NextResponse.json(
        { error: 'Rating value must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (mediaType !== 'MOVIE' && mediaType !== 'TV') {
      return NextResponse.json(
        { error: 'mediaType must be either MOVIE or TV' },
        { status: 400 }
      );
    }

    // 5. Upsert the rating (create or update)
    const rating = await prisma.rating.upsert({
      where: {
        userId_tmdbId_mediaType: {
          userId: session.user.id,
          tmdbId: parseInt(tmdbId),
          mediaType: mediaType as MediaType,
        }
      },
      update: {
        value: Math.round(value), // Ensure integer rating
      },
      create: {
        userId: session.user.id,
        tmdbId: parseInt(tmdbId),
        mediaType: mediaType as MediaType,
        value: Math.round(value),
      },
    });

    // 5. Return success response
    return NextResponse.json({
      message: 'Rating submitted successfully',
      data: rating
    }, { status: 200 });

  } catch (error) {
    console.error('Submit rating error:', error);
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    );
  }
}

// GET - Get ratings for a movie (average and user's rating)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tmdbId: string }> }
) {
  try {
    // 1. Await params first
    const { tmdbId } = await params;
    
    const { searchParams } = new URL(request.url);
    const mediaType = searchParams.get('mediaType') || 'MOVIE';

    // 2. Get average rating and total count
    const aggregate = await prisma.rating.aggregate({
      where: {
        tmdbId: parseInt(tmdbId),
        mediaType: mediaType as MediaType,
      },
      _avg: { value: true },
      _count: { value: true },
    });

    // 3. Get current user's rating if authenticated
    const session = await getServerSession(authOptions);
    let userRating = null;

    if (session?.user?.id) {
      const userRatingRecord = await prisma.rating.findUnique({
        where: {
          userId_tmdbId_mediaType: {
            userId: session.user.id,
            tmdbId: parseInt(tmdbId),
            mediaType: mediaType as MediaType,
          }
        }
      });
      userRating = userRatingRecord?.value || null;
    }

    // 3. Return ratings data
    return NextResponse.json({
      data: {
        averageRating: aggregate._avg.value,
        totalRatings: aggregate._count.value,
        userRating,
      }
    });

  } catch (error) {
    console.error('Get ratings error:', error);
    return NextResponse.json(
      { error: 'Failed to get ratings' },
      { status: 500 }
    );
  }
}