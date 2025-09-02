"use client";

import Link from "next/link";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  const imageUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : '/placeholder-movie.jpg';

  return (
    <Link href={`/details/${movie.id}`} className="movie-card-standard">
      <div className="movie-poster-container">
        <img 
          src={imageUrl} 
          alt={movie.title}
          className="movie-poster-image"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-movie.jpg';
          }}
        />
        
        {/* Netflix-style Hover Overlay */}
        <div className="movie-overlay">
          <div className="play-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <div className="quick-actions">
            <button className="quick-btn" title="Add to Watchlist">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="quick-btn" title="Add to Favorites">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="movie-info-standard">
        <h3 className="movie-title-standard">{movie.title}</h3>
        <div className="movie-meta-standard">
          <span className="movie-year-standard">{movie.release_date?.split('-')[0] || 'N/A'}</span>
          <span className="movie-rating-standard">⭐ {movie.vote_average.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
