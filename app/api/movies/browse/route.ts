// app/api/movies/browse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { discoverMovies, discoverTV } from '@/lib/tmdbapi';

export async function GET(request: NextRequest) {
  try {
    // 1. Get filter parameters from the URL
    const { searchParams } = new URL(request.url);
    const genreId = searchParams.get('with_genres');
    const year = searchParams.get('primary_release_year');
    const tvYear = searchParams.get('first_air_date_year');
    const country = searchParams.get('with_origin_country');
    const page = searchParams.get('page') || '1';
    const type = searchParams.get('type') || 'movie';

    // 2. Build parameters for TMDb API
    const params: any = { page };
    if (genreId) params.with_genres = genreId;
    if (country) params.with_origin_country = country;
    if (type === 'tv') {
      if (tvYear) params.first_air_date_year = tvYear;
      const tvData = await discoverTV(params);
      return NextResponse.json({
        data: tvData.results,
        pagination: {
          page: tvData.page,
          totalPages: tvData.total_pages,
          totalResults: tvData.total_results,
        }
      });
    } else {
      if (year) params.primary_release_year = year;
      const movieData = await discoverMovies(params);
      return NextResponse.json({
        data: movieData.results,
        pagination: {
          page: movieData.page,
          totalPages: movieData.total_pages,
          totalResults: movieData.total_results,
        }
      });
    }

  } catch (error) {
    console.error('Browse movies API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}