"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { discoverMovies, fetchGenres } from "@/lib/tmdbapi";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

interface Genre {
  id: number;
  name: string;
}

export default function BrowsePage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const genresData = await fetchGenres();
        setGenres(genresData.genres);
      } catch (err) {
        console.error('Failed to load genres:', err);
      }
    };
    loadGenres();
  }, []);

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params: any = {};
        
        if (selectedGenre !== "All") {
          const genre = genres.find(g => g.name === selectedGenre);
          if (genre) {
            params.with_genres = genre.id.toString();
          }
        }
        
        if (selectedYear !== "All") {
          params.primary_release_year = selectedYear;
        }

        const moviesData = await discoverMovies(params);
        setMovies(moviesData.results);
      } catch (err) {
        setError('Failed to load movies. Please check your TMDb API configuration.');
        console.error('Failed to load movies:', err);
      } finally {
        setLoading(false);
      }
    };

    if (genres.length > 0 || selectedGenre === "All") {
      loadMovies();
    }
  }, [selectedGenre, selectedYear, genres]);

  const getImageUrl = (path: string) => {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : '/placeholder-movie.jpg';
  };

  return (
    <div className="container">
      <h1>Browse Movies/TV Shows</h1>

      {/* Filters */}
      <div className="browse-filters">
        <select 
          value={selectedGenre} 
          onChange={(e) => setSelectedGenre(e.target.value)} 
          className="browse-select"
        >
          <option value="All">All</option>
          {genres.map(genre => (
            <option key={genre.id} value={genre.name}>{genre.name}</option>
          ))}
        </select>

        <select 
          value={selectedYear} 
          onChange={(e) => setSelectedYear(e.target.value)} 
          className="browse-select"
        >
          <option value="All">All</option>
          {years.map(year => (
            <option key={year} value={year.toString()}>{year}</option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="browse-loading">
          <h2>Loading movies...</h2>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="browse-error">
          <h2 className="browse-error-title">{error}</h2>
          <p className="browse-error-message">
            Make sure to set your TMDB_API_KEY environment variable.
          </p>
        </div>
      )}

      {/* Movie Grid */}
      {!loading && !error && (
        <div className="browse-movie-grid">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              href={`/details/${movie.id}`}
              className="browse-movie-card"
            >
              <div className="browse-movie-poster">
                <img
                  src={getImageUrl(movie.poster_path)}
                  alt={movie.title}
                />
              </div>
              <h3 className="browse-movie-title">
                {movie.title}
              </h3>
              <div className="browse-movie-info">
                <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
                <span>⭐ {movie.vote_average.toFixed(1)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && !error && movies.length === 0 && (
        <div className="browse-no-results">
          <h2 className="browse-no-results-title">No movies found with current filters</h2>
        </div>
      )}
    </div>
  );
}