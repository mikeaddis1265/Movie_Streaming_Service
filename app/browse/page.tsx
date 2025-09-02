"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { discoverMovies, fetchGenres } from "@/lib/tmdbapi";
import Footer from "@/app/components/ui/Footer";
import SkeletonLoader from "@/app/components/ui/SkeletonLoader";
import MovieCard from "@/app/components/movie/MovieCard";

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
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'CN', name: 'China' },
    { code: 'IN', name: 'India' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'RU', name: 'Russia' }
  ];


  // Initialize and react to URL changes (?year=2024&country=JP&type=tv)
  useEffect(() => {
    const yearParam = searchParams.get("year");
    const countryParam = searchParams.get("country");
    if (yearParam) setSelectedYear(yearParam);
    if (countryParam) setSelectedCountry(countryParam);
  }, [searchParams]);

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      setError(null);

      try {
        const params: any = {};

        // Handle genre from URL (from navigation)
        const genreIdParam = searchParams.get("genreId");
        if (genreIdParam && /^\d+$/.test(genreIdParam)) {
          params.with_genres = genreIdParam;
        }

        if (selectedYear !== "All") {
          params.primary_release_year = selectedYear;
        }

        if (selectedCountry !== "All") {
          params.with_origin_country = selectedCountry;
        }

        const typeParam = searchParams.get('type') || 'movie';

        // Prefer server-side API to avoid client TMDb env issues
        const qs = new URLSearchParams();
        if (params.with_genres) qs.set('with_genres', params.with_genres);
        if (params.primary_release_year) qs.set('primary_release_year', params.primary_release_year);
        if (params.with_origin_country) qs.set('with_origin_country', params.with_origin_country);
        if (typeParam === 'tv') qs.set('type', 'tv');
        const res = await fetch(`/api/movies/browse?${qs.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch filtered movies');
        const data = await res.json();
        setMovies(data.data || []);
      } catch (err) {
        setError(
          "Failed to load movies. Please check your TMDb API configuration."
        );
        console.error("Failed to load movies:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [selectedYear, selectedCountry, searchParams]);

  const getImageUrl = (path: string) => {
    return path
      ? `https://image.tmdb.org/t/p/w500${path}`
      : "/placeholder-movie.jpg";
  };

  return (
    <div className="container">
      <h1>Browse Movies/TV Shows</h1>

      {/* Filters */}
      <div className="browse-filters">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="browse-select"
        >
          <option value="All">All Years</option>
          {years.map((year) => (
            <option key={year} value={year.toString()}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="browse-select"
        >
          <option value="All">All Countries</option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="browse-loading">
          <div className="skeleton-section-header mb-8"></div>
          <SkeletonLoader count={20} type="movie-card" />
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
        <div className="movie-grid">
          {movies.map((movie, index) => (
            <div key={movie.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && !error && movies.length === 0 && (
        <div className="browse-no-results">
          <h2 className="browse-no-results-title">
            No movies found with current filters
          </h2>
        </div>
      )}
      
      <Footer />
    </div>
  );
}
