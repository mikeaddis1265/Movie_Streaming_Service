// lib/tmdbapi.ts

interface MovieResult {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average: number;
  release_date: string;
  runtime?: number;
  genres?: Array<{ id: number; name: string }>;
  budget?: number;
  revenue?: number;
  tagline?: string;
  status?: string;
  adult?: boolean;
  original_language?: string;
  original_title?: string;
  popularity?: number;
  production_companies?: Array<{
    id: number;
    name: string;
    logo_path?: string;
  }>;
  production_countries?: Array<{ iso_3166_1: string; name: string }>;
  spoken_languages?: Array<{ iso_639_1: string; name: string }>;
  video?: boolean;
  vote_count?: number;
}

interface MovieListResponse {
  results: MovieResult[];
  // Add other properties as needed
}

interface GenreResult {
  id: number;
  name: string;
}

interface GenreListResponse {
  genres: GenreResult[];
}

const API_KEY = process.env.TMDB_API_KEY || "";
const ACCESS_TOKEN = process.env.TMDB_READ_ACCESS_TOKEN || "";
const BASE_URL = "https://api.themoviedb.org/3";

// TMDb supports two authentication methods:
// 1. API Key as query parameter: ?api_key=YOUR_KEY
// 2. Bearer token in Authorization header
const getAuthHeaders = () => {
  if (ACCESS_TOKEN) {
    return {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    };
  }
  return {};
};

const buildUrl = (endpoint: string, params?: Record<string, string>) => {
  const url = new URL(`${BASE_URL}${endpoint}`);

  // Add additional parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  // If we don't have access token, fall back to API key in query param
  if (!ACCESS_TOKEN && API_KEY) {
    url.searchParams.set("api_key", API_KEY);
  }

  return url.toString();
};

export const fetchMovies = async (): Promise<MovieListResponse> => {
  const url = buildUrl("/movie/popular");
  const response = await fetch(url, { 
    headers: getAuthHeaders(),
    // Add timeout and error handling
    signal: AbortSignal.timeout(10000) // 10 second timeout
  });
  if (!response.ok) {
    throw new Error(`Error fetching movies: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const fetchGenres = async (): Promise<GenreListResponse> => {
  const url = buildUrl("/genre/movie/list");
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error(`Error fetching genres: ${response.statusText}`);
  }
  return response.json();
};

export const fetchMovieDetails = async (
  movieId: string
): Promise<MovieResult> => {
  const url = buildUrl(`/movie/${movieId}`);
  const response = await fetch(url, { 
    headers: getAuthHeaders(),
    signal: AbortSignal.timeout(10000) // 10 second timeout
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Error fetching movie details for ${movieId}: ${response.status} ${response.statusText} ${text}`
    );
  }
  return response.json();
};

export const fetchTVDetails = async (tvId: string): Promise<any> => {
  const url = buildUrl(`/tv/${tvId}`);
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error(`Error fetching TV details: ${response.statusText}`);
  }
  return response.json();
};

export const fetchNowPlayingMovies = async (): Promise<MovieListResponse> => {
  const url = buildUrl("/movie/now_playing");
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error(
      `Error fetching now playing movies: ${response.statusText}`
    );
  }
  return response.json();
};

export const fetchTrendingMovies = async (
  timeWindow: "day" | "week" = "day"
): Promise<MovieListResponse> => {
  const url = buildUrl(`/trending/movie/${timeWindow}`);
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error(`Error fetching trending movies: ${response.statusText}`);
  }
  return response.json();
};

export const fetchTopRatedMovies = async (): Promise<MovieListResponse> => {
  const url = buildUrl("/movie/top_rated");
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error(`Error fetching top rated movies: ${response.statusText}`);
  }
  return response.json();
};

export const fetchMovieVideos = async (movieId: string) => {
  const url = buildUrl(`/movie/${movieId}/videos`);
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error(`Error fetching movie videos: ${response.statusText}`);
  }
  return response.json();
};

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
  order: number;
}

interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path?: string;
}

interface MovieCredits {
  cast: CastMember[];
  crew: CrewMember[];
}

export const fetchMovieCredits = async (
  movieId: string
): Promise<MovieCredits> => {
  const url = buildUrl(`/movie/${movieId}/credits`);
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Error fetching movie credits for ${movieId}: ${response.status} ${response.statusText} ${text}`
    );
  }
  return response.json();
};

export const fetchMovieRecommendations = async (
  movieId: string
): Promise<MovieListResponse> => {
  const url = buildUrl(`/movie/${movieId}/recommendations`);
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error(
      `Error fetching movie recommendations: ${response.statusText}`
    );
  }
  return response.json();
};

export const discoverMovies = async (params: {
  with_genres?: string;
  primary_release_year?: string;
  with_original_language?: string;
  with_origin_country?: string;
  page?: number;
}): Promise<MovieListResponse> => {
  const stringParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      stringParams[key] = String(value);
    }
  });

  const url = buildUrl("/discover/movie", stringParams);
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error(`Error discovering movies: ${response.statusText}`);
  }
  return response.json();
};

export const discoverTV = async (params: {
  with_genres?: string;
  first_air_date_year?: string;
  with_original_language?: string;
  page?: number;
}): Promise<MovieListResponse> => {
  const stringParams: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      stringParams[key] = String(value);
    }
  });

  const url = buildUrl("/discover/tv", stringParams);
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error(`Error discovering TV shows: ${response.statusText}`);
  }
  return response.json();
};

interface SearchOptions {
  query: string;
  page?: number;
  include_adult?: boolean;
}

export const searchMovies = async (
  options: SearchOptions
): Promise<MovieListResponse> => {
  const params: Record<string, string> = {
    query: encodeURIComponent(options.query),
    page: String(options.page || 1),
  };

  if (options.include_adult !== undefined) {
    params.include_adult = String(options.include_adult);
  }

  const url = buildUrl("/search/movie", params);
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error(`Error searching movies: ${response.statusText}`);
  }
  return response.json();
};

export const searchTVShows = async (
  options: SearchOptions
): Promise<MovieListResponse> => {
  const params: Record<string, string> = {
    query: encodeURIComponent(options.query),
    page: String(options.page || 1),
  };

  if (options.include_adult !== undefined) {
    params.include_adult = String(options.include_adult);
  }

  const url = buildUrl("/search/tv", params);
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error(`Error searching TV shows: ${response.statusText}`);
  }
  return response.json();
};

export const searchMulti = async (
  options: SearchOptions
): Promise<MovieListResponse> => {
  const params: Record<string, string> = {
    query: encodeURIComponent(options.query),
    page: String(options.page || 1),
  };

  if (options.include_adult !== undefined) {
    params.include_adult = String(options.include_adult);
  }

  const url = buildUrl("/search/multi", params);
  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    throw new Error(`Error searching multi: ${response.statusText}`);
  }
  return response.json();
};
