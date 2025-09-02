// app/api/users/[id]/recommendations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { discoverMovies, fetchTrendingMovies } from "@/lib/tmdbapi";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // 1. Authentication and authorization check
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pagination & cache controls
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(
      parseInt(searchParams.get("pageSize") || "20"),
      50
    );
    const cacheBypass = searchParams.get("refresh") === "true";

    // 0. 6h TTL cache (in-memory, per process)
    // Note: In production, swap with Redis or KV.
    interface GlobalWithCache extends typeof globalThis {
      __recCache?: Map<string, { t: number; data: any }>;
    }
    const globalWithCache = globalThis as GlobalWithCache;
    globalWithCache.__recCache =
      globalWithCache.__recCache || new Map<string, { t: number; data: any }>();
    const cacheKey = `${id}:${page}:${pageSize}`;
    const cached = !cacheBypass ? globalWithCache.__recCache.get(cacheKey) : null;
    // 6h TTL
    if (cached && Date.now() - cached.t < 6 * 60 * 60 * 1000) {
      return NextResponse.json(cached.data);
    }

    // 2. Get user's preferences from database
    const [userWatchlist, userRatings, userHistory] = await Promise.all([
      prisma.watchlistItem.findMany({
        where: { userId: id },
        take: 50,
      }),
      prisma.rating.findMany({
        where: { userId: id, value: { gte: 4 } },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.viewingHistory.findMany({
        where: { userId: id },
        orderBy: { watchedAt: "desc" },
        take: 50,
      }),
    ]);

    // 3. Extract favorite genres and content IDs
    const favoriteTmdbIds = [
      ...userWatchlist.map((item) => item.tmdbId),
      ...userRatings.filter((r) => r.value >= 4).map((r) => r.tmdbId),
      ...userHistory.map((h) => h.tmdbId),
    ];

    // Compute genre weights from signals (simplified)
    // If you persist genres per item, use them. Otherwise, fallback to a default list.
    const preferredGenres = getPreferredGenres(userWatchlist, userRatings);

    // 4. Generate recommendations based on user preferences
    let recommendations: any[] = [];

    // Strategy 1: Based on favorite genres
    if (preferredGenres.length > 0) {
      try {
        const topGenres = preferredGenres.slice(0, 3).join(",");
        const genreRecommendations = await discoverMovies({
          with_genres: topGenres,
          page,
        } as any);
        recommendations.push(...genreRecommendations.results);
      } catch (error) {
        console.error("Genre-based recommendations failed:", error);
      }
    }

    // Strategy 2: Trending movies as fallback
    if (recommendations.length < 10) {
      try {
        const trending = await fetchTrendingMovies();
        recommendations.push(...trending.results);
      } catch (error) {
        console.error("Trending recommendations failed:", error);
      }
    }

    // Strategy 3: Remove already watched/rated content
    recommendations = recommendations.filter(
      (movie) => !favoriteTmdbIds.includes(movie.id)
    );

    // 4. Remove duplicates and limit results
    // De-dup & diversify (re-rank by alternating popularity and recency)
    const unique = Array.from(
      new Map(recommendations.map((item) => [item.id, item])).values()
    );
    const popular = [...unique].sort(
      (a, b) => (b.popularity || 0) - (a.popularity || 0)
    );
    const recent = [...unique].sort((a, b) => {
      const ad = Date.parse(a.release_date || a.first_air_date || "1970-01-01");
      const bd = Date.parse(b.release_date || b.first_air_date || "1970-01-01");
      return bd - ad;
    });
    const interleaved: any[] = [];
    for (let i = 0; i < Math.max(popular.length, recent.length); i++) {
      if (popular[i]) interleaved.push(popular[i]);
      if (recent[i]) interleaved.push(recent[i]);
      if (interleaved.length >= pageSize) break;
    }
    const uniqueRecommendations = Array.from(
      new Map(interleaved.map((i) => [i.id, i])).values()
    ).slice(0, pageSize);

    // 5. Return recommendations
    const response = {
      data: {
        recommendations: uniqueRecommendations,
        pagination: { page, pageSize },
        basedOn: {
          watchlistCount: userWatchlist.length,
          ratingsCount: userRatings.length,
          historyCount: userHistory.length,
          preferredGenres: preferredGenres.slice(0, 5),
          fallback:
            uniqueRecommendations.length < pageSize ? "trending" : undefined,
        },
        generatedAt: new Date().toISOString(),
      },
    };

    // Cache response
    globalWithCache.__recCache!.set(cacheKey, { t: Date.now(), data: response });
    return NextResponse.json(response);
  } catch (error) {
    console.error("Recommendations error:", error);

    // Fallback to trending movies if personalized recommendations fail
    try {
      const trending = await fetchTrendingMovies();
      return NextResponse.json({
        data: {
          recommendations: trending.results.slice(0, 20),
          basedOn: { fallback: "trending" },
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (fallbackError) {
      return NextResponse.json(
        { error: "Failed to generate recommendations" },
        { status: 500 }
      );
    }
  }
}

// Helper function to determine preferred genres (simplified)
function getPreferredGenres(watchlist: any[], ratings: any[]): number[] {
  // This is a simplified implementation
  // In a real app, you'd fetch genre data from TMDb and analyze user preferences

  // Common genre IDs: 28=Action, 12=Adventure, 16=Animation, 35=Comedy, 80=Crime,
  // 99=Documentary, 18=Drama, 10751=Family, 14=Fantasy, 36=History, 27=Horror,
  // 10402=Music, 9648=Mystery, 10749=Romance, 878=Sci-Fi, 10770=TV Movie,
  // 53=Thriller, 10752=War, 37=Western

  const defaultGenres = [28, 12, 35, 18, 10749]; // Action, Adventure, Comedy, Drama, Romance

  // Analyze user preferences to override defaults
  const userGenrePreferences: number[] = [
    // Add logic to analyze user watchlist and ratings
  ];

  return userGenrePreferences.length > 0 ? userGenrePreferences : defaultGenres;
}
