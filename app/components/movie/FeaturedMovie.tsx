g"use client";

import Link from "next/link";

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path?: string;
  vote_average: number;
  release_date: string;
}

interface FeaturedMovieProps {
  movie: Movie;
}

const FeaturedMovie = ({ movie }: FeaturedMovieProps) => {
  if (!movie) return null;

  // Use Star Wars backdrop image instead of movie backdrop
  const starWarsBackdrop = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";

  return (
    <div 
      className="featured-movie hero-section"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 40%, rgba(59,130,246,0.1) 70%, rgba(0,0,0,0.7) 100%), url(${starWarsBackdrop})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0',
        padding: '80px 40px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated stars background */}
      <div className="stars-bg" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(2px 2px at 20px 30px, #eee, transparent), radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 90px 40px, #fff, transparent), radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent), radial-gradient(2px 2px at 160px 30px, #ddd, transparent)',
        backgroundRepeat: 'repeat',
        backgroundSize: '200px 100px',
        animation: 'sparkle 20s linear infinite',
        opacity: 0.6
      }} />
      
      <div className="hero-content" style={{ 
        maxWidth: '800px', 
        color: 'white', 
        textAlign: 'center', 
        zIndex: 2, 
        position: 'relative',
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)',
        padding: '60px 40px',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 32px 64px rgba(0,0,0,0.5)'
      }}>
        <h1 style={{ 
          fontSize: '64px', 
          fontWeight: '900', 
          marginBottom: '24px',
          background: 'linear-gradient(135deg, #ffffff 0%, #60a5fa 50%, #3b82f6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>
          Welcome to CinemaStream
        </h1>
        
        <p style={{ 
          fontSize: '22px', 
          lineHeight: '1.6', 
          marginBottom: '40px', 
          color: 'rgba(255,255,255,0.9)',
          fontWeight: '400'
        }}>
          Discover endless entertainment with our premium streaming service. 
          Watch the latest blockbusters, timeless classics, and exclusive content.
        </p>

        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link 
            href="/browse" 
            className="hero-button-primary" 
            style={{ 
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              border: 'none',
              borderRadius: '16px',
              color: 'white',
              fontSize: '18px',
              fontWeight: '700',
              padding: '18px 32px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 12px 35px rgba(59, 130, 246, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            🚀 Start Watching
          </Link>
          
          <Link 
            href={`/details/${movie.id}`} 
            className="hero-button-secondary"
            style={{ 
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '16px',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
              padding: '18px 32px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            ℹ️ Learn More
          </Link>
        </div>

        <div style={{ 
          marginTop: '40px',
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          fontSize: '16px',
          color: 'rgba(255,255,255,0.7)'
        }}>
          <span>✨ 4K Quality</span>
          <span>📱 Multi-Device</span>
          <span>🔄 Unlimited Access</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes sparkle {
          from { transform: translateX(0); }
          to { transform: translateX(200px); }
        }
        
        .hero-button-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 45px rgba(59, 130, 246, 0.6);
        }
        
        .hero-button-secondary:hover {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.3);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default FeaturedMovie;
