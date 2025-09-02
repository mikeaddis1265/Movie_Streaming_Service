import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { MediaType } from "@prisma/client";
import { fetchMovieDetails } from "@/lib/tmdbapi";

// GET favorites list
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: id },
      orderBy: { addedAt: "desc" },
    });

    // If no favorites, return empty array
    if (favorites.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Try to fetch movie details from TMDB, but don't fail if it doesn't work
    const favoritesWithDetails = await Promise.all(
      favorites.map(async (favorite) => {
        try {
          const movieDetails = await fetchMovieDetails(favorite.tmdbId.toString());
          return {
            id: movieDetails.id,
            title: movieDetails.title,
            overview: movieDetails.overview,
            poster_path: movieDetails.poster_path,
            vote_average: movieDetails.vote_average,
            release_date: movieDetails.release_date,
            addedAt: favorite.addedAt,
          };
        } catch (error) {
          console.error(`Failed to fetch details for TMDB ID ${favorite.tmdbId}:`, error);
          // Return a fallback object with basic info
          return {
            id: favorite.tmdbId,
            title: `Movie ${favorite.tmdbId}`,
            overview: "Movie details unavailable",
            poster_path: null,
            vote_average: 0,
            release_date: "",
            addedAt: favorite.addedAt,
          };
        }
      })
    );

    // Filter out any null results and return
    const validFavorites = favoritesWithDetails.filter(item => item !== null);
    return NextResponse.json({ data: validFavorites });
    
  } catch (error) {
    console.error("Favorites GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST add favorite
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tmdbId, mediaType } = body as {
      tmdbId?: number | string;
      mediaType?: string;
    };

    if (tmdbId === undefined || !mediaType) {
      return NextResponse.json(
        { error: "tmdbId and mediaType are required" },
        { status: 400 }
      );
    }

    const tmdbIdNum =
      typeof tmdbId === "string" ? parseInt(tmdbId, 10) : tmdbId;
    if (!Number.isFinite(tmdbIdNum)) {
      return NextResponse.json(
        { error: "tmdbId must be a number" },
        { status: 400 }
      );
    }

    const upper = mediaType.toUpperCase();
    if (upper !== "MOVIE" && upper !== "TV") {
      return NextResponse.json(
        { error: "mediaType must be MOVIE or TV" },
        { status: 400 }
      );
    }

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_tmdbId_mediaType: {
          userId: id,
          tmdbId: tmdbIdNum,
          mediaType: upper as MediaType,
        },
      },
      update: {},
      create: {
        userId: id,
        tmdbId: tmdbIdNum,
        mediaType: upper as MediaType,
      },
    });

    return NextResponse.json(
      { message: "Added to favorites", data: favorite },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Favorites POST error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Already in favorites" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
