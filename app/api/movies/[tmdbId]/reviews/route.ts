// app/api/movies/[tmdbId]/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { MediaType } from '@prisma/client';

// POST - Submit a review
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
    const { title, content, rating, mediaType = 'MOVIE' } = body;

    // 4. Validate input
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    if (mediaType !== 'MOVIE' && mediaType !== 'TV') {
      return NextResponse.json(
        { error: 'mediaType must be either MOVIE or TV' },
        { status: 400 }
      );
    }

    // 5. Create the review
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        tmdbId: parseInt(tmdbId),
        mediaType: mediaType as MediaType,
        title,
        content,
        rating: rating ? Math.round(rating) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    });

    // 5. Return success response
    return NextResponse.json({
      message: 'Review submitted successfully',
      data: review
    }, { status: 201 });

  } catch (error: any) {
    console.error('Submit review error:', error);
    
    // Handle duplicate review error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'You have already reviewed this content' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}

// GET - Get reviews for a movie
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tmdbId: string }> }
) {
  try {
    // 1. Await params first
    const { tmdbId } = await params;
    
    const { searchParams } = new URL(request.url);
    const mediaType = searchParams.get('mediaType') || 'MOVIE';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // 2. Get reviews with pagination
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
              image: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
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

    // 2. Return paginated response
    return NextResponse.json({
      data: reviews,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
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