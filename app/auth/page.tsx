"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import "./auth.css";

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

        {/* Social Logins */}
        <div className="auth-social-container">
          <button 
            onClick={handleGoogleLogin}
            className="auth-social-button auth-social-google"
            disabled={loading}
          >
            Google
          </button>
          <button 
            className="auth-social-button auth-social-facebook"
            disabled
            title="Facebook login not implemented yet"
          >
            Facebook
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