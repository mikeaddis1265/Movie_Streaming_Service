import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tmdbId, mediaType, progress = 0, season = null, episode = null } = body;

    if (!tmdbId || !mediaType) {
      return NextResponse.json(
        { error: "tmdbId and mediaType are required" }, 
        { status: 400 }
      );
    }

    // Create or update viewing history
    const viewingHistory = await prisma.viewingHistory.upsert({
      where: {
        userId_tmdbId_mediaType: {
          userId: id,
          tmdbId: parseInt(tmdbId),
          mediaType: mediaType.toUpperCase(),
        },
      },
      update: {
        progress,
        season,
        episode,
        watchedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        userId: id,
        tmdbId: parseInt(tmdbId),
        mediaType: mediaType.toUpperCase(),
        progress,
        season,
        episode,
        watchedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: viewingHistory,
      message: "Added to viewing history"
    });

  } catch (error) {
    console.error("Viewing history error:", error);
    return NextResponse.json(
      { error: "Failed to update viewing history" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const viewingHistory = await prisma.viewingHistory.findMany({
      where: { userId: id },
      orderBy: { watchedAt: 'desc' },
      take: 20, // Limit to last 20 items
    });

    return NextResponse.json({
      success: true,
      data: viewingHistory
    });

  } catch (error) {
    console.error("Get viewing history error:", error);
    return NextResponse.json(
      { error: "Failed to get viewing history" },
      { status: 500 }
    );
  }
}