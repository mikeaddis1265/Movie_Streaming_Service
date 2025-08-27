// app/api/movies/browse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { discoverMovies } from '@/lib/tmdbapi';

export async function GET(request: NextRequest) {
  try {
    // 1. Get filter parameters from the URL
    const { searchParams } = new URL(request.url);
    const genreId = searchParams.get('with_genres');
    const year = searchParams.get('primary_release_year');
    const page = searchParams.get('page') || '1';

    // 2. Build parameters for TMDb API
    const params: any = { page };
    if (genreId) params.with_genres = genreId;
    if (year) params.primary_release_year = year;

    // 3. Fetch filtered movies from TMDb
    const movieData = await discoverMovies(params);

    // 4. Return the results
    return NextResponse.json({
      data: movieData.results,
      pagination: {
        page: movieData.page,
        totalPages: movieData.total_pages,
        totalResults: movieData.total_results,
      }
    });

  } catch (error) {
    console.error('Browse movies API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}