"use client";

import Link from "next/link";
import { fetchMovieDetails, fetchMovieCredits } from "@/lib/tmdbapi"; // Import fetchMovieDetails and fetchMovieCredits
import { useEffect, useState } from "react"; // Import useEffect and useState

// Define the Movie interface based on tmdbapi.ts
interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  runtime?: number;
  genres?: Array<{ id: number; name: string }>;
  tagline?: string;
  budget?: number;
  revenue?: number;
  production_companies?: Array<{ id: number; name: string; logo_path?: string }>;
  production_countries?: Array<{ iso_3166_1: string; name: string }>;
  spoken_languages?: Array<{ iso_639_1: string; name: string }>;
}

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
  order: number;
}

interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path?: string;
}

interface MovieCredits {
  cast: CastMember[];
  crew: CrewMember[];
}

export default function MovieDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [credits, setCredits] = useState<MovieCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [id, setId] = useState<string>("");

  useEffect(() => {
    const getParams = async () => {
      const { id: movieId } = await params;
      setId(movieId);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!id) return;
    
    const getMovieDetails = async () => {
      try {
        setLoading(true);
        const [movieData, creditsData] = await Promise.all([
          fetchMovieDetails(id),
          fetchMovieCredits(id)
        ]);
        setMovie(movieData);
        setCredits(creditsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getMovieDetails();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-xl">Loading movie details...</div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-xl mb-2">Error loading movie</div>
        <div className="text-gray-400 mb-4">{error}</div>
        <div className="text-sm text-gray-500">
          Movie ID: {id} | Check console for more details
        </div>
      </div>
    </div>
  );
  
  if (!movie) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-xl">Movie not found.</div>
    </div>
  );

  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : `https://image.tmdb.org/t/p/w1280${movie.poster_path}`;

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder-movie.jpg';

  return (
    <div className="movie-details">
      {/* Backdrop Header */}
      <div 
        className="movie-backdrop"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(20,20,20,0.9)), url(${backdropUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '400px',
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '40px'
        }}
      >
        <div>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px', color: 'white' }}>
            {movie.title}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '18px', color: 'white' }}>
            <span>⭐ {movie.vote_average.toFixed(1)} ({movie.vote_count.toLocaleString()} votes)</span>
            <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
            {movie.runtime && <span>{movie.runtime} min</span>}
          </div>
        </div>
      </div>

      {/* Movie Details */}
      <div className="container">
        <div className="movie-details-grid">
          {/* Poster */}
          <div>
            <img 
              src={posterUrl} 
              alt={movie.title}
              style={{ 
                width: '100%', 
                borderRadius: '8px', 
                boxShadow: '0 4px 8px rgba(0,0,0,0.3)' 
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-movie.jpg';
              }}
            />
          </div>

          {/* Details */}
          <div>
            {movie.tagline && (
              <p style={{ 
                fontSize: '20px', 
                fontStyle: 'italic', 
                color: '#d1d5db', 
                marginBottom: '24px' 
              }}>
                "{movie.tagline}"
              </p>
            )}
            
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>Overview</h2>
            <p style={{ 
              color: '#d1d5db', 
              lineHeight: '1.6', 
              marginBottom: '32px',
              fontSize: '16px'
            }}>
              {movie.overview || 'No description available.'}
            </p>

            {movie.genres && movie.genres.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Genres</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {movie.genres.map((genre) => (
                    <span 
                      key={genre.id}
                      style={{
                        backgroundColor: '#374151',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '14px'
                      }}
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
              <Link href={`/watch/${id}`} className="button">
                ▶ Watch Now
              </Link>
              <Link 
                href="/" 
                className="button"
                style={{ 
                  backgroundColor: '#374151',
                  color: 'white'
                }}
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Movie Information */}
        <div style={{ padding: '40px 0', borderTop: '1px solid #374151' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            {/* Movie Details */}
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Movie Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#d1d5db' }}>
                <div>
                  <strong style={{ color: 'white' }}>Release Date:</strong> {new Date(movie.release_date).toLocaleDateString()}
                </div>
                <div>
                  <strong style={{ color: 'white' }}>Runtime:</strong> {movie.runtime ? `${movie.runtime} minutes` : 'N/A'}
                </div>
                <div>
                  <strong style={{ color: 'white' }}>Rating:</strong> {movie.vote_average.toFixed(1)}/10 ({movie.vote_count.toLocaleString()} votes)
                </div>
                {movie.budget && movie.budget > 0 && (
                  <div>
                    <strong style={{ color: 'white' }}>Budget:</strong> ${movie.budget.toLocaleString()}
                  </div>
                )}
                {movie.revenue && movie.revenue > 0 && (
                  <div>
                    <strong style={{ color: 'white' }}>Revenue:</strong> ${movie.revenue.toLocaleString()}
                  </div>
                )}
                {movie.production_companies && movie.production_companies.length > 0 && (
                  <div>
                    <strong style={{ color: 'white' }}>Production:</strong> {movie.production_companies.map(c => c.name).join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Director & Key Crew */}
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Key Crew</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#d1d5db' }}>
                {credits && credits.crew
                  .filter(member => ['Director', 'Producer', 'Writer', 'Screenplay', 'Music'].includes(member.job))
                  .slice(0, 6)
                  .map((member, index) => (
                    <div key={index}>
                      <strong style={{ color: 'white' }}>{member.job}:</strong> {member.name}
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        </div>

        {/* Cast Section */}
        {credits && credits.cast && credits.cast.length > 0 && (
          <div style={{ padding: '40px 0', borderTop: '1px solid #374151' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Cast</h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
              gap: '20px' 
            }}>
              {credits.cast.slice(0, 12).map((actor) => (
                <div 
                  key={actor.id} 
                  style={{ 
                    textAlign: 'center',
                    backgroundColor: '#1f2937',
                    borderRadius: '8px',
                    padding: '16px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <img 
                    src={actor.profile_path 
                      ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` 
                      : '/placeholder-actor.jpg'
                    }
                    alt={actor.name}
                    style={{
                      width: '100%',
                      height: '180px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      marginBottom: '12px'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-actor.jpg';
                    }}
                  />
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                    {actor.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {actor.character}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
