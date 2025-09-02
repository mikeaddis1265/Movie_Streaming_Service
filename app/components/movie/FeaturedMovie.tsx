"use client";

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

  return (
    <div 
      className="featured-movie hero-section"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #0f0f0f 50%, #1a1a1a 75%, #0a0a0a 100%)',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0',
        padding: '100px 40px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Star Wars Animated Background */}
      <div className="starfield" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        overflow: 'hidden'
      }}>
        {/* Layer 1 - Small distant stars */}
        <div className="stars stars-small" style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(2px 2px at 20px 30px, #fff, transparent),
            radial-gradient(2px 2px at 40px 70px, #fff, transparent),
            radial-gradient(1px 1px at 90px 40px, #fff, transparent),
            radial-gradient(1px 1px at 130px 80px, #fff, transparent),
            radial-gradient(2px 2px at 160px 30px, #fff, transparent),
            radial-gradient(1px 1px at 200px 90px, #fff, transparent),
            radial-gradient(1px 1px at 260px 120px, #fff, transparent),
            radial-gradient(2px 2px at 320px 40px, #fff, transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '350px 250px',
          animation: 'moveStars 50s linear infinite',
          opacity: 0.8
        }}></div>

        {/* Layer 2 - Medium stars */}
        <div className="stars stars-medium" style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(3px 3px at 30px 50px, rgba(135,206,250,0.8), transparent),
            radial-gradient(2px 2px at 80px 90px, rgba(255,255,255,0.9), transparent),
            radial-gradient(3px 3px at 150px 30px, rgba(135,206,250,0.7), transparent),
            radial-gradient(2px 2px at 220px 110px, rgba(255,255,255,0.8), transparent),
            radial-gradient(3px 3px at 280px 60px, rgba(135,206,250,0.6), transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '300px 200px',
          animation: 'moveStars 35s linear infinite',
          opacity: 0.6
        }}></div>

        {/* Layer 3 - Large bright stars */}
        <div className="stars stars-large" style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(4px 4px at 50px 80px, rgba(255,255,255,0.9), rgba(255,255,255,0.1) 50%, transparent),
            radial-gradient(3px 3px at 120px 40px, rgba(135,206,250,0.8), rgba(135,206,250,0.1) 50%, transparent),
            radial-gradient(5px 5px at 200px 100px, rgba(255,255,255,1), rgba(255,255,255,0.2) 40%, transparent),
            radial-gradient(4px 4px at 290px 20px, rgba(135,206,250,0.9), rgba(135,206,250,0.1) 50%, transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '350px 150px',
          animation: 'moveStars 25s linear infinite',
          opacity: 0.4
        }}></div>

        {/* Twinkling stars effect */}
        <div className="twinkling-stars" style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(1px 1px at 25px 25px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 75px 75px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 125px 125px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 175px 175px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 225px 225px, rgba(255,255,255,0.8), transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '250px 250px',
          animation: 'twinkle 4s ease-in-out infinite alternate'
        }}></div>
      </div>

      {/* Space nebula effect */}
      <div className="nebula" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 20%, rgba(59,130,246,0.15) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(139,92,246,0.12) 0%, transparent 50%),
          radial-gradient(circle at 40% 90%, rgba(16,185,129,0.08) 0%, transparent 40%)
        `,
        animation: 'nebulaDrift 60s ease-in-out infinite alternate',
        zIndex: 2
      }}></div>
      
      <div className="hero-content" style={{ 
        maxWidth: '900px', 
        color: 'white', 
        textAlign: 'center', 
        zIndex: 10, 
        position: 'relative',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(15px)',
        padding: '80px 60px',
        borderRadius: '30px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}>
        <div style={{ marginBottom: '12px' }}>
          <span style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '25px',
            padding: '8px 24px',
            fontSize: '14px',
            fontWeight: '600',
            color: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(10px)',
            letterSpacing: '0.5px'
          }}>
            PREMIUM STREAMING EXPERIENCE
          </span>
        </div>
        
        <h1 style={{ 
          fontSize: '72px', 
          fontWeight: '800', 
          marginBottom: '32px',
          background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 30%, #cbd5e1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.03em',
          lineHeight: '1.1'
        }}>
          CineStream
        </h1>
        
        <p style={{ 
          fontSize: '24px', 
          lineHeight: '1.7', 
          marginBottom: '50px', 
          color: 'rgba(255,255,255,0.85)',
          fontWeight: '300',
          maxWidth: '700px',
          margin: '0 auto 50px auto'
        }}>
          Immerse yourself in a world of cinematic excellence. Stream thousands of movies, 
          from Hollywood blockbusters to indie masterpieces, all in stunning quality.
        </p>

        <div style={{ 
          display: 'flex', 
          gap: '24px', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '50px'
        }}>
          <Link 
            href="/browse" 
            className="hero-button-primary" 
            style={{ 
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              border: 'none',
              borderRadius: '18px',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
              padding: '20px 40px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 15px 40px rgba(59, 130, 246, 0.3)',
              position: 'relative',
              overflow: 'hidden',
              letterSpacing: '0.5px',
              minWidth: '200px'
            }}
          >
            Start Streaming
          </Link>
          
          <Link 
            href={`/details/${movie.id}`} 
            className="hero-button-secondary"
            style={{ 
              background: 'rgba(255,255,255,0.08)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '18px',
              color: 'white',
              fontSize: '18px',
              fontWeight: '500',
              padding: '20px 40px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              letterSpacing: '0.5px',
              minWidth: '200px'
            }}
          >
            Explore Movies
          </Link>
        </div>

        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          gap: '40px',
          fontSize: '16px',
          color: 'rgba(255,255,255,0.6)',
          fontWeight: '400'
        }}>
          <span>Ultra HD Quality</span>
          <span>Multi-Device Streaming</span>
          <span>Unlimited Access</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes moveStars {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(-100px) translateY(-50px); }
        }
        
        @keyframes twinkle {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        
        @keyframes nebulaDrift {
          0% { 
            transform: rotate(0deg) scale(1);
            opacity: 0.8;
          }
          50% { 
            transform: rotate(180deg) scale(1.1);
            opacity: 0.6;
          }
          100% { 
            transform: rotate(360deg) scale(1);
            opacity: 0.8;
          }
        }
        
        .hero-button-primary:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 20px 50px rgba(59, 130, 246, 0.5);
          background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
        }
        
        .hero-button-secondary:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.25);
          transform: translateY(-3px) scale(1.02);
        }
        
        /* Star Wars hyperspace effect on button hover */
        .hero-button-primary:hover::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: translateX(-100%);
          animation: hyperspace 0.6s ease-out;
        }
        
        @keyframes hyperspace {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .hero-content {
            padding: 60px 30px !important;
            max-width: 95% !important;
          }
          
          .stars {
            animation-duration: 20s !important;
          }
          
          .twinkling-stars {
            animation-duration: 2s !important;
          }
        }
        
        @media (max-width: 480px) {
          .hero-content {
            padding: 40px 20px !important;
          }
          
          .stars-small {
            opacity: 0.5;
          }
          
          .stars-medium {
            opacity: 0.3;
          }
          
          .stars-large {
            opacity: 0.2;
          }
        }
      `}</style>
    </div>
  );
};

export default FeaturedMovie;
