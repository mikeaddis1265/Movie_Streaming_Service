// app/api/movies/[tmdbId]/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { MediaType } from '@prisma/client';

// POST - Create a new review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tmdbId: string }> }
) {
  try {
    const { tmdbId } = await params;
    
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user is restricted
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isRestricted: true, restrictedUntil: true }
    });

    if (user?.isRestricted && user.restrictedUntil && new Date() < user.restrictedUntil) {
      return NextResponse.json(
        { error: 'Your account is currently restricted. You cannot post reviews.' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { content, title, rating, mediaType = 'MOVIE' } = body;

    // Validate input
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Review content is required' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Review content must be less than 1000 characters' },
        { status: 400 }
      );
    }

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (mediaType !== 'MOVIE' && mediaType !== 'TV') {
      return NextResponse.json(
        { error: 'mediaType must be either MOVIE or TV' },
        { status: 400 }
      );
    }

    // Create or update the review
    const review = await prisma.review.upsert({
      where: {
        userId_tmdbId_mediaType: {
          userId: session.user.id,
          tmdbId: parseInt(tmdbId),
          mediaType: mediaType as MediaType,
        }
      },
      update: {
        content: content.trim(),
        title: title?.trim() || null,
        rating: rating || null,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        tmdbId: parseInt(tmdbId),
        mediaType: mediaType as MediaType,
        content: content.trim(),
        title: title?.trim() || null,
        rating: rating || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Review submitted successfully',
      data: review
    }, { status: 201 });

  } catch (error) {
    console.error('Submit review error:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

// GET - Get all reviews for a movie/TV show
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tmdbId: string }> }
) {
  try {
    const { tmdbId } = await params;
    
    const { searchParams } = new URL(request.url);
    const mediaType = searchParams.get('mediaType') || 'MOVIE';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Validate input
    if (mediaType !== 'MOVIE' && mediaType !== 'TV') {
      return NextResponse.json(
        { error: 'mediaType must be either MOVIE or TV' },
        { status: 400 }
      );
    }

    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const validSortFields = ['createdAt', 'updatedAt', 'rating'];
    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json(
        { error: 'Invalid sort field' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * limit;

    // Get reviews with pagination
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: {
          tmdbId: parseInt(tmdbId),
          mediaType: mediaType as MediaType,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder as 'asc' | 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          tmdbId: parseInt(tmdbId),
          mediaType: mediaType as MediaType,
        }
      })
    ]);

    // Calculate average rating if reviews have ratings
    const reviewsWithRatings = reviews.filter(review => review.rating !== null);
    const averageRating = reviewsWithRatings.length > 0
      ? reviewsWithRatings.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewsWithRatings.length
      : null;

    return NextResponse.json({
      data: {
        reviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalReviews: totalCount,
          hasNextPage: page * limit < totalCount,
          hasPreviousPage: page > 1,
        },
        averageRating,
        totalRatings: reviewsWithRatings.length,
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to get reviews' },
      { status: 500 }
    );
  }
}