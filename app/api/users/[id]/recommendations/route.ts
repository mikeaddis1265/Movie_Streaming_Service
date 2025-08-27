// app/api/users/[id]/recommendations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { discoverMovies, fetchTrendingMovies } from '@/lib/tmdbapi';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication and authorization check
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== params.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Get user's preferences from database
    const [userWatchlist, userRatings, userHistory] = await Promise.all([
      prisma.watchlistItem.findMany({
        where: { userId: params.id },
        take: 20,
      }),
      prisma.rating.findMany({
        where: { userId: params.id },
        take: 20,
      }),
      prisma.watchHistory.findMany({
        where: { userId: params.id },
        take: 20,
      }),
    ]);

    // 3. Extract favorite genres and content IDs
    const favoriteTmdbIds = [
      ...userWatchlist.map(item => item.tmdbId),
      ...userRatings.filter(r => r.value >= 4).map(r => r.tmdbId),
      ...userHistory.map(h => h.tmdbId),
    ];

    // For a real implementation, you'd analyze genres from TMDb API
    // This is a simplified version using hardcoded genre mapping
    const preferredGenres = getPreferredGenres(userWatchlist, userRatings);

    // 4. Generate recommendations based on user preferences
    let recommendations: any[] = [];

    // Strategy 1: Based on favorite genres
    if (preferredGenres.length > 0) {
      try {
        const genreRecommendations = await discoverMovies({
          with_genres: preferredGenmes.slice(0, 2).join(','),
          sort_by: 'popularity.desc',
          page: '1'
        });
        recommendations.push(...genreRecommendations.results);
      } catch (error) {
        console.error('Genre-based recommendations failed:', error);
      }
    }

    // Strategy 2: Trending movies as fallback
    if (recommendations.length < 10) {
      try {
        const trending = await fetchTrendingMovies();
        recommendations.push(...trending.results);
      } catch (error) {
        console.error('Trending recommendations failed:', error);
      }
    }

    // Strategy 3: Remove already watched/rated content
    recommendations = recommendations.filter(movie => 
      !favoriteTmdbIds.includes(movie.id)
    );

    // 4. Remove duplicates and limit results
    const uniqueRecommendations = Array.from(
      new Map(recommendations.map(item => [item.id, item])).values()
    ).slice(0, 20);

    // 5. Return recommendations
    return NextResponse.json({
      data: {
        recommendations: uniqueRecommendations,
        basedOn: {
          watchlistCount: userWatchlist.length,
          ratingsCount: userRatings.length,
          historyCount: userHistory.length,
          preferredGenres: preferredGenres.slice(0, 3),
        },
        generatedAt: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    
    // Fallback to trending movies if personalized recommendations fail
    try {
      const trending = await fetchTrendingMovies();
      return NextResponse.json({
        data: {
          recommendations: trending.results.slice(0, 20),
          basedOn: { fallback: 'trending' },
          generatedAt: new Date().toISOString(),
        }
      });
    } catch (fallbackError) {
      return NextResponse.json(
        { error: 'Failed to generate recommendations' },
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
  const userGenrePreferences = [
    // Add logic to analyze user watchlist and ratings
  ];

  return userGenrePreferences.length > 0 ? userGenrePreferences : defaultGenres;
}