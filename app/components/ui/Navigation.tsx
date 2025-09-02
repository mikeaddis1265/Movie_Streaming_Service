"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";

interface UserSubscription {
  hasSubscription: boolean;
  subscription: {
    planId: string;
    status: string;
  } | null;
}

export default function Navigation() {
  const { data: session } = useSession();
  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const genreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) {
        setIsGenreOpen(false);
      }
    }
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserSubscription();
    }
  }, [session]);

  useEffect(() => {
    const handleSubscriptionUpdate = () => {
      if (session?.user?.id) {
        fetchUserSubscription();
      }
    };

    window.addEventListener('subscription-updated', handleSubscriptionUpdate);
    return () => window.removeEventListener('subscription-updated', handleSubscriptionUpdate);
  }, [session]);

  const fetchUserSubscription = async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch(`/api/users/${session.user.id}/subscriptions`);
      if (response.ok) {
        const data = await response.json();
        setUserSubscription(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const handleGenreMouseEnter = () => {
    setIsGenreOpen(true);
  };

  const handleGenreMouseLeave = () => {
    setIsGenreOpen(false);
  };


  const genres = useMemo(
    () => [
      // TMDb Movie genres with IDs
      { name: "Action", id: 28 },
      { name: "Adventure", id: 12 },
      { name: "Animation", id: 16 },
      { name: "Comedy", id: 35 },
      { name: "Crime", id: 80 },
      { name: "Documentary", id: 99 },
      { name: "Drama", id: 18 },
      { name: "Family", id: 10751 },
      { name: "Fantasy", id: 14 },
      { name: "History", id: 36 },
      { name: "Horror", id: 27 },
      { name: "Music", id: 10402 },
      { name: "Mystery", id: 9648 },
      { name: "Romance", id: 10749 },
      { name: "Science Fiction", id: 878 },
      { name: "TV Movie", id: 10770 },
      { name: "Thriller", id: 53 },
      { name: "War", id: 10752 },
      { name: "Western", id: 37 },
      // Non-movie or special categories (fallback without id)
      { name: "Biography" },
      { name: "Kids" },
      { name: "News" },
      { name: "Reality" },
      { name: "Sci-Fi & Fantasy" },
      { name: "Soap" },
      { name: "Talk" },
      { name: "War & Politics" },
    ],
    []
  );


  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `/search?q=${encodeURIComponent(
      searchQuery.trim()
    )}`;
  };

  return (
    <nav className="ms-header">
      <div className="ms-header-container">
        {/* Left: Logo */}
        <div className="ms-header-left">
          <Link href="/" className="ms-logo">
            <span className="ms-logo-hd">Movie</span>
            <span className="ms-logo-today">Stream</span>
          </Link>
        </div>

        {/* Middle: Nav Links */}
        <div className="ms-header-center">
          <Link href="/" className="ms-nav-link">
            Home
          </Link>

          <Link href="/browse?type=movie" className="ms-nav-link">
            Movies
          </Link>
          
          <Link href="/browse?type=tv" className="ms-nav-link">
            TV Shows
          </Link>

          <div className="ms-hover-nav" ref={genreRef} onMouseEnter={handleGenreMouseEnter} onMouseLeave={handleGenreMouseLeave}>
            <div className="ms-nav-link">
              Genre
            </div>
            <div 
              className={`ms-hover-rectangle ${isGenreOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
            >
              <div className="ms-hover-grid">
                {genres.map((g) => (
                  <Link
                    key={g.name}
                    href={
                      g.id
                        ? `/browse?genre=${encodeURIComponent(
                            g.name
                          )}&genreId=${g.id}`
                        : `/browse?genre=${encodeURIComponent(g.name)}`
                    }
                    className="ms-hover-item"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Search + Auth */}
        <div className="ms-header-right">
          <form className="ms-search" onSubmit={onSubmitSearch} role="search">
            <div className="search-container">
              <input
                type="text"
                className="ms-search-input"
                placeholder="Search movies & TV shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search movies or TV shows"
              />
              <button type="submit" className="search-button" aria-label="Search">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </form>

          {session ? (
            <div className="ms-user-section">
              {userSubscription?.hasSubscription && session.user.role !== "ADMIN" && (
                <span className="ms-premium-badge">⭐ Premium</span>
              )}
              {session.user.role === "ADMIN" && (
                <span className="ms-admin-badge">👑 Admin</span>
              )}
              {!userSubscription?.hasSubscription && session.user.role !== "ADMIN" && (
                <Link href="/subscription" className="ms-get-premium">
                  Get Premium
                </Link>
              )}
              <Link href="/profile" className="ms-welcome">
                {session.user?.name || session.user?.email || "Profile"}
              </Link>
            </div>
          ) : (
            <Link href="/auth" className="ms-login">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
