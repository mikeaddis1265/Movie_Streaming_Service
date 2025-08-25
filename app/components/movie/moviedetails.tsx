interface Movie {
  title: string;
  overview: string;
  vote_average: number;
  // Add other properties as needed
}

interface MovieDetailsProps {
  movie: Movie;
}

const MovieDetails = ({ movie }: MovieDetailsProps) => {
  return (
    <div className="movie-details">
      <h2>{movie.title}</h2>
      <p>{movie.overview}</p>
      <p>Rating: {movie.vote_average}</p>
      {/* Add cast and similar recommendations here */}
    </div>
  );
};

export default MovieDetails;
