"use client";

import { useState } from "react";
import Link from "next/link";

export default function BrowsePage() {
  const [genre, setGenre] = useState("All");
  const [year, setYear] = useState("All");
  const [language, setLanguage] = useState("All");

  // Mock movies
  const movies = [
    { id: 1, title: "Movie 1", genre: "Action", year: "2023", language: "English" },
    { id: 2, title: "Movie 2", genre: "Comedy", year: "2022", language: "French" },
    { id: 3, title: "Movie 3", genre: "Action", year: "2021", language: "English" },
  ];

  const filteredMovies = movies.filter(
    (m) =>
      (genre === "All" || m.genre === genre) &&
      (year === "All" || m.year === year) &&
      (language === "All" || m.language === language)
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">Browse Movies/TV Shows</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <select value={genre} onChange={(e) => setGenre(e.target.value)} className="p-2 rounded bg-gray-700">
          <option>All</option>
          <option>Action</option>
          <option>Comedy</option>
        </select>

        <select value={year} onChange={(e) => setYear(e.target.value)} className="p-2 rounded bg-gray-700">
          <option>All</option>
          <option>2023</option>
          <option>2022</option>
        </select>

        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="p-2 rounded bg-gray-700">
          <option>All</option>
          <option>English</option>
          <option>French</option>
        </select>
      </div>

      {/* Movie Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMovies.map((movie) => (
          <Link
            key={movie.id}
            href={`/movie/${movie.id}`}
            className="bg-gray-700 p-4 rounded hover:bg-blue-600 transition"
          >
            {movie.title}
          </Link>
        ))}
      </div>
    </div>
  );
}
