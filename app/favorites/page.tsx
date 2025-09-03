"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SkeletonLoader from "@/app/components/ui/SkeletonLoader";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
  addedAt?: string;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
      return;
    }

    if (session?.user?.id) {
      loadFavorites();
    }
  }, [session, status, router]);

  const loadFavorites = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/users/${session.user.id}/favorites`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load favorites");
      }

      const data = await response.json();
      setFavorites(data.data || []);
    } catch (err) {
      console.error("Failed to load favorites:", err);
      setError("Failed to load your favorites. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (movieId: number) => {
    if (!session?.user?.id || removingIds.has(movieId)) return;

    try {
      setRemovingIds((prev) => new Set(prev).add(movieId));

      const response = await fetch(
        `/api/users/${session.user.id}/favorites/${movieId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove from favorites");
      }

      // Remove from local state
      setFavorites((prev) => prev.filter((movie) => movie.id !== movieId));
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      // You could show a toast notification here
    } finally {
      setRemovingIds((prev) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="skeleton-text" style={{ width: '200px', height: '3rem' }}></div>
              <div className="skeleton-text" style={{ width: '120px', height: '1rem' }}></div>
            </div>
            <div className="skeleton-text" style={{ width: '300px', height: '1rem' }}></div>
          </div>

          {/* Loading Grid */}
          <SkeletonLoader count={12} type="movie-card" />
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
                onClick={loadFavorites}
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
            <h1 className="text-3xl font-bold">My Favorites</h1>
            <Link
              href="/profile"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Back to Profile
            </Link>
          </div>
          <p className="text-gray-400">
            {favorites.length === 0
              ? "You haven't added any movies to your favorites yet."
              : `You have ${favorites.length} movie${
                  favorites.length !== 1 ? "s" : ""
                } in your favorites.`}
          </p>
        </div>

        {/* Empty State */}
        {favorites.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">❤️</div>
            <h2 className="text-2xl font-bold mb-4">No favorites yet</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Start exploring movies and add them to your favorites by clicking
              the heart button on movie details pages.
            </p>
            <Link
              href="/browse"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors inline-block"
            >
              Browse Movies
            </Link>
          </div>
        )}

        {/* Favorites Grid */}
        {favorites.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {favorites.map((movie) => (
              <div
                key={movie.id}
                className="bg-gray-800 rounded-lg overflow-hidden group relative"
              >
                {/* Remove Button */}
                <button
                  onClick={() => removeFavorite(movie.id)}
                  disabled={removingIds.has(movie.id)}
                  className="absolute top-2 right-2 z-10 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove from favorites"
                >
                  {removingIds.has(movie.id) ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="text-white text-sm">×</span>
                  )}
                </button>

                <Link href={`/details/${movie.id}`}>
                  <div className="aspect-[2/3] relative overflow-hidden">
                    <img
                      src={getImageUrl(movie.poster_path)}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {movie.title}
                    </h3>

                    <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                      <span>{movie.release_date?.split("-")[0] || "N/A"}</span>
                      <span className="flex items-center">
                        {movie.vote_average.toFixed(1)}
                      </span>
                    </div>

                    {movie.addedAt && (
                      <div className="text-xs text-gray-500">
                        Added {new Date(movie.addedAt).toLocaleDateString()}
                      </div>
                    )}

                    {movie.overview && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-3">
                        {movie.overview}
                      </p>
                    )}
                  </div>
                </Link>

                {/* Quick Actions */}
                <div className="p-4 pt-0">
                  <div className="flex gap-2">
                    <Link
                      href={`/watch/${movie.id}`}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs text-center transition-colors"
                    >
                      Watch Now
                    </Link>
                    <Link
                      href={`/details/${movie.id}`}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded text-xs text-center transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {favorites.length > 0 && (
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
          </div>
        )}
      </div>
    </div>
  );
}
