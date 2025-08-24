// src/components/MovieDetails.js
const MovieDetails = ({ movie }) => {
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