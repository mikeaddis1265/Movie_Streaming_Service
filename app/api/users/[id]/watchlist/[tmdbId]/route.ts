// app/api/users/[id]/watchlist/[tmdbId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { MediaType } from '@prisma/client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tmdbId: string }> }
) {
  try {
    // 1. Await params first
    const { id, tmdbId } = await params;
    
    // 2. Authentication and authorization check
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Get mediaType from query parameters
    const { searchParams } = new URL(request.url);
    const mediaType = searchParams.get('mediaType');
    
    if (!mediaType || (mediaType !== 'movie' && mediaType !== 'tv')) {
      return NextResponse.json(
        { error: 'mediaType parameter is required and must be "movie" or "tv"' },
        { status: 400 }
      );
    }

    // 3. Delete the watchlist item from database
    await prisma.watchlistItem.delete({
      where: {
        userId_tmdbId_mediaType: {
          userId: id,
          tmdbId: parseInt(tmdbId),
          mediaType: mediaType.toUpperCase() as MediaType,
        }
      }
    });

    // 4. Return success response
    return NextResponse.json({
      message: 'Removed from watchlist successfully',
      data: { tmdbId, mediaType }
    });

  } catch (error: any) {
    console.error('Delete watchlist error:', error);
    
    // Handle specific error cases
    if (error.code === 'P2025') {
      // Record not found
      return NextResponse.json(
        { error: 'Item not found in watchlist' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 