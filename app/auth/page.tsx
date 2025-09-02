"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";


export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isLogin) {
        // Login with NextAuth
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          // Handle specific error types
          if (result.error === "CredentialsSignin") {
            setError("Invalid email or password. Please check your credentials and try again.");
          } else {
            setError("Login failed: " + result.error);
          }
        } else {
          router.push("/");
        }
      } else {
        // Register with your API
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            name: name || undefined,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Registration successful - show success message and auto-login
          setSuccess("Registration successful! You can now login immediately.");
          setIsLogin(true); // Switch to login form
          setPassword(""); // Clear password for security
          // Auto-focus email field for quick login
          setTimeout(() => {
            const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
            if (emailInput) emailInput.focus();
          }, 100);
        } else {
          setError(data.error || "Registration failed");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (err) {
      setError("Google login failed");
    }
  };

  return (
    <div className="auth-container">
      {/* Slanted Movie Posters Background */}
      <div className="movie-posters-bg">
        <div className="slanted-poster-image">
          <div className="poster-grid-image">
            <div className="poster-row">
              <img src="https://image.tmdb.org/t/p/w300/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg" alt="Star Wars" />
              <img src="https://image.tmdb.org/t/p/w300/e3xWnFiOOQMuiaiV2ErTGlyLYSL.jpg" alt="Empire Strikes Back" />
              <img src="https://image.tmdb.org/t/p/w300/mDCBQNhR6R0PVFucJl0O4HP5pKX.jpg" alt="Return of the Jedi" />
              <img src="https://image.tmdb.org/t/p/w300/e6bjQlQHBlKDlGw7HGR7lWFZZmf.jpg" alt="Phantom Menace" />
              <img src="https://image.tmdb.org/t/p/w300/oZNPzxqM2s5DyVWab09NTQScDQt.jpg" alt="Attack of the Clones" />
              <img src="https://image.tmdb.org/t/p/w300/xfSAoBEm9MNBjmlNcDYLvLSMlnq.jpg" alt="Revenge of the Sith" />
            </div>
            <div className="poster-row">
              <img src="https://image.tmdb.org/t/p/w300/wqnLdwVXoBjKibFRR5U3y0aDUhs.jpg" alt="Force Awakens" />
              <img src="https://image.tmdb.org/t/p/w300/kOVEVeg59E0wsnXmF9nrh6OmWII.jpg" alt="Last Jedi" />
              <img src="https://image.tmdb.org/t/p/w300/db32LaOibwEliAmSL2jjDF6oDdj.jpg" alt="Rise of Skywalker" />
              <img src="https://image.tmdb.org/t/p/w300/rNlpK8RgRZhHdgall0qRRU0xVDR.jpg" alt="Rogue One" />
              <img src="https://image.tmdb.org/t/p/w300/f4oZTcfGrVTXKTWg157AwikXqmP.jpg" alt="Solo" />
              <img src="https://image.tmdb.org/t/p/w300/rzRwTcFvttcN1ZpX2xv4j3tSdJu.jpg" alt="Mandalorian" />
            </div>
            <div className="poster-row">
              <img src="https://image.tmdb.org/t/p/w300/sv1xJUazXeYqALzczSZ3O6nkH75.jpg" alt="Blade Runner" />
              <img src="https://image.tmdb.org/t/p/w300/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg" alt="Blade Runner 2049" />
              <img src="https://image.tmdb.org/t/p/w300/BUVjYOm9qghVpd6KjYa9Lh1iAPF.jpg" alt="Matrix" />
              <img src="https://image.tmdb.org/t/p/w300/hEpWvX6Bp79eLxY1kX5ZZJcme5U.jpg" alt="Interstellar" />
              <img src="https://image.tmdb.org/t/p/w300/3zf8yrkaZI9nIyQ40jcr0GBk1CQ.jpg" alt="Dune" />
              <img src="https://image.tmdb.org/t/p/w300/qsdjk9oAKSQMWs0Vt5Pyfh6O4GZ.jpg" alt="Avatar" />
            </div>
            <div className="poster-row">
              <img src="https://image.tmdb.org/t/p/w300/1E5baAaEse26fej7uHcjOgEE2t2.jpg" alt="Guardians of the Galaxy" />
              <img src="https://image.tmdb.org/t/p/w300/5RbyHIVydD3Krmec1LlUV7rRjet.jpg" alt="Guardians 2" />
              <img src="https://image.tmdb.org/t/p/w300/r7vmZjiyZw9rpJMQJdXpjgiCOk9.jpg" alt="Thor" />
              <img src="https://image.tmdb.org/t/p/w300/oSouWnHu9PEL9fzivdTzrKcL7j4.jpg" alt="Avengers" />
              <img src="https://image.tmdb.org/t/p/w300/or06FN3Dka5tukK1e9sl16pB3iy.jpg" alt="Avengers Endgame" />
              <img src="https://image.tmdb.org/t/p/w300/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg" alt="Captain Marvel" />
            </div>
          </div>
        </div>
        <div className="poster-overlay"></div>
      </div>

      <div className="auth-form-container">
        <h1 className="auth-title">
          {isLogin ? "Login" : "Sign Up"}
        </h1>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <input
              type="text"
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="auth-input"
              disabled={loading}
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            required
            disabled={loading}
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
            disabled={loading}
            minLength={8}
          />
          
          <button 
            type="submit" 
            className={`button auth-submit ${loading ? '' : ''}`}
            disabled={loading}
          >
            {loading ? "Please wait..." : (isLogin ? "Login" : "Sign Up")}
          </button>
        </form>

        <div className="auth-toggle-container">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setSuccess("");
              setEmail("");
              setPassword("");
              setName("");
            }}
            className="auth-toggle-button"
            disabled={loading}
          >
            {isLogin ? "Create an account" : "Already have an account?"}
          </button>
        </div>

        {/* Social Login */}
        <div className="auth-divider">
          <span>or</span>
        </div>
        
        <div className="auth-social-container">
          <button 
            onClick={handleGoogleLogin}
            className="auth-social-button auth-social-google"
            disabled={loading}
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Link back to home */}
        <div className="auth-back-container">
          <button
            onClick={() => router.push("/")}
            className="auth-back-button"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}