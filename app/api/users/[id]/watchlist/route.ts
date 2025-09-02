// app/api/users/[id]/watchlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next"; // For authentication
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { fetchMovieDetails } from "@/lib/tmdbapi";

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
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // 2. Get data from the request body
    const body = await request.json();
    const { tmdbId, mediaType } = body; // e.g., { tmdbId: 550, mediaType: 'movie' }

    if (!tmdbId || !mediaType) {
      return new NextResponse(
        JSON.stringify({ error: "Missing tmdbId or mediaType" }),
        { status: 400 }
      );
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
    return NextResponse.json(
      {
        message: "Added to watchlist",
        data: watchlistItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Watchlist API Error:", error);
    // If it's a duplicate, Prisma will throw an error. Let's handle it nicely.
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
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
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    // Use Prisma to find all watchlist items for this user
    const watchlist = await prisma.watchlistItem.findMany({
      where: { userId: id },
      orderBy: { addedAt: "desc" }, // Show newest first
    });

    // If no watchlist items, return empty array
    if (watchlist.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Try to fetch movie details from TMDB, but don't fail if it doesn't work
    const watchlistWithDetails = await Promise.all(
      watchlist.map(async (item) => {
        try {
          const movieDetails = await fetchMovieDetails(item.tmdbId.toString());
          return {
            id: movieDetails.id,
            title: movieDetails.title,
            overview: movieDetails.overview,
            poster_path: movieDetails.poster_path,
            vote_average: movieDetails.vote_average,
            release_date: movieDetails.release_date,
            addedAt: item.addedAt,
          };
        } catch (error) {
          console.error(`Failed to fetch details for TMDB ID ${item.tmdbId}:`, error);
          // Return a fallback object with basic info
          return {
            id: item.tmdbId,
            title: `Movie ${item.tmdbId}`,
            overview: "Movie details unavailable",
            poster_path: null,
            vote_average: 0,
            release_date: "",
            addedAt: item.addedAt,
          };
        }
      })
    );

    // Filter out any null results and return
    const validWatchlist = watchlistWithDetails.filter(item => item !== null);
    return NextResponse.json({ data: validWatchlist });
  } catch (error) {
    console.error("Watchlist GET Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}

// DELETE - Clear all or bulk remove items from watchlist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== id) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { searchParams } = new URL(request.url);
    const clearAll = searchParams.get("all") === "true";

    if (clearAll) {
      await prisma.watchlistItem.deleteMany({ where: { userId: id } });
      return NextResponse.json({ message: "Watchlist cleared" });
    }

    // Optional bulk removal via request body
    const body = await request.text();
    if (body) {
      try {
        const parsed = JSON.parse(body);
        const items: Array<{ tmdbId: number | string; mediaType: string }> =
          Array.isArray(parsed?.items) ? parsed.items : [];
        if (items.length === 0) {
          return NextResponse.json(
            { error: "No items provided" },
            { status: 400 }
          );
        }

        // Delete each composite key
        await Promise.all(
          items.map(async (it) => {
            const tmdbIdNum =
              typeof it.tmdbId === "string"
                ? parseInt(it.tmdbId, 10)
                : it.tmdbId;
            const upper = (it.mediaType || "").toUpperCase();
            if (
              !Number.isFinite(tmdbIdNum) ||
              (upper !== "MOVIE" && upper !== "TV")
            ) {
              return;
            }
            await prisma.watchlistItem
              .delete({
                where: {
                  userId_tmdbId_mediaType: {
                    userId: id,
                    tmdbId: tmdbIdNum as number,
                    mediaType: upper as any,
                  },
                },
              })
              .catch(() => {});
          })
        );

        return NextResponse.json({
          message: "Selected items removed from watchlist",
        });
      } catch {
        return NextResponse.json(
          { error: "Invalid request body" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Specify all=true or provide items[]" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Watchlist DELETE Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
