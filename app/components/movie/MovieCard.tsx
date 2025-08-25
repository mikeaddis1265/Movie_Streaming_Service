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
    <Link href={`/details/${movie.id}`} className="browse-movie-card">
      <div className="browse-movie-poster">
        <img 
          src={imageUrl} 
          alt={movie.title}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-movie.jpg';
          }}
        />
      </div>
      <div className="browse-movie-title">{movie.title}</div>
      <div className="browse-movie-info">
        <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
        <span>⭐ {movie.vote_average.toFixed(1)}</span>
      </div>
    </Link>
  );
};

export default MovieCard;
