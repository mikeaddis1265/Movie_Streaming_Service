import FeaturedMovie from "@/app/components/movie/FeaturedMovie";
import MovieCard from "@/app/components/movie/MovieCard";
import { fetchMovies, fetchNowPlayingMovies, fetchTrendingMovies } from "@/lib/tmdbapi";
import Link from "next/link";

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
  let error: string | null = null;

  try {
    const [popular, nowPlaying, trending] = await Promise.all([
      fetchMovies(),
      fetchNowPlayingMovies(),
      fetchTrendingMovies()
    ]);
    
    popularMovies = popular.results;
    nowPlayingMovies = nowPlaying.results;
    trendingMovies = trending.results;
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
    <div className="container">
      {/* Featured Movie Section - Using colleague's layout */}
      {popularMovies.length > 0 && (
        <div>
          <FeaturedMovie movie={popularMovies[0]} />
        </div>
      )}

      {/* Trending Now Section - Using her design */}
      {trendingMovies.length > 0 && (
        <div>
          <div className="homepage-section-header">
            <h2>Trending Now</h2>
            <Link href="/browse" className="homepage-view-all-link">
              View All →
            </Link>
          </div>
          <div className="movie-grid">
            {trendingMovies.slice(0, 10).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      )}

      {/* Now Playing Section */}
      {nowPlayingMovies.length > 0 && (
        <div>
          <div className="homepage-section-header">
            <h2>Now Playing</h2>
            <Link href="/browse" className="homepage-view-all-link">
              View All →
            </Link>
          </div>
          <div className="movie-grid">
            {nowPlayingMovies.slice(0, 10).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      )}

      {/* Popular Movies Section */}
      {popularMovies.length > 0 && (
        <div>
          <div className="homepage-section-header">
            <h2>Popular Movies</h2>
            <Link href="/browse" className="homepage-view-all-link">
              View All →
            </Link>
          </div>
          <div className="movie-grid">
            {popularMovies.slice(1, 11).map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
