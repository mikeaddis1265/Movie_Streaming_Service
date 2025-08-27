// Shared utility functions for the movie streaming service

/**
 * Get the full image URL for TMDb images
 */
export function getTMDbImageUrl(path: string | null, size: 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string {
  if (!path) return '/placeholder-movie.jpg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format release year from date string
 */
export function getYear(dateString: string | null): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).getFullYear().toString();
}

/**
 * Format movie runtime from minutes to hours and minutes
 */
export function formatRuntime(minutes: number): string {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}min`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Format large numbers (for budget, revenue, etc.)
 */
export function formatCurrency(amount: number): string {
  if (!amount) return 'N/A';
  
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  }
  
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  
  return `$${amount}`;
}

/**
 * Format vote average to one decimal place
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * Generate a range of years for filters
 */
export function generateYearRange(startYear?: number, endYear?: number): number[] {
  const currentYear = new Date().getFullYear();
  const start = startYear || currentYear - 20;
  const end = endYear || currentYear;
  
  const years: number[] = [];
  for (let year = end; year >= start; year--) {
    years.push(year);
  }
  
  return years;
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Format time duration from seconds to readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate reading time for reviews
 */
export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRole: 'user' | 'admin'): boolean {
  if (requiredRole === 'user') return true;
  return userRole === 'admin';
}

/**
 * Generate a slug from a string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}