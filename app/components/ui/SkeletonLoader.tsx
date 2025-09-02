"use client";

interface SkeletonLoaderProps {
  count?: number;
  type?: 'movie-card' | 'featured' | 'list-item';
  className?: string;
}

const SkeletonLoader = ({ count = 8, type = 'movie-card', className = '' }: SkeletonLoaderProps) => {
  const renderMovieCardSkeleton = () => (
    <div className="movie-card-skeleton">
      <div className="skeleton-poster"></div>
      <div className="skeleton-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-info">
          <div className="skeleton-text short"></div>
          <div className="skeleton-text shorter"></div>
        </div>
      </div>
    </div>
  );

  const renderFeaturedSkeleton = () => (
    <div className="featured-skeleton">
      <div className="skeleton-backdrop"></div>
      <div className="skeleton-featured-content">
        <div className="skeleton-featured-title"></div>
        <div className="skeleton-featured-description"></div>
        <div className="skeleton-featured-buttons">
          <div className="skeleton-button"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
    </div>
  );

  const renderListItemSkeleton = () => (
    <div className="list-item-skeleton">
      <div className="skeleton-small-poster"></div>
      <div className="skeleton-list-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-text short"></div>
      </div>
    </div>
  );

  if (type === 'featured') {
    return (
      <div className={`skeleton-container ${className}`}>
        {renderFeaturedSkeleton()}
      </div>
    );
  }

  if (type === 'list-item') {
    return (
      <div className={`skeleton-container ${className}`}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i}>{renderListItemSkeleton()}</div>
        ))}
      </div>
    );
  }

  return (
    <div className={`skeleton-container ${className}`}>
      <div className="skeleton-grid">
        {Array.from({ length: count }, (_, i) => (
          <div key={i}>{renderMovieCardSkeleton()}</div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonLoader;