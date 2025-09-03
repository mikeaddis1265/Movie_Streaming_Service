import FeaturedMovie from "@/app/components/movie/FeaturedMovie";
import MovieCard from "@/app/components/movie/MovieCard";
import Footer from "@/app/components/ui/Footer";
import PaymentSuccessNotification from "@/app/components/ui/PaymentSuccessNotification";
import { fetchMovies, fetchNowPlayingMovies, fetchTrendingMovies, fetchTopRatedMovies } from "@/lib/tmdbapi";
import Link from "next/link";
import { Suspense } from "react";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

export default async function HomePage() {
  let popularMovies: Movie[] = [];
  let nowPlayingMovies: Movie[] = [];
  let trendingMovies: Movie[] = [];
  let topRatedMovies: Movie[] = [];
  let error: string | null = null;

  try {
    const [popular, nowPlaying, trending, topRated] = await Promise.all([
      fetchMovies(),
      fetchNowPlayingMovies(),
      fetchTrendingMovies(),
      fetchTopRatedMovies()
    ]);
    
    popularMovies = popular.results;
    nowPlayingMovies = nowPlaying.results;
    trendingMovies = trending.results;
    topRatedMovies = topRated.results;
  } catch (err) {
    console.error('Failed to fetch movies:', err);
    error = 'Failed to load movies. Please check your TMDb API configuration.';
  }

  if (error) {
    return (
      <div className="container">
        <div className="homepage-error">
          <h2 className="homepage-error-title">{error}</h2>
          <p className="homepage-error-message">
            Make sure to set your TMDB_API_KEY environment variable.
          </p>
          <Link href="/browse" className="button">
            Browse Movies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Payment Success Notification */}
      <Suspense fallback={null}>
        <PaymentSuccessNotification />
      </Suspense>
      
      {/* Featured Movie Section */}
      {popularMovies.length > 0 && (
        <div className="animate-fade-in-up">
          <FeaturedMovie movie={popularMovies[0]} />
        </div>
      )}

      <div className="container max-w-7xl mx-auto px-6 py-8">
        {/* Trending Now Section */}
        {trendingMovies.length > 0 && (
          <section className="mb-16 animate-fade-in-up">
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
          </section>
        )}

        {/* Now Playing Section */}
        {nowPlayingMovies.length > 0 && (
          <section className="mb-16 animate-fade-in-up">
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
          </section>
        )}

        {/* Popular Movies Section */}
        {popularMovies.length > 0 && (
          <section className="mb-16 animate-fade-in-up">
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
          </section>
        )}

        {/* Top IMDb Section */}
        {topRatedMovies.length > 0 && (
          <section className="mb-16 animate-fade-in-up">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white">Top IMDb Movies</h2>
            </div>
            <div className="movie-grid">
              {topRatedMovies.slice(0, 10).map((movie, index) => (
                <div key={movie.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
