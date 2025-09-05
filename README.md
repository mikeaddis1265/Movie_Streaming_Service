# Movie Streaming Service

A full-stack movie streaming platform where users can discover, watch, and manage their favorite movies with subscription-based access.

## Team Members & Roles

**Samuel Wondimu** - Frontend Developer

- Homepage layout and design
- Search functionality and interface
- Subscription and pricing pages
- User profile interface and management
- Continue watching feature
- Favorites management system
- Watchlist interface
- Footer component design
- Conditional navigation system
- Loading states and skeleton components
- CSS styling for homepage, profile, subscription, footer, and skeleton loader

**Brukan Abawey** - Frontend Developer

- Movie and TV show details pages
- Browse and categories interface
- Authentication pages (login/signup)
- Video streaming player
- Featured movie components
- Movie card components
- Video player components and controls
- Main navigation system
- Home page components
- CSS styling for authentication, navigation, video player, browse, and movie details

**Michael Addis** - Backend Developer

- Database design and management with PostgreSQL and Prisma
- User authentication and authorization system
- Subscription and payment integration with Chapa
- Movie data integration with TMDB API
- Email verification system using Resend
- API endpoints for all frontend functionality
- Admin dashboard backend logic
- Security implementation and data validation

## Live Application

**Deployed URL**: [https://movie-streaming-service-theta.vercel.app](https://movie-streaming-service-theta.vercel.app)

## Demo Video




https://github.com/user-attachments/assets/89e9ab84-313a-4515-b32f-2b32ebd71e73






**Demo Video**: [View Demo](./demo.mp4)

 Please check the project folder for the complete demo video showcasing all features_

## Important Notice for Testing

**Email Verification**: Due to domain verification limitations with Resend, email verification only works for the developer's email address. If you want to test the application:

- **Recommended**: Use Google login for the smoothest experience
- **Alternative**: If you register with email/password, contact the developer to manually verify your account from the admin panel

 **Testing Payments**: Our platform supports secure digital payment solutions for both international and local customers, including Awash Bank, Amole, telebirr, CBEBirr, COOPPay-ebirr, and M-Pesa. In test mode, no actual money is used. Clients must select test phone numbers or test credit cards provided by the payment gateways (e.g., via Chapa or other providers) to simulate payments securely. When testing subscriptions, choose the appropriate test phone number or test card from the payment provider’s test credentials to proceed. 
## Core Features

### 🔐 Authentication & User Management

- **Multi-Authentication**: Email/password registration and Google OAuth integration
- **Email Verification**: Secure account activation with email verification
- **Profile Management**: Update personal information and profile pictures
- **Password Reset**: Forgot password functionality with secure tokens

### 🎬 Movie Experience

- **Advanced Browse**: Categories (Popular, Top Rated, Now Playing, Upcoming)
- **Smart Search**: Search movies with real-time results
- **Genre Filtering**: Filter by specific movie genres
- **Detailed Info**: Cast, crew, ratings, reviews, and recommendations
- **Custom Video Player**: Progress tracking and resume functionality

### 💎 Personal Collections

- **Watchlist**: Save movies to watch later
- **Favorites**: Mark and manage favorite movies
- **Viewing History**: Track watched movies with progress


### 💳 Subscription & Payments (Unique Feature)

- **Multiple Plans**: Basic, Standard, and Premium tiers
- **Chapa Integration**: Ethiopian payment gateway for local payments
- **Real-time Verification**: Instant subscription activation
- **Subscription Management**: Upgrade, downgrade, or cancel anytime

### 👑 Admin Dashboard

- **User Analytics**: Complete user management and statistics
- **Subscription Metrics**: Revenue tracking and subscription analytics
- **Plan Management**: Create and modify subscription plans
- **Platform Control**: Comprehensive admin controls

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth authentication
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Reset password

### Movies & Content

- `GET /api/movies/browse` - Browse movies with pagination
- `GET /api/movies/search` - Search movies
- `GET /api/movies/[tmdbId]` - Movie details
- `POST /api/movies/[tmdbId]/rating` - Rate movies

### User Data

- `GET /api/users/me` - Current user profile
- `GET /api/users/[id]/subscriptions` - User subscription details
- `POST /api/users/[id]/subscriptions/checkout` - Initialize payment
- `GET|POST|DELETE /api/users/[id]/watchlist` - Manage watchlist
- `GET|POST|DELETE /api/users/[id]/favorites` - Manage favorites
- `POST /api/users/[id]/viewing-history` - Update viewing progress

### Admin Panel

- `GET /api/admin/users` - List all users
- `GET /api/admin/analytics` - Platform analytics
- `GET /api/admin/quick-stats` - Dashboard statistics
- `GET|POST|PUT|DELETE /api/admin/subscription-plans` - Manage plans

### Payment Integration

- `POST /api/webhooks/chapa` - Chapa payment webhook

## Unique Features 

### 🇪🇹 Ethiopian Payment Integration

- **Chapa Gateway**: First-class support for Ethiopian payment methods
- **Real-time Webhooks**: Instant subscription activation after payment

### 🛡️ Enterprise-grade Security

- **JWT Token Management**: Secure session handling with automatic refresh
- **Role-based Access**: Different permission levels for users and admins
- **Input Validation**: Comprehensive data validation using Zod schemas
- **Rate Limiting**: API protection against abuse

### 📊 Business Intelligence

- **Real-time Analytics**: Live subscription and user metrics
- **Revenue Tracking**: Detailed payment and subscription analytics
- **Admin Controls**: Complete platform management dashboard

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (hosted on Supabase)
- **Authentication**: NextAuth.js with Google OAuth
- **Payments**: Chapa Payment Gateway (Ethiopian)
- **Email**: Resend Email Service
- **Movie Data**: TMDB API
- **Deployment**: Vercel

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/mikeaddis1265/Movie_Streaming_Service.git
cd Movie_Streaming_Service/movie_streaming_service
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Configure all required variables in .env file
```

4. Set up database:

```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:

```bash
npm run dev
```

## Environment Variables

```env
DATABASE_URL="postgresql://username:password@host:port/database"
NEXTAUTH_SECRET="your-secure-random-string"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
RESEND_API_KEY="your-resend-api-key"
TMDB_API_KEY="your-tmdb-api-key"
CHAPA_SECRET_KEY="your-chapa-secret-key"
```

---

_Developed during Zemenay Internship Program - 2025_ [Visit Zemenay Tech](https://www.zemenaytech.com/)
