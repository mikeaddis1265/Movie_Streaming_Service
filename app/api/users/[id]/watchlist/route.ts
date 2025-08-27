// app/api/users/[id]/watchlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next'; // For authentication
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth'; // We'll create this next

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Get the user ID from the URL
) {
  try {
    // 1. Await params first
    const { id } = await params;
    
    // 2. Check if the user is authenticated
    const session = await getServerSession(authOptions);
    // If no session OR if the logged-in user's ID doesn't match the URL, block them
    if (!session || session.user.id !== id) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // 2. Get data from the request body
    const body = await request.json();
    const { tmdbId, mediaType } = body; // e.g., { tmdbId: 550, mediaType: 'movie' }

    if (!tmdbId || !mediaType) {
      return new NextResponse(JSON.stringify({ error: 'Missing tmdbId or mediaType' }), { status: 400 });
    }

    // 3. Save to database using Prisma
    const watchlistItem = await prisma.watchlistItem.create({
      data: {
        tmdbId: tmdbId,
        mediaType: mediaType,
        userId: id, // The ID from the URL
      },
    });

    // 4. Return a success message
    return NextResponse.json({
      message: 'Added to watchlist',
      data: watchlistItem
    }, { status: 201 });

  } catch (error) {
    console.error('Watchlist API Error:', error);
    // If it's a duplicate, Prisma will throw an error. Let's handle it nicely.
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

// In the same file: app/api/users/[id]/watchlist/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Await params first
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== id) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Use Prisma to find all watchlist items for this user
    const watchlist = await prisma.watchlistItem.findMany({
      where: { userId: id },
      orderBy: { addedAt: 'desc' }, // Show newest first
    });

    return NextResponse.json({ data: watchlist });

  } catch (error) {
    console.error('Watchlist GET Error:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}