// app/api/admin/movies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Admin auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { tmdbId, mediaType, featured, promoted, available } = body;

    // Create custom movie metadata in your database
    const customMovie = await prisma.customMovieMetadata.upsert({
      where: { tmdbId_mediaType: { tmdbId, mediaType } },
      update: { featured, promoted, available },
      create: { tmdbId, mediaType, featured, promoted, available },
    });

    return NextResponse.json({
      message: 'Movie metadata updated successfully',
      data: customMovie
    }, { status: 201 });

  } catch (error) {
    console.error('Admin movie update error:', error);
    return NextResponse.json(
      { error: 'Failed to update movie metadata' },
      { status: 500 }
    );
  }
}