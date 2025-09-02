"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Footer from "@/app/components/ui/Footer";
import SkeletonLoader from "@/app/components/ui/SkeletonLoader";

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
  const [query, setQuery] = useState(searchParams.get("q") || "");
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
      const response = await fetch(`/api/movies/search?query=${encodeURIComponent(searchQuery)}&type=movie`);
      if (!response.ok) {
        throw new Error('Failed to search movies');
      }
      const data = await response.json();
      setMovies(data.data || []);
    } catch (err) {
      setError(
        "Failed to search movies. Please check your TMDb API configuration."
      );
      console.error("Search failed:", err);
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
    return path
      ? `https://image.tmdb.org/t/p/w500${path}`
      : "/placeholder-movie.jpg";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold mb-8 text-center" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Search Movies
          </h1>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-3 bg-gradient-to-r from-gray-800 to-gray-700 p-2 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-600">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for movies..."
                className="flex-1 px-6 py-4 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl transition-all duration-300 font-semibold text-white shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={loading}
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-8">
            <div className="text-center mb-8">
              <div className="text-xl font-semibold text-blue-400 mb-4">Searching movies...</div>
            </div>
            <SkeletonLoader count={12} type="movie-card" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="bg-red-900/30 border border-red-500/50 rounded-2xl p-8 max-w-md mx-auto">
              <div className="text-red-400 text-2xl mb-4">⚠️ Search Error</div>
              <div className="text-red-300 text-lg mb-2">{error}</div>
              <p className="text-red-200/70 text-sm">
                Make sure to set your TMDB_API_KEY environment variable.
              </p>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && query && movies.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-800/50 border border-gray-600/50 rounded-2xl p-8 max-w-md mx-auto">
              <div className="text-2xl text-gray-300 mb-4">🎭 No results found</div>
              <div className="text-xl text-gray-400 mb-2">
                No movies found for "{query}"
              </div>
              <p className="text-gray-500 text-sm">
                Try searching with different keywords
              </p>
            </div>
          </div>
        )}

        {/* Search Results */}
        {!loading && !error && movies.length > 0 && (
          <div className="animate-fade-in-up">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-center mb-2">
                <span style={{ background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  ✨ Found {movies.length} results for "{query}"
                </span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-400 mx-auto rounded-full"></div>
            </div>

            <div className="movie-grid">
              {movies.map((movie, index) => (
                <Link
                  key={movie.id}
                  href={`/details/${movie.id}`}
                  className="browse-movie-card animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="browse-movie-poster">
                    <img
                      src={getImageUrl(movie.poster_path)}
                      alt={movie.title}
                    />
                  </div>
                  <h3 className="browse-movie-title">{movie.title}</h3>
                  <div className="browse-movie-info">
                    <span>{movie.release_date?.split("-")[0] || "N/A"}</span>
                    <span>⭐ {movie.vote_average.toFixed(1)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Initial State */}
        {!query && !loading && (
          <div className="text-center py-20">
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-600/30 rounded-3xl p-12 max-w-lg mx-auto">
              <div className="text-6xl mb-6">🎬</div>
              <div className="text-gray-300 text-2xl mb-6 font-semibold">
                🔍 Search for your favorite movies
              </div>
              <p className="text-gray-400 text-lg">
                Enter a movie title in the search box above to discover amazing films
              </p>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
