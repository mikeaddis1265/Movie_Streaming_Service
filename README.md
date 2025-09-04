# 🎬 Movie Streaming Service

A comprehensive full-stack movie streaming platform built with Next.js, featuring advanced user authentication, subscription-based payment system, and seamless movie streaming capabilities. This platform provides users with intutive experience while offering robust admin controls for content and user management.

## 🎓 Zemenay Internship Project

This project was developed as part of the Zemenay internship program, showcasing modern web development practices and technologies.

## 👥 Development Team

- **Birukan Abawey** - Frontend Developer 
- **Samuel Wondimu** - Frontend Developer
- **Michael Addis** - Backend Developer

## 🚀 Live Application

**Deployed URL**: [https://movie-streaming-service-theta.vercel.app](https://movie-streaming-service-theta.vercel.app)

## 📖 Project Overview

This movie streaming service is designed to provide users with a complete entertainment platform where they can discover, watch, and manage their favorite movies. The application features a modern design with comprehensive user management, subscription-based access control, and an intuitive admin dashboard for platform management.

## 📋 Table of Contents

- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Installation Guide](#installation-guide)
- [API Documentation](#api-documentation)
- [Database Structure](#database-structure)
- [Demo Video](#demo-video)
- [Configuration](#configuration)

## ✨ Key Features

### 🔐 User Authentication & Security
- **Multi-method Registration**: Users can create accounts using email/password or Google OAuth integration
- **Email Verification System**: Secure account activation through email verification links
- **Password Management**: Comprehensive forgot password and reset functionality with secure token generation
- **Profile Management**: Users can update personal information, change passwords, and upload profile pictures
- **Role-based Authorization**: Differentiated access levels for regular users and administrators

### 🎥 Movie Discovery & Management
- **Advanced Movie Browsing**: Browse movies by categories (Popular, Top Rated, Now Playing, Upcoming) with pagination
- **Genre-based Filtering**: Filter movies by specific genres with dynamic genre selection
- **Detailed Movie Information**: Rich movie details including cast, crew, ratings, reviews, and recommendations
- **Personalized Collections**: Users can create and manage watchlists and favorites with easy add/remove functionality

### 💳 Subscription & Payment System
- **Flexible Subscription Plans**: Multiple subscription tiers with different features and pricing
- **Secure Payment Processing**: Integration with Chapa payment gateway for secure transactions
- **Real-time Payment Verification**: Instant subscription activation upon successful payment
- **Subscription Management**: Users can view, upgrade, downgrade, or cancel subscriptions


### 👑 Administrative Dashboard
- **Comprehensive User Management**: View, edit, and manage all registered users with analytics
- **Subscription Analytics**: Track subscription metrics, revenue
- **Dynamic Plan Management**: Create, edit, and manage subscription plans with flexible pricing


### 📱 Enhanced User Experience
- **Viewing History Tracking**: Automatic progress saving and resume functionality
- **Smart Recommendations**: AI-powered movie suggestions based on viewing history and preferences
- **Social Features**: Rating system-allow users to rate moves

## 🛠 Technology Stack

### Frontend Technologies
- **Next.js 15**: Modern React framework with App Router for server-side rendering and optimal performance
- **TypeScript**: Strong typing system for enhanced code quality and developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development and consistent styling
- **React Player**:  video streaming component with multiple format support
- **Custom Components**: Reusable UI components for consistent design language

### Backend & Database
- **Next.js API Routes**: Serverless backend architecture for scalable API development
- **Prisma ORM**: Type-safe database client with automated migrations and schema management
- **PostgreSQL**: Robust relational database hosted on Supabase for data persistence
- **NextAuth.js**: Complete authentication solution with multiple provider support

### External Integrations
- **TMDB API**: The Movie Database API for comprehensive movie metadata and information
- **Chapa Payment Gateway**: Ethiopian payment processing for secure subscription handling
- **Google OAuth 2.0**: Social authentication for seamless user onboarding
- **Resend Email Service**: Reliable email delivery for notifications and verification
- **Vercel Platform**: Modern deployment and hosting with global CDN

## 🏗 System Architecture

The application follows a modern full-stack architecture with clear separation of concerns:

- **Frontend Layer**: React-based user interface with server-side rendering
- **API Layer**: RESTful API endpoints for data management and business logic
- **Authentication Layer**: Secure session management with JWT tokens
- **Database Layer**: Normalized PostgreSQL database with optimized queries
- **External Services**: Third-party integrations for payments, emails, and movie data

## 🚀 Installation Guide

### System Requirements
- **Node.js**: Version 18.0 or higher
- **PostgreSQL**: Database server (local or cloud-hosted)
- **TMDB API Key**: For movie data access
- **Chapa Merchant Account**: For payment processing

### Step-by-Step Setup

1. **Repository Clone**
```bash
git clone https://github.com/mikeaddis1265/Movie_Streaming_Service.git
cd Movie_Streaming_Service/movie_streaming_service
```

2. **Dependency Installation**
```bash
npm install
# This installs all required packages including Next.js, Prisma, and other dependencies
```

3. **Environment Configuration**
```bash
# Create environment file from template
cp .env.example .env

# Configure all required environment variables (see Configuration section)
nano .env
```

4. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Optional: Seed database with sample data
npx prisma db seed
```

5. **Development Server**
```bash
npm run dev
```

Access the application at [http://localhost:3000](http://localhost:3000)

## 📡 API Documentation

### Authentication Endpoints
| HTTP Method | Endpoint | Description | Request Body | Response |
|-------------|----------|-------------|--------------|----------|
| POST | `/api/auth/register` | Create new user account | `{email, password, name}` | User object with token |
| POST | `/api/auth/[...nextauth]` | Handle NextAuth authentication | Varies by provider | Authentication response |
| POST | `/api/auth/verify-email` | Verify user email address | `{token}` | Verification status |
| POST | `/api/auth/forgot-password` | Request password reset | `{email}` | Reset token sent |
| POST | `/api/auth/reset-password` | Reset user password | `{token, password}` | Success status |
| PUT | `/api/auth/change-password` | Change existing password | `{currentPassword, newPassword}` | Update status |

### Movie Management Endpoints
| HTTP Method | Endpoint | Description | Parameters | Response |
|-------------|----------|-------------|------------|----------|
| GET | `/api/movies/browse` | Browse movies with filters | `?page, ?genre, ?type` | Paginated movie list |
| GET | `/api/movies/search` | Search movies by query | `?q=searchTerm&page=1` | Search results |
| GET | `/api/movies/[tmdbId]` | Get detailed movie information | `tmdbId` as path parameter | Complete movie details |
| POST | `/api/movies/[tmdbId]/rating` | Submit movie rating | `{value, mediaType}` | Rating confirmation |

### User Data Management
| HTTP Method | Endpoint | Description | Authorization | Response |
|-------------|----------|-------------|---------------|----------|
| GET | `/api/users/me` | Get current user profile | Required | User profile data |
| GET | `/api/users/[id]/subscriptions` | Get user subscription details | User/Admin | Subscription information |
| POST | `/api/users/[id]/subscriptions/checkout` | Initialize payment process | User only | Checkout URL |
| GET | `/api/users/[id]/watchlist` | Retrieve user watchlist | User/Admin | List of saved movies |
| POST | `/api/users/[id]/watchlist` | Add movie to watchlist | User only | Update confirmation |
| DELETE | `/api/users/[id]/watchlist/[tmdbId]` | Remove from watchlist | User only | Deletion confirmation |
| GET | `/api/users/[id]/favorites` | Get user favorites | User/Admin | Favorite movies list |
| POST | `/api/users/[id]/favorites` | Add to favorites | User only | Addition confirmation |
| DELETE | `/api/users/[id]/favorites/[tmdbId]` | Remove from favorites | User only | Removal confirmation |
| POST | `/api/users/[id]/viewing-history` | Update viewing progress | User only | Progress saved |
| GET | `/api/users/[id]/recommendations` | Get personalized suggestions | User only | Recommended movies |

### Administrative Endpoints
| HTTP Method | Endpoint | Description | Access Level | Response |
|-------------|----------|-------------|--------------|----------|
| GET | `/api/admin/users` | List all platform users | Admin only | Paginated user list |
| GET | `/api/admin/users/[id]` | Get specific user details | Admin only | Complete user profile |
| GET | `/api/admin/analytics` | Platform analytics data | Admin only | Analytics dashboard data |
| GET | `/api/admin/quick-stats` | Dashboard statistics | Admin only | Key metrics summary |
| GET | `/api/admin/subscription-plans` | List subscription plans | Admin only | Available plans |
| POST | `/api/admin/subscription-plans` | Create new subscription plan | Admin only | Plan creation confirmation |
| PUT | `/api/admin/subscription-plans/[id]` | Update existing plan | Admin only | Update confirmation |
| DELETE | `/api/admin/subscription-plans/[id]` | Remove subscription plan | Admin only | Deletion confirmation |

### Webhook Endpoints
| HTTP Method | Endpoint | Description | Source | Processing |
|-------------|----------|-------------|--------|------------|
| POST | `/api/webhooks/chapa` | Handle payment notifications | Chapa Gateway | Subscription activation |

## 🗄 Database Structure

### Core Data Models
- **User Model**: Stores user accounts, authentication data, and profile information
- **Subscription Model**: Manages user subscription details, status, and billing cycles
- **SubscriptionPlan Model**: Defines available subscription tiers with pricing and features
- **WatchlistItem Model**: Tracks movies saved by users for later viewing
- **Favorite Model**: Stores user's favorite movies with timestamps
- **Rating Model**: User ratings and reviews for movies with validation
- **ViewingHistory Model**: Tracks watch progress and completion status
- **Account Model**: OAuth account linking for social authentication

## 🎥 Demo Video

**Video Link**: [Coming Soon]

### Demo Content Overview
The demonstration video showcases the following key features:

1. **User Onboarding**: Registration process, email verification, and profile setup
2. **Movie Discovery**: Browsing interface, search functionality, and genre filtering
3. **Content Viewing**: Movie detail pages, streaming interface, and progress tracking
4. **Subscription Flow**: Plan selection, payment process, and subscription activation
5. **User Dashboard**: Profile management, watchlist, favorites, and viewing history
6. **Admin Interface**: User management, analytics, and system administration

## 🔧 Configuration

### Required Environment Variables

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database"
DIRECT_URL="postgresql://username:password@host:port/database"

# Authentication Settings
NEXTAUTH_SECRET="your-secure-random-string-here"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth Credentials
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Email Service Configuration
RESEND_API_KEY="your-resend-api-key"
MAIL_FROM="noreply@yourdomain.com"

# Movie Data API
TMDB_API_KEY="your-tmdb-api-key"

# Payment Gateway Setup
CHAPA_SECRET_KEY="your-chapa-secret-key"
CHAPA_CALLBACK_URL="https://yourdomain.com/api/webhooks/chapa"
CHAPA_RETURN_URL="https://yourdomain.com/subscription/success"
```

## 🚀 Deployment Information

### Production Deployment
- **Platform**: Vercel (Recommended for Next.js applications)
- **Database**: Supabase PostgreSQL (Managed database service)
- **Build Process**: Automated CI/CD with GitHub integration
- **Environment**: All production variables configured securely
- **Domain**: Custom domain with SSL certificate
- **Performance**: Global CDN distribution for optimal loading speeds

### Build Configuration
```json
{
  "buildCommand": "prisma generate && next build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

## 📦 Key Dependencies

### Production Dependencies
- **Next.js 15.4.6**: React framework with App Router
- **React 19.1.0**: JavaScript library for user interfaces
- **Prisma 6.14.0**: Database ORM and client
- **NextAuth.js 4.24.11**: Authentication solution
- **React Player 3.3.2**: Video streaming component
- **Tailwind CSS 4**: Utility-first CSS framework
- **TypeScript 5.9.2**: Static type checking

### Development Tools
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting automation
- **Prisma CLI**: Database management tools
- **TypeScript Compiler**: Type checking and compilation

## 🔒 Security Implementation

### Data Protection
- **Password Encryption**: Bcrypt hashing with salt rounds for secure password storage
- **JWT Token Management**: Secure session handling with token rotation
- **Email Verification**: Account security through verified email addresses
- **Input Validation**: Comprehensive data validation using Zod schemas
- **SQL Injection Prevention**: Prisma ORM provides built-in protection

### API Security
- **Rate Limiting**: Prevents abuse and ensures fair usage
- **CORS Configuration**: Cross-origin request security
- **Authentication Middleware**: Protected routes with session verification
- **Environment Security**: Sensitive data stored in environment variables

## 📈 Performance Optimizations

### Frontend Performance
- **Server-Side Rendering**: Fast initial page loads with Next.js SSR
- **Image Optimization**: Automatic image optimization and lazy loading
- **Code Splitting**: Dynamic imports for reduced bundle sizes
- **Caching Strategy**: Strategic caching for API responses and static assets

### Backend Performance
- **Database Indexing**: Optimized database queries with proper indexing
- **Connection Pooling**: Efficient database connection management
- **API Response Caching**: Reduced server load through intelligent caching
- **CDN Integration**: Global content distribution for faster access

## 🤝 Development Guidelines

### Contributing Process
1. Fork the repository on GitHub
2. Create a feature branch with descriptive naming (`feature/user-authentication`)
3. Implement changes following project coding standards
4. Write comprehensive tests for new functionality
5. Update documentation as necessary
6. Submit pull request with detailed description
7. Code review and integration process

### Code Standards
- **TypeScript**: Strict typing for all components and functions
- **ESLint Configuration**: Consistent code style enforcement
- **Component Structure**: Reusable components with proper prop typing
- **API Design**: RESTful endpoints with consistent response formats
- **Database Migrations**: Version-controlled schema changes

## 📄 Legal & Licensing

This project is developed under the MIT License, allowing for open-source collaboration while protecting intellectual property rights.

## 🙏 Acknowledgments & Credits

- **The Movie Database (TMDB)**: Comprehensive movie data and metadata
- **Chapa Payment Gateway**: Secure payment processing for Ethiopian market
- **Vercel Platform**: Reliable hosting and deployment infrastructure
- **Next.js Development Team**: Excellent framework and documentation
- **Open Source Community**: Various libraries and tools that made this project possible

---

**Developed by Michael Addis, Birukan Abawey, and Samuel Wondimu**  
**Zemenay Internship Project - 2025**
