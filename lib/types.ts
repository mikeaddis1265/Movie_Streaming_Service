// Shared TypeScript types for the movie streaming service

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average: number;
  vote_count: number;
  release_date: string;
  runtime?: number;
  budget?: number;
  revenue?: number;
  status?: string;
  tagline?: string;
  adult: boolean;
  original_language: string;
  original_title: string;
  popularity: number;
  genre_ids?: number[];
  genres?: Genre[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetails extends Movie {
  genres: Genre[];
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  spoken_languages: SpokenLanguage[];
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

export interface TMDbResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: 'user' | 'admin';
  emailVerified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  movieId: string;
  createdAt: Date;
  movie?: Movie;
}

export interface WatchHistory {
  id: string;
  userId: string;
  movieId: string;
  progress: number; // seconds watched
  lastWatched: Date;
  createdAt: Date;
  updatedAt: Date;
  movie?: Movie;
}

export interface Rating {
  id: string;
  userId: string;
  movieId: string;
  score: number;
  user?: User;
  movie?: Movie;
}

export interface Review {
  id: string;
  userId: string;
  movieId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  movie?: Movie;
}

export interface Subscription {
  id: string;
  userId: string;
  status: 'active' | 'inactive' | 'trial' | 'cancelled';
  plan: 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date | null;
  user?: User;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  name?: string;
}

export interface ResetPasswordForm {
  token: string;
  password: string;
}