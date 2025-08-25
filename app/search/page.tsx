"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { searchMovies } from "@/lib/tmdbapi";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setMovies([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchMovies(searchQuery);
      setMovies(results.results);
    } catch (err) {
      setError('Failed to search movies. Please check your TMDb API configuration.');
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  const getImageUrl = (path: string) => {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : '/placeholder-movie.jpg';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mb-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Search Movies</h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for movies..."
                className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="text-xl">Searching movies...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <div className="text-red-500 text-xl mb-2">{error}</div>
            <p className="text-gray-400">
              Make sure to set your TMDB_API_KEY environment variable.
            </p>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && query && movies.length === 0 && (
          <div className="text-center py-8">
            <div className="text-xl text-gray-400 mb-2">No movies found for "{query}"</div>
            <p className="text-gray-500">Try searching with different keywords</p>
          </div>
        )}

        {/* Search Results */}
        {!loading && !error && movies.length > 0 && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                Found {movies.length} results for "{query}"
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/details/${movie.id}`}
                  className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors duration-200 group"
                >
                  <div className="aspect-[2/3] relative overflow-hidden">
                    <img
                      src={getImageUrl(movie.poster_path)}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                      {movie.title}
                    </h3>
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
                      <span className="flex items-center">
                        ⭐ {movie.vote_average.toFixed(1)}
                      </span>
                    </div>
                    {movie.overview && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-3">
                        {movie.overview}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Initial State */}
        {!query && !loading && (
          <div className="text-center py-16">
            <div className="text-gray-400 text-lg mb-4">
              🔍 Search for your favorite movies
            </div>
            <p className="text-gray-500">
              Enter a movie title in the search box above to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}