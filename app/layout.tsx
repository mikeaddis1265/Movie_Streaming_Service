import type { Metadata } from "next";
// Base styles
import "./styles/base/globals.css";
import "./styles/base/utilities.css";
import "./styles/base/responsive.css";

// Component styles
import "./styles/components/navigation.css";
import "./styles/components/video-player.css";
import "./styles/components/auth.css";
import "./styles/components/footer.css";
import "./styles/components/skeleton.css";

// Page styles
import "./styles/pages/home.css";
import "./styles/pages/subscription.css";
import "./styles/pages/movie-details.css";
import "./styles/pages/profile.css";
import "./styles/pages/browse.css";
import "./styles/pages/admin.css";

import { Geist, Geist_Mono } from "next/font/google";
import SessionProvider from "./components/ui/SessionProvider";
import ConditionalNavigation from "./components/ui/ConditionalNavigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MovieStream - Your Favorite Movies",
  description: "Stream and discover your favorite movies and TV shows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <ConditionalNavigation />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
