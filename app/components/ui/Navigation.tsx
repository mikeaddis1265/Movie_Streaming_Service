"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="navigation">
      <div className="navigation-container">
        <div className="navigation-content">
          {/* Logo/Brand */}
          <Link href="/" className="navigation-logo">
            MovieStream
          </Link>

          {/* Navigation Links */}
          <div className="navigation-links">
            <Link href="/" className="navigation-link">
              Home
            </Link>
            <Link href="/browse" className="navigation-link">
              Browse
            </Link>
            <Link href="/search" className="navigation-link">
              Search
            </Link>

            {/* Auth Section */}
            {session ? (
              <div className="navigation-auth">
                <span className="navigation-welcome">
                  Welcome, {session.user?.name || session.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="navigation-logout"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/auth" className="navigation-login">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}