import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID || "",
      clientSecret: env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const { email, password } = credentials;

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.password) {
            return null;
          }

          if (!user.emailVerified) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email || "",
            name: user.name || "",
            image: user.image || null,
            role: user.role,
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      try {
        console.log("SignIn callback - Account:", account);
        console.log("SignIn callback - Profile:", profile);
        console.log("SignIn callback - User:", user);
        
        // Defer to PrismaAdapter for account creation/linking
        // Keep default provider safety (no auto-linking by email unless explicitly enabled)
        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return false;
      }
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // Always fetch fresh user data on signin or when explicitly triggered
      const lastUpdated =
        typeof token.lastUpdated === "number" ? token.lastUpdated : 0;
      if (
        user ||
        trigger === "update" ||
        !token.lastUpdated ||
        Date.now() - lastUpdated > 5 * 60 * 1000
      ) {
        // Fetch user data from database to get updated role, subscription info
        try {
          // Only fetch if we have a valid email
          if (!token.email) return token;

          console.log(
            "JWT Callback: Fetching fresh user data for:",
            token.email
          );
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            include: {
              subscription: true,
            },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            // Add subscription data to token to force session update
            const currentDate = new Date();
            const hasActiveSubscription = !!(
              dbUser.subscription &&
              dbUser.subscription.status === "ACTIVE" &&
              dbUser.subscription.currentPeriodEnd &&
              dbUser.subscription.currentPeriodEnd > currentDate
            );
            token.hasActiveSubscription = hasActiveSubscription;
            token.subscription = dbUser.subscription;
            token.lastUpdated = Date.now(); // Track when we last fetched data

            console.log("JWT Callback: User subscription status:", {
              userId: dbUser.id,
              email: dbUser.email,
              hasSubscription: !!dbUser.subscription,
              subscriptionStatus: dbUser.subscription?.status,
              isActive: hasActiveSubscription,
              currentPeriodEnd: dbUser.subscription?.currentPeriodEnd,
            });
          }
        } catch (error) {
          console.error("Error fetching user data in JWT callback:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        (session as any).hasActiveSubscription = token.hasActiveSubscription;
        (session as any).subscription = token.subscription;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth",
  },
  events: {
    async signIn({ user, account, profile }) {
      console.log("User signed in:", { user: user?.email, provider: account?.provider });
    },
  },
  secret: env.NEXTAUTH_SECRET,
};
