// app/api/users/[id]/continue-watching/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { fetchMovieDetails } from "@/lib/tmdbapi";
import { authOptions } from "@/lib/auth";
import { MediaType } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication check
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== params.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Get user's watch history from OUR database
    const history = await prisma.viewingHistory.findMany({
      where: { userId: params.id },
      orderBy: { watchedAt: "desc" },
      take: 10, // Get last 10 watched items
    });

    // 3. For each item, fetch the latest details from TMDb
    const continueWatching = await Promise.all(
      history.map(async (item) => {
        try {
          const details = await fetchMovieDetails(item.tmdbId.toString());
          return {
            ...details,
            progress: item.progress,
            lastWatched: item.watchedAt,
          };
        } catch (error) {
          console.error(
            `Failed to fetch details for TMDB ID ${item.tmdbId}:`,
            error
          );
          return null;
        }
      })
    );

    // 4. Filter out any failed requests and return
    const validItems = continueWatching.filter((item) => item !== null);
    return NextResponse.json({ data: validItems });
  } catch (error) {
    console.error("Continue watching API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch continue watching data" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication and authorization check
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== params.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse request body
    const body = await request.json();
    const { tmdbId, mediaType, progress, season, episode } = body;

    // 3. Validate required fields
    if (!tmdbId || !mediaType || progress === undefined) {
      return NextResponse.json(
        { error: "tmdbId, mediaType, and progress are required" },
        { status: 400 }
      );
    }

    if (mediaType !== "MOVIE" && mediaType !== "TV") {
      return NextResponse.json(
        { error: "mediaType must be either MOVIE or TV" },
        { status: 400 }
      );
    }

    // 4. Upsert the watch history (create or update)
    const watchHistory = await prisma.viewingHistory.upsert({
      where: {
        userId_tmdbId_mediaType: {
          userId: params.id,
          tmdbId: parseInt(tmdbId),
          mediaType: mediaType as MediaType,
        },
      },
      update: {
        progress,
        season: season || null,
        episode: episode || null,
        watchedAt: new Date(),
      },
      create: {
        userId: params.id,
        tmdbId: parseInt(tmdbId),
        mediaType: mediaType as MediaType,
        progress,
        season: season || null,
        episode: episode || null,
      },
    });

    // 5. Return success response
    return NextResponse.json(
      {
        message: "Playback progress saved successfully",
        data: watchHistory,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Save playback progress error:", error);
    return NextResponse.json(
      { error: "Failed to save playback progress" },
      { status: 500 }
    );
  }
}

// DELETE - Clear a single item or all continue-watching entries
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== params.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clearAll = searchParams.get("all") === "true";
    const tmdbIdParam = searchParams.get("tmdbId");
    const mediaTypeParam = (searchParams.get("mediaType") || '').toUpperCase();

    if (clearAll) {
      await prisma.viewingHistory.deleteMany({ where: { userId: params.id } });
      return NextResponse.json({ message: "Continue watching cleared" });
    }

    if (tmdbIdParam && (mediaTypeParam === 'MOVIE' || mediaTypeParam === 'TV')) {
      const tmdbId = parseInt(tmdbIdParam, 10);
      if (!Number.isFinite(tmdbId)) {
        return NextResponse.json({ error: "Invalid tmdbId" }, { status: 400 });
      }
      await prisma.viewingHistory.delete({
        where: {
          userId_tmdbId_mediaType: {
            userId: params.id,
            tmdbId,
            mediaType: mediaTypeParam as any,
          }
        }
      });
      return NextResponse.json({ message: "Entry removed" });
    }

    return NextResponse.json({ error: "Specify all=true or tmdbId & mediaType" }, { status: 400 });
  } catch (error: any) {
    console.error("Continue watching DELETE error:", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}