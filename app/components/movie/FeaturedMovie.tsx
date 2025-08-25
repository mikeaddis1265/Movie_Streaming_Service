import Link from "next/link";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average: number;
  release_date: string;
}

interface FeaturedMovieProps {
  movie: Movie;
}

const FeaturedMovie = ({ movie }: FeaturedMovieProps) => {
  if (!movie) return null;

  const backdropUrl = movie.backdrop_path 
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : `https://image.tmdb.org/t/p/w1280${movie.poster_path}`;

  return (
    <div 
      className="featured-movie"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url(${backdropUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '40px',
        borderRadius: '8px',
        padding: '60px 40px'
      }}
    >
      <div style={{ maxWidth: '50%', color: 'white' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
          {movie.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', fontSize: '16px' }}>
          <span>⭐ {movie.vote_average.toFixed(1)}</span>
          <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
        </div>
        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '30px', maxWidth: '600px' }}>
          {movie.overview}
        </p>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href={`/watch/${movie.id}`} className="button" style={{ fontSize: '16px', padding: '12px 24px' }}>
            ▶ Watch Now
          </Link>
          <Link 
            href={`/details/${movie.id}`} 
            className="button" 
            style={{ 
              fontSize: '16px', 
              padding: '12px 24px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white'
            }}
          >
            More Info
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FeaturedMovie;
