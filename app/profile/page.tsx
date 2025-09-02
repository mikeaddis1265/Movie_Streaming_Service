"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Footer from "@/app/components/ui/Footer";
import SkeletonLoader from "@/app/components/ui/SkeletonLoader";

interface Movie {
  id: number;
  title: string;
  poster_path?: string | null;
  vote_average?: number | null;
  release_date?: string;
  progress?: number;
  watchedAt?: string;
}

interface UserProfile {
  id: string;
  name?: string;
  email: string;
  role: string;
  profilePicture?: string;
  createdAt: string;
  subscription?: {
    planName: string;
    status: string;
    expiresAt?: string;
  };
}


export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [continueWatching, setContinueWatching] = useState<Movie[]>([]);
  const [watchHistory, setWatchHistory] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [removingFromWatchlist, setRemovingFromWatchlist] = useState<Set<number>>(new Set());
  const [watchlistMessage, setWatchlistMessage] = useState<string | null>(null);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [profilePicMessage, setProfilePicMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth");
      return;
    }

    if (session?.user?.id) {
      loadProfileData();
    }
  }, [session, status, router]);

  const loadProfileData = async () => {
    if (!session?.user?.id) return;

    try {
      setLoading(true);
      setError(null); // Clear any previous errors

      console.log("Loading profile data for user:", session.user.id);

      // First, sync user to database if they don't exist (for OAuth users)
      try {
        const syncResponse = await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const syncData = await syncResponse.json();
        console.log("User sync result:", syncData);
      } catch (syncError) {
        console.log('User sync failed, continuing anyway:', syncError);
      }

      // Load all data in parallel with error handling
      const [
        profileResponse,
        favoritesResponse,
        watchlistResponse,
        continueResponse,
        historyResponse,
      ] = await Promise.allSettled([
        // Profile info with subscription status
        fetch(`/api/users/${session.user.id}/subscriptions`)
          .then((r) => r.json())
          .catch((err) => {
            console.log("Profile API error:", err);
            return { data: null };
          }),
        // User's favorites
        fetch(`/api/users/${session.user.id}/favorites`)
          .then((r) => r.json())
          .catch((err) => {
            console.log("Favorites API error:", err);
            return { data: [] };
          }),
        // User's watchlist
        fetch(`/api/users/${session.user.id}/watchlist`)
          .then((r) => {
            console.log("Watchlist API response status:", r.status);
            return r.json();
          })
          .then((data) => {
            console.log("Watchlist API data:", data);
            return data;
          })
          .catch((err) => {
            console.log("Watchlist API error:", err);
            return { data: [] };
          }),
        // Continue watching
        fetch(`/api/users/${session.user.id}/continue-watching`)
          .then((r) => r.json())
          .catch((err) => {
            console.log("Continue watching API error:", err);
            return { data: [] };
          }),
        // Viewing history
        fetch(`/api/users/${session.user.id}/viewing-history`)
          .then((r) => r.json())
          .catch((err) => {
            console.log("Viewing history API error:", err);
            return { data: [] };
          }),
      ]);

      // Extract successful responses with better error handling
      const getResponseData = (result: any) => {
        if (result.status === "fulfilled") {
          try {
            return result.value;
          } catch (err) {
            console.log("Error processing response:", err);
            return { data: null };
          }
        } else {
          console.log("Promise rejected:", result.reason);
          return { data: null };
        }
      };

      const profileData = getResponseData(profileResponse);
      const favoritesData = getResponseData(favoritesResponse);
      const watchlistData = getResponseData(watchlistResponse);
      const continueData = getResponseData(continueResponse);
      const historyData = getResponseData(historyResponse);

      console.log("API Response data:", {
        profileData,
        favoritesData,
        watchlistData,
        continueData,
        historyData,
      });

      // Set profile data with safe defaults
      const userProfile = {
        id: session.user.id,
        name: session.user.name || undefined,
        email: session.user.email || "",
        role: session.user.role || "user",
        profilePicture: profileData?.data?.user?.profilePicture || session.user.image,
        createdAt: new Date().toISOString(),
        subscription: profileData?.data?.subscription
          ? {
              planName: "Premium", // Default for now
              status: profileData.data.hasSubscription ? "active" : "inactive",
              expiresAt: profileData.data.subscription?.currentPeriodEnd,
            }
          : undefined,
      };

      console.log("Setting profile:", userProfile);
      setProfile(userProfile);


      // Set movie lists with safe defaults
      const safeFavorites = Array.isArray(favoritesData?.data)
        ? favoritesData.data.slice(0, 10)
        : [];
      const safeWatchlist = Array.isArray(watchlistData?.data)
        ? watchlistData.data.slice(0, 10)
        : [];
      const safeContinueWatching = Array.isArray(continueData?.data)
        ? continueData.data.slice(0, 10)
        : [];
      // Process watch history - need to fetch movie details
      let safeWatchHistory: Movie[] = [];
      if (Array.isArray(historyData?.data) && historyData.data.length > 0) {
        try {
          const historyItems = historyData.data.slice(0, 10);
          const moviePromises = historyItems.map(async (item: any) => {
            try {
              const response = await fetch(`/api/movies/${item.tmdbId}`);
              if (response.ok) {
                const movieData = await response.json();
                return {
                  ...movieData.data,
                  watchedAt: item.watchedAt,
                  progress: item.progress
                };
              }
            } catch (err) {
              console.log(`Failed to fetch movie ${item.tmdbId}:`, err);
            }
            return null;
          });
          
          const movieResults = await Promise.all(moviePromises);
          safeWatchHistory = movieResults.filter(movie => movie !== null) as Movie[];
        } catch (err) {
          console.log("Failed to process watch history:", err);
          safeWatchHistory = [];
        }
      }

      console.log("Setting movie lists:", {
        favorites: safeFavorites.length,
        watchlist: safeWatchlist.length,
        continueWatching: safeContinueWatching.length,
        watchHistory: safeWatchHistory.length,
      });

      setFavorites(safeFavorites);
      setWatchlist(safeWatchlist);
      setContinueWatching(safeContinueWatching);
      setWatchHistory(safeWatchHistory);

      console.log("Profile data loaded successfully");
    } catch (err) {
      console.error("Failed to load profile data:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleRemoveFromWatchlist = async (movieId: number) => {
    if (!session?.user?.id || removingFromWatchlist.has(movieId)) return;

    try {
      setRemovingFromWatchlist(prev => new Set(prev).add(movieId));

      const response = await fetch(
        `/api/users/${session.user.id}/watchlist/${movieId}?mediaType=movie`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove from watchlist");
      }

      // Remove from local state immediately
      setWatchlist(prev => prev.filter(movie => movie.id !== movieId));
      
      // Show success message
      setWatchlistMessage("Removed from watchlist!");
      setTimeout(() => setWatchlistMessage(null), 3000);
    } catch (err) {
      console.error("Failed to remove from watchlist:", err);
      
      // Show error message
      setWatchlistMessage("Failed to remove from watchlist. Please try again.");
      setTimeout(() => setWatchlistMessage(null), 3000);
    } finally {
      setRemovingFromWatchlist(prev => {
        const newSet = new Set(prev);
        newSet.delete(movieId);
        return newSet;
      });
    }
  };

  const getImageUrl = (posterPath: string | null | undefined) => {
    return posterPath
      ? `https://image.tmdb.org/t/p/w500${posterPath}`
      : "/placeholder-movie.jpg";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const isAdmin = profile?.role === "ADMIN";

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !session?.user?.id) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setProfilePicMessage('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      setTimeout(() => setProfilePicMessage(null), 3000);
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setProfilePicMessage('File size must be less than 5MB');
      setTimeout(() => setProfilePicMessage(null), 3000);
      return;
    }

    try {
      setUploadingProfilePic(true);
      setProfilePicMessage(null);

      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch(`/api/users/${session.user.id}/profile-picture`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload profile picture');
      }

      const result = await response.json();
      
      // Update local profile state
      setProfile(prev => prev ? { ...prev, profilePicture: result.data.profilePicture } : null);
      
      setProfilePicMessage('Profile picture updated successfully!');
      setTimeout(() => setProfilePicMessage(null), 3000);
    } catch (error) {
      console.error('Profile picture upload error:', error);
      setProfilePicMessage('Failed to update profile picture. Please try again.');
      setTimeout(() => setProfilePicMessage(null), 3000);
    } finally {
      setUploadingProfilePic(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!session?.user?.id) return;

    try {
      setUploadingProfilePic(true);
      setProfilePicMessage(null);

      const response = await fetch(`/api/users/${session.user.id}/profile-picture`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove profile picture');
      }

      // Update local profile state
      setProfile(prev => prev ? { ...prev, profilePicture: undefined } : null);
      
      setProfilePicMessage('Profile picture removed successfully!');
      setTimeout(() => setProfilePicMessage(null), 3000);
    } catch (error) {
      console.error('Profile picture removal error:', error);
      setProfilePicMessage('Failed to remove profile picture. Please try again.');
      setTimeout(() => setProfilePicMessage(null), 3000);
    } finally {
      setUploadingProfilePic(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="profile-page">
          {/* Profile Hero Skeleton */}
          <div className="profile-hero">
            <div className="profile-hero-background">
              <div className="hero-gradient"></div>
            </div>
            <div className="profile-hero-content">
              <div className="profile-avatar-section">
                <div className="profile-avatar">
                  <div className="avatar-container">
                    <div className="skeleton-text" style={{ width: '80px', height: '80px', borderRadius: '50%' }}></div>
                  </div>
                </div>
                <div className="profile-info">
                  <div className="skeleton-text" style={{ width: '200px', height: '2rem', marginBottom: '1rem' }}></div>
                  <div className="skeleton-text" style={{ width: '150px', height: '1rem', marginBottom: '0.5rem' }}></div>
                  <div className="skeleton-text" style={{ width: '120px', height: '1rem' }}></div>
                </div>
              </div>
              <div className="profile-actions">
                <div className="skeleton-button"></div>
                <div className="skeleton-button"></div>
              </div>
            </div>
          </div>

          {/* Profile Content Skeleton */}
          <div className="profile-content">
            <div className="content-sections">
              <div className="movie-section">
                <div className="skeleton-section-header"></div>
                <SkeletonLoader count={5} type="movie-card" />
              </div>
              <div className="movie-section">
                <div className="skeleton-section-header"></div>
                <SkeletonLoader count={5} type="movie-card" />
              </div>
              <div className="movie-section">
                <div className="skeleton-section-header"></div>
                <SkeletonLoader count={5} type="movie-card" />
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    // Fallback: Create a basic profile from session data if available
    if (session?.user && !profile) {
      const fallbackProfile = {
        id: session.user.id,
        name: session.user.name || "User",
        email: session.user.email || "",
        role: session.user.role || "user",
        createdAt: new Date().toISOString(),
        subscription: undefined,
      };

      console.log("Using fallback profile:", fallbackProfile);
      setProfile(fallbackProfile);
      setLoading(false);
      return null; // Let the component re-render with the fallback profile
    }

    return (
      <div className="profile-error">
        <div className="error-content">
          <h2>Unable to Load Profile</h2>
          <p>{error || "Profile not found"}</p>
          <button onClick={() => router.push("/")} className="btn-primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Hero Section */}
      <div className="profile-hero">
        <div className="profile-hero-background">
          <div className="hero-gradient"></div>
        </div>

        <div className="profile-hero-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              <div className="avatar-container">
                {profile.profilePicture ? (
                  <Image
                    src={profile.profilePicture}
                    alt={profile.name || 'Profile'}
                    width={120}
                    height={120}
                    className="profile-picture"
                  />
                ) : (
                  <div className="avatar-initial">
                    {profile.name?.[0]?.toUpperCase() ||
                      profile.email[0].toUpperCase()}
                  </div>
                )}
                
                {/* Profile Picture Upload Controls */}
                <div className="avatar-controls">
                  <label htmlFor="profile-picture-upload" className="avatar-upload-btn" title="Change profile picture">
                    {uploadingProfilePic ? (
                      <span className="loading-content">
                        <span className="spinner"></span>
                      </span>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 16V8M8 12L12 8L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 16.5V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </label>
                  <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleProfilePictureUpload}
                    disabled={uploadingProfilePic}
                    className="hidden"
                  />
                  
                  {profile.profilePicture && (
                    <button
                      onClick={handleRemoveProfilePicture}
                      disabled={uploadingProfilePic}
                      className="avatar-remove-btn"
                      title="Remove profile picture"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0v14m8-14v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>
                
                {isAdmin && (
                  <div className="admin-badge">
                    <span>👑 Admin</span>
                  </div>
                )}
                {profile.subscription?.status === "active" && !isAdmin && (
                  <div className="premium-badge">
                    <span>⭐ Premium</span>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-info">
              <h1 className="profile-name">{profile.name || "Movie Lover"}</h1>
              <p className="profile-email">{profile.email}</p>
              <p className="profile-member-since">
                Member since {formatDate(profile.createdAt)}
              </p>

              {profile.subscription && !isAdmin && (
                <div className="subscription-status">
                  <div
                    className={`status-indicator ${profile.subscription.status}`}
                  >
                    <span className="status-dot"></span>
                    <span className="status-text">
                      {profile.subscription.status === "active"
                        ? "Active Subscription"
                        : "No Active Plan"}
                    </span>
                  </div>
                  {profile.subscription.expiresAt && (
                    <p className="subscription-expires">
                      {profile.subscription.status === "active"
                        ? "Renews"
                        : "Expired"}{" "}
                      on {formatDate(profile.subscription.expiresAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>


          {/* Action Buttons */}
          <div className="profile-actions">
            {isAdmin && (
              <Link href="/admin" className="btn-primary">
                Admin Dashboard
              </Link>
            )}
            {!isAdmin && (
              <Link href="/subscription" className="btn-primary">
                {profile.subscription?.status === "active"
                  ? "Manage Subscription"
                  : "Subscription"}
              </Link>
            )}
            <button onClick={handleSignOut} className="btn-secondary">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        <div className="content-sections">
              {continueWatching.length > 0 && (
                <div className="movie-section">
                  <div className="section-header">
                    <h2>Continue Watching</h2>
                  </div>
                  <div className="movie-row">
                    {continueWatching.map((movie) => (
                      <Link
                        key={movie.id}
                        href={`/details/${movie.id}`}
                        className="movie-card"
                      >
                        <div className="movie-poster">
                          <Image
                            src={getImageUrl(movie.poster_path)}
                            alt={movie.title}
                            fill
                            className="poster-image"
                          />
                          {movie.progress && (
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${movie.progress}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                        <div className="movie-info">
                          <h3>{movie.title}</h3>
                          <p>⭐ {movie.vote_average?.toFixed(1) || "N/A"}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {watchlist.length > 0 && (
                <div className="movie-section">
                  <div className="section-header">
                    <h2>My Watchlist</h2>
                  </div>
                  <div className="movie-row">
                    {watchlist.map((movie) => (
                      <div key={movie.id} className="movie-card-wrapper">
                        <Link
                          href={`/details/${movie.id}`}
                          className="movie-card"
                        >
                          <div className="movie-poster">
                            <Image
                              src={getImageUrl(movie.poster_path)}
                              alt={movie.title}
                              fill
                              className="poster-image"
                            />
                            <div className="watchlist-badge">📋</div>
                          </div>
                          <div className="movie-info">
                            <h3>{movie.title}</h3>
                            <p>⭐ {movie.vote_average?.toFixed(1) || "N/A"}</p>
                          </div>
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveFromWatchlist(movie.id);
                          }}
                          disabled={removingFromWatchlist.has(movie.id)}
                          className={`watchlist-remove-btn ${
                            removingFromWatchlist.has(movie.id) ? "loading" : ""
                          }`}
                          title="Remove from watchlist"
                        >
                          {removingFromWatchlist.has(movie.id) ? (
                            <span className="loading-content">
                              <span className="spinner"></span>
                            </span>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0v14m8-14v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {watchHistory.length > 0 && (
                <div className="movie-section">
                  <div className="section-header">
                    <h2>Recently Watched</h2>
                  </div>
                  <div className="movie-row">
                    {watchHistory.map((movie) => (
                      <Link
                        key={movie.id}
                        href={`/details/${movie.id}`}
                        className="movie-card"
                      >
                        <div className="movie-poster">
                          <Image
                            src={getImageUrl(movie.poster_path)}
                            alt={movie.title}
                            fill
                            className="poster-image"
                          />
                          <div className="watched-badge">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                          {movie.progress && movie.progress > 0 && (
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${Math.min(movie.progress, 100)}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                        <div className="movie-info">
                          <h3>{movie.title}</h3>
                          <p>⭐ {movie.vote_average?.toFixed(1) || "N/A"}</p>
                          {movie.watchedAt && (
                            <p className="watched-date">
                              {new Date(movie.watchedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {favorites.length > 0 && (
                <div className="movie-section">
                  <div className="section-header">
                    <h2>My Favorites</h2>
                  </div>
                  <div className="movie-row">
                    {favorites.map((movie) => (
                      <Link
                        key={movie.id}
                        href={`/details/${movie.id}`}
                        className="movie-card"
                      >
                        <div className="movie-poster">
                          <Image
                            src={getImageUrl(movie.poster_path)}
                            alt={movie.title}
                            fill
                            className="poster-image"
                          />
                          <div className="favorite-badge">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                          </div>
                        </div>
                        <div className="movie-info">
                          <h3>{movie.title}</h3>
                          <p>⭐ {movie.vote_average?.toFixed(1) || "N/A"}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

        </div>
      </div>

      {/* Toast notifications */}
      {watchlistMessage && (
        <div className={`profile-toast ${watchlistMessage.includes('Failed') ? 'error' : 'success'}`}>
          {watchlistMessage}
        </div>
      )}
      
      {profilePicMessage && (
        <div className={`profile-toast ${profilePicMessage.includes('Failed') || profilePicMessage.includes('Please') ? 'error' : 'success'}`}>
          {profilePicMessage}
        </div>
      )}
      
      <Footer />
    </div>
  );
}
