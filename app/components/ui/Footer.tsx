import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="modern-footer">
      <div className="footer-container">
        {/* Main footer content */}
        <div className="footer-grid">
          {/* Brand section */}
          <div>
            <div className="footer-brand">
              <h2>MovieStream</h2>
              <p>
                Your ultimate destination for streaming movies and TV shows. Discover unlimited entertainment with our vast collection of content from around the world.
              </p>
            </div>
            <div className="footer-social">
              <div className="footer-social-icon">
                <span>f</span>
              </div>
              <div className="footer-social-icon">
                <span>t</span>
              </div>
              <div className="footer-social-icon">
                <span>i</span>
              </div>
              <div className="footer-social-icon">
                <span>y</span>
              </div>
            </div>
          </div>
          
          {/* Quick links */}
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><Link href="/browse">Browse Movies</Link></li>
              <li><Link href="/search">Search</Link></li>
              <li><Link href="/top-imdb">Top Rated</Link></li>
              <li><Link href="/subscription">Get Premium</Link></li>
              <li><Link href="/profile">My Profile</Link></li>
              <li><Link href="/watchlist">My Watchlist</Link></li>
            </ul>
          </div>
          
          {/* Support */}
          <div className="footer-section">
            <h3>Support & Info</h3>
            <ul className="footer-links">
              <li><Link href="/help">Help Center</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/careers">Careers</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom section */}
        <div className="footer-bottom">
          <p>© 2025 MovieStream - Zemenay Internship Project. All rights reserved.</p>
          <p>Built with passion for movie enthusiasts worldwide ❤️</p>
        </div>
      </div>
    </footer>
  );
}