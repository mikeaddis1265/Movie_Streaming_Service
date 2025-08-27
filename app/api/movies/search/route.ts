// app/api/movies/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchMulti, searchMovies, searchTVShows } from '@/lib/tmdbapi';

export async function GET(request: NextRequest) {
  try {
    // 1. Get search parameters from the URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type') || 'multi'; // 'multi', 'movie', 'tv'
    const page = searchParams.get('page') || '1';
    const includeAdult = searchParams.get('include_adult') === 'true';

    // 2. Validate required parameters
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // 3. Build search parameters
    const searchOptions = {
      query: query.trim(),
      page: parseInt(page),
      include_adult: includeAdult,
    };

    // 4. Call the appropriate TMDb search function based on type
    let searchResults;
    switch (type) {
      case 'movie':
        searchResults = await searchMovies(searchOptions);
        break;
      case 'tv':
        searchResults = await searchTVShows(searchOptions);
        break;
      case 'multi':
      default:
        searchResults = await searchMulti(searchOptions);
        break;
    }

    // 5. Return formatted results
    return NextResponse.json({
      data: searchResults.results,
      pagination: {
        page: searchResults.page,
        totalPages: searchResults.total_pages,
        totalResults: searchResults.total_results,
      },
      searchQuery: query,
      searchType: type,
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Failed to search movies/TV shows' },
      { status: 500 }
    );
  }
}