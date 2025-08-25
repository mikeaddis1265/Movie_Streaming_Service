"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import VideoPlayer from "@/app/components/movie/videoplayer";
import { fetchMovieDetails } from "@/lib/tmdbapi";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
  release_date: string;
}

export default function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("");

  useEffect(() => {
    const getParams = async () => {
      const { id: movieId } = await params;
      setId(movieId);
    };
    getParams();
  }, [params]);
  const { data: session } = useSession();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const loadMovieDetails = async () => {
      try {
        setLoading(true);
        const movieData = await fetchMovieDetails(id);
        setMovie(movieData);
      } catch (err) {
        setError('Failed to load movie details');
        console.error('Failed to load movie:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMovieDetails();
  }, [id]);

  const handleProgress = async (progress: { played: number; playedSeconds: number }) => {
    if (session?.user && progress.playedSeconds > 0) {
      // Save progress to database
      try {
        await fetch(`/api/users/${session.user.id}/continue-watching`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            movieId: id,
            progress: Math.round(progress.playedSeconds),
            lastWatched: new Date().toISOString()
          })
        });
      } catch (err) {
        console.error('Failed to save progress:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Loading movie...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">{error || 'Movie not found'}</div>
          <p className="text-gray-400">
            Make sure your TMDb API is configured properly.
          </p>
        </div>
      </div>
    );
  }

  // For demo purposes, using a placeholder video URL
  // In production, you'd have actual video files or streaming URLs
  const videoUrl = `/videos/${id}.mp4`; // Fallback to a demo video or trailer

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Movie Info Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
          <div className="flex items-center justify-center gap-4 text-gray-400">
            <span>{movie.release_date?.split('-')[0] || 'N/A'}</span>
            <span>⭐ {movie.vote_average.toFixed(1)}</span>
          </div>
        </div>

        {/* Video Player */}
        <VideoPlayer 
          videoUrl={videoUrl}
          movieId={id}
          onProgress={handleProgress}
        />

        {/* Movie Description */}
        <div className="mt-8 max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">About this movie</h2>
          <p className="text-gray-300 leading-relaxed">
            {movie.overview || 'No description available.'}
          </p>
        </div>

        {/* Note about video content */}
        <div className="mt-8 max-w-4xl mx-auto">
          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <p className="text-yellow-200 text-sm">
              <strong>Note:</strong> This is a demo implementation. In a production environment, 
              you would integrate with a video hosting service or CDN to serve actual movie content.
              The video player is fully functional and ready for real video URLs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
