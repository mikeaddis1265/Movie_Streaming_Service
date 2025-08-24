// src/pages/index.js
import FeaturedMovie from '../components/FeaturedMovie';
import MovieCard from '../components/MovieCard';
import { fetchMovies } from '../api/tmdbApi';

const HomePage = ({ trendingMovies }) => {
    return (
        <div className="container">
            <FeaturedMovie movie={trendingMovies[0]} />
            <h2>Trending Now</h2>
            <div className="movie-grid">
                {trendingMovies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>
        </div>
    );
};

export async function getServerSideProps() {
    const movies = await fetchMovies();
    return {
        props: { trendingMovies: movies.results },
    };
}

export default HomePage;