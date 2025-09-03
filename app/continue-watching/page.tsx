"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ContinueWatchingItem {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  progress?: number;
  lastWatched?: string;
  duration?: number;
}

export default function ContinueWatchingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
      return;
    }

    if (session?.user?.id) {
      loadContinueWatching();
    }
  }, [session, status, router]);

  const loadContinueWatching = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/users/${session.user.id}/continue-watching`, {
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Failed to load continue watching");
      }

      const data = await response.json();
      setContinueWatching(data.data || []);
    } catch (err) {
      console.error("Failed to load continue watching:", err);
      setError("Failed to load your continue watching list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeFromContinueWatching = async (movieId: number) => {
    if (!session?.user?.id || removingIds.has(movieId)) return;

    try {
      setRemovingIds(prev => new Set(prev).add(movieId));

      const response = await fetch(
        `/api/users/${session.user.id}/continue-watching`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tmdbId: movieId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove from continue watching");
      }

      // Remove from local state
      setContinueWatching(prev => prev.filter(movie => movie.id !== movieId));
    } catch (err) {
      console.error("Failed to remove from continue watching:", err);
      // You could show a toast notification here
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(movieId);
        return newSet;
      });
    }
  };

  const getImageUrl = (path: string) => {
    return path
      ? `https://image.tmdb.org/t/p/w500${path}`
      : "/placeholder-movie.jpg";
  };

  const formatProgress = (progress: number, duration?: number) => {
    if (!duration) return `${Math.round(progress / 60)} min watched`;
    
    const progressPercent = Math.min((progress / duration) * 100, 100);
    const remainingMinutes = Math.max(0, Math.round((duration - progress) / 60));
    
    return {
      percent: progressPercent,
      remaining: remainingMinutes > 0 ? `${remainingMinutes} min left` : "Finished"
    };
  };

  const getProgressBarWidth = (progress: number, duration?: number) => {
    if (!duration) return "30%";
    return `${Math.min((progress / duration) * 100, 100)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-xl">Loading your continue watching list...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-red-500 text-xl mb-2">Error</div>
              <div className="text-gray-400 mb-4">{error}</div>
              <button
                onClick={loadContinueWatching}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Continue Watching</h1>
            <Link
              href="/profile"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Back to Profile
            </Link>
          </div>
          <p className="text-gray-400">
            {continueWatching.length === 0 
              ? "You haven't started watching any movies yet." 
              : `You have ${continueWatching.length} movie${continueWatching.length !== 1 ? 's' : ''} in progress.`
            }
          </p>
        </div>

        {/* Empty State */}
        {continueWatching.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">▶️</div>
            <h2 className="text-2xl font-bold mb-4">No movies in progress</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Start watching movies to see them here. You can pick up right where you left off!
            </p>
            <Link
              href="/browse"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors inline-block"
            >
              Start Watching
            </Link>
          </div>
        )}

        {/* Continue Watching Grid */}
        {continueWatching.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {continueWatching.map((movie) => {
              const progressInfo = formatProgress(movie.progress || 0, movie.duration);
              
              return (
                <div
                  key={movie.id}
                  className="bg-gray-800 rounded-lg overflow-hidden group relative"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromContinueWatching(movie.id)}
                    disabled={removingIds.has(movie.id)}
                    className="absolute top-2 right-2 z-10 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove from continue watching"
                  >
                    {removingIds.has(movie.id) ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span className="text-white text-sm">×</span>
                    )}
                  </button>

                  <div className="flex">
                    {/* Movie Poster */}
                    <div className="w-32 flex-shrink-0">
                      <Link href={`/watch/${movie.id}`}>
                        <div className="aspect-[2/3] relative overflow-hidden">
                          <img
                            src={getImageUrl(movie.poster_path)}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          {/* Play overlay */}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                              <span className="text-black text-xl ml-1">▶</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>

                    {/* Movie Info */}
                    <div className="flex-1 p-4">
                      <Link href={`/details/${movie.id}`}>
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                          {movie.title}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                        <span>{movie.release_date?.split("-")[0] || "N/A"}</span>
                        <span className="flex items-center">
                          {movie.vote_average.toFixed(1)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="text-gray-400">
                            {typeof progressInfo === 'object' ? progressInfo.remaining : progressInfo}
                          </span>
                          {movie.lastWatched && (
                            <span className="text-gray-500 text-xs">
                              {new Date(movie.lastWatched).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: getProgressBarWidth(movie.progress || 0, movie.duration) }}
                          ></div>
                        </div>
                      </div>

                      {/* Overview */}
                      {movie.overview && (
                        <p className="text-sm text-gray-400 line-clamp-2 mb-4">
                          {movie.overview}
                        </p>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link
                          href={`/watch/${movie.id}`}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm text-center transition-colors"
                        >
                          Continue Watching
                        </Link>
                        <Link
                          href={`/details/${movie.id}`}
                          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm text-center transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        {continueWatching.length > 0 && (
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/browse"
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Browse More Movies
            </Link>
            <Link
              href="/watchlist"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              View Watchlist
            </Link>
            <Link
              href="/favorites"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              View Favorites
            </Link>
          </div>
        )}

        {/* Sorting Options */}
        {continueWatching.length > 0 && (
          <div className="mt-8 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Sort Options</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  // Sort by last watched (most recent first)
                  const sorted = [...continueWatching].sort((a, b) => 
                    new Date(b.lastWatched || 0).getTime() - new Date(a.lastWatched || 0).getTime()
                  );
                  setContinueWatching(sorted);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                Recently Watched
              </button>
              <button
                onClick={() => {
                  // Sort by progress (least progress first)
                  const sorted = [...continueWatching].sort((a, b) => (a.progress || 0) - (b.progress || 0));
                  setContinueWatching(sorted);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                Least Progress
              </button>
              <button
                onClick={() => {
                  // Sort by rating (highest first)
                  const sorted = [...continueWatching].sort((a, b) => b.vote_average - a.vote_average);
                  setContinueWatching(sorted);
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                Highest Rated
              </button>
              <button
                onClick={() => {
                  // Sort alphabetically
                  const sorted = [...continueWatching].sort((a, b) => a.title.localeCompare(b.title));
                  setContinueWatching(sorted);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                A-Z
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}