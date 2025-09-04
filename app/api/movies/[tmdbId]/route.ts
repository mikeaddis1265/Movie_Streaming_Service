// app/api/movies/[tmdbId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { fetchMovieDetails, fetchMovieCredits, fetchMovieVideos, fetchMovieRecommendations } from '@/lib/tmdbapi';
import { authOptions } from '@/lib/auth';
import { MediaType } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tmdbId: string }> }
) {
  try {
    // 1. Await params first
    const { tmdbId } = await params;
    
    // 2. Get the session (user might be logged in or not)
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // 3. Fetch the movie details from TMDb
    const movieDetails = await fetchMovieDetails(tmdbId);

    // 3. Initialize variables for user-specific data
    let inWatchlist = false;
    let inFavorites = false;
    let userRating = null;
    let watchProgress = null;
    let hasActiveSubscription = false;
    
    // Determine if movie requires subscription (popular/recent movies require subscription)
    const requiresSubscription = (movieDetails.popularity && movieDetails.popularity > 50) || 
                                 new Date(movieDetails.release_date) > new Date('2020-01-01');

    // 4. If user is logged in, fetch their personal data from OUR database
    if (userId) {
      // Check if movie is in user's watchlist
      const watchlistItem = await prisma.watchlistItem.findUnique({
        where: {
          userId_tmdbId_mediaType: {
            userId,
            tmdbId: parseInt(tmdbId),
            mediaType: MediaType.MOVIE,
          }
        }
      });
      inWatchlist = !!watchlistItem;

      // Get user's rating
      const rating = await prisma.rating.findUnique({
        where: {
          userId_tmdbId_mediaType: {
            userId,
            tmdbId: parseInt(tmdbId),
            mediaType: MediaType.MOVIE,
          }
        }
      });
      userRating = rating?.value || null;

      // Get watch progress
      const history = await prisma.viewingHistory.findUnique({
        where: {
          userId_tmdbId_mediaType: {
            userId,
            tmdbId: parseInt(tmdbId),
            mediaType: MediaType.MOVIE,
          }
        }
      });
      watchProgress = history?.progress || null;

      // Get favorite status
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_tmdbId_mediaType: {
            userId,
            tmdbId: parseInt(tmdbId),
            mediaType: MediaType.MOVIE,
          }
        }
      });
      inFavorites = !!favorite;
      
      // Check user's subscription status with detailed logging
      console.log(`=== MOVIE API SUBSCRIPTION CHECK FOR USER ${userId} ===`);
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });
      
      console.log('Found subscription:', subscription ? {
        id: subscription.id,
        userId: subscription.userId,
        planId: subscription.planId,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
      } : null);
      
      const currentDate = new Date();
      hasActiveSubscription = !!(subscription && 
                                subscription.status === "ACTIVE" && 
                                subscription.currentPeriodEnd && 
                                subscription.currentPeriodEnd > currentDate);
      
      console.log('Current date:', currentDate.toISOString());
      console.log('Period end:', subscription?.currentPeriodEnd?.toISOString());
      console.log('Has active subscription:', hasActiveSubscription);
      console.log('Requires subscription:', requiresSubscription);
      console.log('Can watch:', !requiresSubscription || hasActiveSubscription);
      console.log('==============================================');
    }

    // 5. Fetch additional data from TMDb (in parallel for better performance)
    const [credits, videos, recommendations] = await Promise.allSettled([
      fetchMovieCredits(tmdbId),
      fetchMovieVideos(tmdbId),
      fetchMovieRecommendations(tmdbId),
    ]);

    // 6. Combine all the data into a single response
    const responseData = {
      ...movieDetails,
      credits: credits.status === 'fulfilled' ? credits.value : null,
      videos: videos.status === 'fulfilled' ? videos.value : null,
      recommendations: recommendations.status === 'fulfilled' ? recommendations.value.results : [],
      userData: {
        inWatchlist,
        inFavorites,
        userRating,
        watchProgress,
      },
      requiresSubscription,
      hasActiveSubscription,
      canWatch: !requiresSubscription || hasActiveSubscription
    };

    return NextResponse.json({ data: responseData });

  } catch (error) {
    console.error('Movie details API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie details' },
      { status: 500 }
    );
  }
}