"use client";

import Link from "next/link";

export default function MovieDetailsPage({ params }) {
  const { id } = params;
  
  // Mock data (replace with real API later)
  const movie = {
    title: "Example Movie",
    synopsis: "This is the synopsis of the movie...",
    cast: ["Actor 1", "Actor 2", "Actor 3"],
    rating: 8.5,
    trailer: "/trailers/example.mp4",
    similar: [
      { id: "2", title: "Similar Movie 1" },
      { id: "3", title: "Similar Movie 2" },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">{movie.title}</h1>

      {/* Synopsis */}
      <p className="mb-4">{movie.synopsis}</p>

      {/* Cast */}
      <div className="mb-4">
        <h2 className="font-semibold mb-1">Cast:</h2>
        <ul className="flex flex-wrap gap-2">
          {movie.cast.map((actor, idx) => (
            <li key={idx} className="bg-gray-700 px-2 py-1 rounded">{actor}</li>
          ))}
        </ul>
      </div>

      {/* Rating */}
      <p className="mb-4">Rating: <span className="font-bold">{movie.rating}/10</span></p>

      {/* Trailer */}
      <div className="mb-4">
        <video className="w-full max-w-3xl rounded" controls>
          <source src={movie.trailer} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Similar Movies */}
      <div>
        <h2 className="font-semibold mb-2">Similar Recommendations:</h2>
        <div className="flex gap-4">
          {movie.similar.map((item) => (
            <Link
              key={item.id}
              href={`/movie/${item.id}`}
              className="bg-gray-700 px-3 py-2 rounded hover:bg-blue-600 transition"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
