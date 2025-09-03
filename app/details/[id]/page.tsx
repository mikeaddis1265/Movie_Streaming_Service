'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/app/components/ui/Footer';
import ModernVideoPlayer from "@/app/components/movie/ModernVideoplayer";


interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  runtime: number;
  genres: Array<{ id: number; name: string }>;
  budget: number;
  revenue: number;
  tagline: string;
  status: string;
  original_language: string;
  production_companies: Array<{
    id: number;
    name: string;
    logo_path?: string;
  }>;
  production_countries: Array<{ iso_3166_1: string; name: string }>;
  credits: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path?: string;
      order: number;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
      department: string;
      profile_path?: string;
    }>;
  };
  recommendations: Array<{
    id: number;
    title: string;
    poster_path: string;
    vote_average: number;
  }>;
  userData: {
    inWatchlist: boolean;
    inFavorites: boolean;
    userRating: number | null;
    watchProgress: number | null;
  };
  requiresSubscription?: boolean;
  canWatch?: boolean;
}

function MovieDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [inFavorites, setInFavorites] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'cast'>('overview');
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const movieId = params?.id as string;

  useEffect(() => {
    if (!movieId) return;

    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/movies/${movieId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch movie details');
        }
        const result = await response.json();
        setMovie(result.data);
        setUserRating(result.data.userData?.userRating);
        setInWatchlist(result.data.userData?.inWatchlist);
        setInFavorites(result.data.userData?.inFavorites);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId]);

  // Listen for subscription updates to refresh movie data
  useEffect(() => {
    const handleSubscriptionUpdate = () => {
      if (!movieId) return;
      
      // Refetch movie details to get updated subscription status
      fetch(`/api/movies/${movieId}`)
        .then(response => response.json())
        .then(result => {
          if (result.data) {
            setMovie(result.data);
            setUserRating(result.data.userData?.userRating);
            setInWatchlist(result.data.userData?.inWatchlist);
            setInFavorites(result.data.userData?.inFavorites);
          }
        })
        .catch(error => {
          console.error('Failed to refresh movie data after subscription update:', error);
        });
    };

    window.addEventListener('subscription-updated', handleSubscriptionUpdate);
    return () => {
      window.removeEventListener('subscription-updated', handleSubscriptionUpdate);
    };
  }, [movieId]);

  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [watchlistMessage, setWatchlistMessage] = useState<string | null>(null);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoritesMessage, setFavoritesMessage] = useState<string | null>(null);

  const handleWatchlistToggle = async () => {
    if (!session?.user?.id || !movie || watchlistLoading) return;

    setWatchlistLoading(true);
    setWatchlistMessage(null);

    try {
      let response;
      if (inWatchlist) {
        // Remove from watchlist
        response = await fetch(`/api/users/${session.user.id}/watchlist/${movie.id}?mediaType=movie`, {
          method: 'DELETE',
        });
      } else {
        // Add to watchlist
        response = await fetch(`/api/users/${session.user.id}/watchlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tmdbId: movie.id, mediaType: 'MOVIE' }),
        });
      }
      
      if (response.ok) {
        const wasInWatchlist = inWatchlist;
        setInWatchlist(!inWatchlist);
        
        // Show success message
        if (wasInWatchlist) {
          setWatchlistMessage('Removed from watchlist!');
        } else {
          setWatchlistMessage('Added to watchlist!');
        }
        
        // Clear message after 3 seconds
        setTimeout(() => setWatchlistMessage(null), 3000);
      } else {
        setWatchlistMessage('Failed to update watchlist. Please try again.');
        setTimeout(() => setWatchlistMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update watchlist:', err);
      setWatchlistMessage('Failed to update watchlist. Please try again.');
      setTimeout(() => setWatchlistMessage(null), 3000);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const handleFavoritesToggle = async () => {
    if (!session?.user?.id || !movie || favoritesLoading) return;

    setFavoritesLoading(true);
    setFavoritesMessage(null);

    try {
      let response;
      if (inFavorites) {
        // Remove from favorites
        response = await fetch(`/api/users/${session.user.id}/favorites/${movie.id}?mediaType=movie`, {
          method: 'DELETE',
        });
      } else {
        // Add to favorites
        response = await fetch(`/api/users/${session.user.id}/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tmdbId: movie.id, mediaType: 'MOVIE' }),
        });
      }
      
      if (response.ok) {
        const wasInFavorites = inFavorites;
        setInFavorites(!inFavorites);
        
        // Show success message
        if (wasInFavorites) {
          setFavoritesMessage('Removed from favorites!');
        } else {
          setFavoritesMessage('Added to favorites!');
        }
        
        // Clear message after 3 seconds
        setTimeout(() => setFavoritesMessage(null), 3000);
      } else {
        setFavoritesMessage('Failed to update favorites. Please try again.');
        setTimeout(() => setFavoritesMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update favorites:', err);
      setFavoritesMessage('Failed to update favorites. Please try again.');
      setTimeout(() => setFavoritesMessage(null), 3000);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleRating = async (rating: number) => {
    if (!session?.user?.id || !movie) return;

    try {
      const response = await fetch(`/api/movies/${movie.id}/rating`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: rating, mediaType: 'MOVIE' }),
      });
      
      if (response.ok) {
        setUserRating(rating);
      }
    } catch (err) {
      console.error('Failed to rate movie:', err);
    }
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getDirector = () => {
    return movie?.credits?.crew?.find(member => member.job === 'Director')?.name || 'Unknown';
  };

  const handleProgress = async (progress: {
    played: number;
    playedSeconds: number;
  }) => {
    if (session?.user && progress.playedSeconds > 0 && movie) {
      try {
        await fetch(`/api/users/${session.user.id}/continue-watching`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tmdbId: movie.id,
            mediaType: "MOVIE",
            progress: Math.round(progress.playedSeconds),
          }),
        });
      } catch (err) {
        console.error("Failed to save progress:", err);
      }
    }
  };

  const handlePlayMovie = async () => {
    // Check if movie requires subscription and user doesn't have one
    if (movie?.requiresSubscription && !movie?.canWatch) {
      // Redirect to subscription page
      router.push('/subscription');
      return;
    }

    // Add to viewing history when user starts watching
    if (session?.user?.id && movie) {
      try {
        await fetch(`/api/users/${session.user.id}/viewing-history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tmdbId: movie.id,
            mediaType: 'MOVIE',
            progress: 0
          }),
        });
        console.log('Added to viewing history');
      } catch (error) {
        console.error('Failed to add to viewing history:', error);
      }
    }
    
    setShowVideoPlayer(true);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  };

  const handleClosePlayer = () => {
    setShowVideoPlayer(false);
    // Restore body scrolling
    document.body.style.overflow = 'unset';
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showVideoPlayer) {
        handleClosePlayer();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showVideoPlayer]);

  if (loading) {
    return (
      <div className="movie-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading movie details...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-details-error">
        <h2>Error Loading Movie</h2>
        <p>{error || 'Movie not found'}</p>
        <button onClick={() => router.back()} className="btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="movie-details-page">
      {/* Hero Section */}
      <div className="movie-hero">
        <div className="movie-hero-backdrop">
          <Image
            src={`https://image.tmdb.org/t/p/w1920_and_h800_multi_faces${movie.backdrop_path}`}
            alt={movie.title}
            fill
            className="backdrop-image"
            priority
          />
          <div className="hero-overlay"></div>
        </div>
        
        <div className="movie-hero-content">
          <div className="hero-poster">
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              width={300}
              height={450}
              className="poster-image"
            />
          </div>
          
          <div className="hero-info">
            <h1 className="movie-title">{movie.title}</h1>
            {movie.tagline && <p className="movie-tagline">{movie.tagline}</p>}
            
            <div className="movie-meta">
              <span className="rating">
                {movie.vote_average.toFixed(1)}/10
              </span>
              <span className="year">
                {new Date(movie.release_date).getFullYear()}
              </span>
              <span className="runtime">
                {formatRuntime(movie.runtime)}
              </span>
              <span className="status">{movie.status}</span>
            </div>
            
            <div className="movie-genres">
              {movie.genres.map(genre => (
                <span key={genre.id} className="genre-tag">
                  {genre.name}
                </span>
              ))}
            </div>
            
            <div className="action-buttons">
              <div className="primary-actions">
                <button onClick={handlePlayMovie} className={`btn-play ${movie?.requiresSubscription && !movie?.canWatch ? 'subscription-required' : ''}`}>
                  {movie?.requiresSubscription && !movie?.canWatch 
                    ? '👑 Subscribe to Watch' 
                    : '▶ Play Movie'
                  }
                </button>
                
                {session && (
                  <button 
                    onClick={handleWatchlistToggle}
                    disabled={watchlistLoading}
                    className={`btn-watchlist ${inWatchlist ? 'in-watchlist' : ''} ${watchlistLoading ? 'loading' : ''}`}
                  >
                    {watchlistLoading ? (
                      <span className="loading-content">
                        <span className="spinner"></span>
                        {inWatchlist ? 'Removing...' : 'Adding...'}
                      </span>
                    ) : (
                      inWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'
                    )}
                  </button>
                )}
                
                {session && (
                  <button 
                    onClick={handleFavoritesToggle}
                    disabled={favoritesLoading}
                    className={`btn-favorites ${inFavorites ? 'in-favorites' : ''} ${favoritesLoading ? 'loading' : ''}`}
                  >
                    {favoritesLoading ? (
                      <span className="loading-content">
                        <span className="spinner"></span>
                        {inFavorites ? 'Removing...' : 'Adding...'}
                      </span>
                    ) : (
                      inFavorites ? '❤️ In Favorites' : '🤍 Add to Favorites'
                    )}
                  </button>
                )}
              </div>

              {session && (
                <div className="secondary-actions">
                  <div className="rating-section">
                    <span>Rate this movie:</span>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => handleRating(star)}
                          className={`star ${(userRating && userRating >= star) ? 'filled' : ''}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {watchlistMessage && (
                <div className={`watchlist-message ${watchlistMessage.includes('Failed') ? 'error' : 'success'}`}>
                  {watchlistMessage}
                </div>
              )}
              
              {favoritesMessage && (
                <div className={`favorites-message ${favoritesMessage.includes('Failed') ? 'error' : 'success'}`}>
                  {favoritesMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Video Player Modal */}
      {showVideoPlayer && (
        <div className="video-modal-overlay" onClick={handleClosePlayer}>
          <div className="video-modal-container" onClick={(e) => e.stopPropagation()}>
            <ModernVideoPlayer
              videoUrl={`/videos/${movie.id}.mp4`}
              movieId={movie.id.toString()}
              onProgress={handleProgress}
            />
          </div>
        </div>
      )}

      {/* Content Tabs */}
      <div className="movie-content">
        <div className="content-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'cast' ? 'active' : ''}`}
            onClick={() => setActiveTab('cast')}
          >
            Cast & Crew
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content overview-tab">
            <div className="overview-grid">
              <div className="overview-main">
                <h3>Synopsis</h3>
                <p className="movie-overview">{movie.overview}</p>
                
                <div className="movie-details-grid">
                  <div className="detail-item">
                    <h4>Director</h4>
                    <p>{getDirector()}</p>
                  </div>
                  <div className="detail-item">
                    <h4>Language</h4>
                    <p>{movie.original_language.toUpperCase()}</p>
                  </div>
                  <div className="detail-item">
                    <h4>Budget</h4>
                    <p>{movie.budget > 0 ? formatCurrency(movie.budget) : 'Unknown'}</p>
                  </div>
                  <div className="detail-item">
                    <h4>Revenue</h4>
                    <p>{movie.revenue > 0 ? formatCurrency(movie.revenue) : 'Unknown'}</p>
                  </div>
                </div>

                {movie.production_companies.length > 0 && (
                  <div className="production-companies">
                    <h4>Production Companies</h4>
                    <div className="companies-grid">
                      {movie.production_companies.slice(0, 4).map(company => (
                        <div key={company.id} className="company-item">
                          {company.logo_path && (
                            <Image
                              src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                              alt={company.name}
                              width={100}
                              height={50}
                              className="company-logo"
                            />
                          )}
                          <p>{company.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cast Tab */}
        {activeTab === 'cast' && (
          <div className="tab-content cast-tab">
            <h3>Cast</h3>
            <div className="cast-grid">
              {movie.credits?.cast?.slice(0, 12).map(member => (
                <div key={member.id} className="cast-card">
                  <div className="cast-image">
                    {member.profile_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w200${member.profile_path}`}
                        alt={member.name}
                        width={150}
                        height={225}
                        className="profile-image"
                      />
                    ) : (
                      <div className="no-image">No Photo</div>
                    )}
                  </div>
                  <div className="cast-info">
                    <h4>{member.name}</h4>
                    <p>{member.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Recommendations Section */}
        {movie.recommendations.length > 0 && (
          <div className="recommendations-section">
            <h3>You Might Also Like</h3>
            <div className="recommendations-grid">
              {movie.recommendations.slice(0, 6).map(rec => (
                <Link key={rec.id} href={`/details/${rec.id}`} className="recommendation-card">
                  <Image
                    src={`https://image.tmdb.org/t/p/w300${rec.poster_path}`}
                    alt={rec.title}
                    width={200}
                    height={300}
                    className="rec-poster"
                  />
                  <div className="rec-info">
                    <h4>{rec.title}</h4>
                    <span className="rec-rating">{rec.vote_average.toFixed(1)}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}

export default function MovieDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
        <div className="container mx-auto px-6 py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-700 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
              <div>
                <div className="h-96 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }>
      <MovieDetailsContent />
    </Suspense>
  );
}