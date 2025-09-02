"use client";

import { useEffect, useState } from "react";
import FeaturedMovie from "@/app/components/movie/FeaturedMovie";
import MovieCard from "@/app/components/movie/MovieCard";
import SkeletonLoader from "@/app/components/ui/SkeletonLoader";
import Footer from "@/app/components/ui/Footer";
import Link from "next/link";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

export default function ClientHomePage() {
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllMovies = async () => {
      try {
        setLoading(true);
        const [popularRes, nowPlayingRes, trendingRes, topRatedRes] = await Promise.all([
          fetch('/api/movies/popular'),
          fetch('/api/movies/now-playing'),
          fetch('/api/movies/trending'),
          fetch('/api/movies/top-rated')
        ]);

        const [popular, nowPlaying, trending, topRated] = await Promise.all([
          popularRes.json(),
          nowPlayingRes.json(),
          trendingRes.json(),
          topRatedRes.json()
        ]);

        setPopularMovies(popular.results || []);
        setNowPlayingMovies(nowPlaying.results || []);
        setTrendingMovies(trending.results || []);
        setTopRatedMovies(topRated.results || []);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        setError('Failed to load movies. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllMovies();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen">
        <div className="container max-w-7xl mx-auto px-6 py-8">
          <div className="homepage-error text-center py-20">
            <h2 className="text-2xl font-bold text-white mb-4">{error}</h2>
            <p className="text-gray-400 mb-8">
              Make sure to check your internet connection and try again.
            </p>
            <Link href="/browse" className="btn-primary">
              Browse Movies
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Featured Movie Section */}
      {loading ? (
        <SkeletonLoader type="featured" />
      ) : (
        popularMovies.length > 0 && (
          <div className="animate-fade-in-up">
            <FeaturedMovie movie={popularMovies[0]} />
          </div>
        )
      )}

      <div className="container max-w-7xl mx-auto px-6 py-8">
        {/* Trending Now Section */}
        <section className="mb-16">
          {loading ? (
            <>
              <div className="skeleton-section-header mb-8"></div>
              <SkeletonLoader count={10} type="movie-card" />
            </>
          ) : (
            trendingMovies.length > 0 && (
              <>
                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-white">Trending Now</h2>
                </div>
                <div className="movie-grid">
                  {trendingMovies.slice(0, 10).map((movie, index) => (
                    <div key={movie.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>
              </>
            )
          )}
        </section>

        {/* Now Playing Section */}
        <section className="mb-16">
          {loading ? (
            <>
              <div className="skeleton-section-header mb-8"></div>
              <SkeletonLoader count={10} type="movie-card" />
            </>
          ) : (
            nowPlayingMovies.length > 0 && (
              <>
                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-white">Now Playing</h2>
                </div>
                <div className="movie-grid">
                  {nowPlayingMovies.slice(0, 10).map((movie, index) => (
                    <div key={movie.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>
              </>
            )
          )}
        </section>

        {/* Popular Movies Section */}
        <section className="mb-16">
          {loading ? (
            <>
              <div className="skeleton-section-header mb-8"></div>
              <SkeletonLoader count={10} type="movie-card" />
            </>
          ) : (
            popularMovies.length > 0 && (
              <>
                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-white">Popular Movies</h2>
                </div>
                <div className="movie-grid">
                  {popularMovies.slice(1, 11).map((movie, index) => (
                    <div key={movie.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>
              </>
            )
          )}
        </section>

        {/* Top Rated Section */}
        <section className="mb-16">
          {loading ? (
            <>
              <div className="skeleton-section-header mb-8"></div>
              <SkeletonLoader count={10} type="movie-card" />
            </>
          ) : (
            topRatedMovies.length > 0 && (
              <>
                <div className="mb-8">
                  <h2 className="text-4xl font-bold text-white">Top Rated</h2>
                </div>
                <div className="movie-grid">
                  {topRatedMovies.slice(0, 10).map((movie, index) => (
                    <div key={movie.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                      <MovieCard movie={movie} />
                    </div>
                  ))}
                </div>
              </>
            )
          )}
        </section>
      </div>
      
      <Footer />
    </div>
  );
}