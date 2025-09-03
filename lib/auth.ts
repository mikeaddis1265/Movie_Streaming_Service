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
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const { email, password } = credentials;

          const user = await prisma.user.findUnique({
            where: { email }
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
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists in database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { accounts: true }
          });

          if (!existingUser) {
            // Create new user for Google OAuth
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || "",
                image: user.image || null,
                emailVerified: new Date(), // Google emails are pre-verified
                role: "USER"
              }
            });
            console.log('Created new Google OAuth user:', newUser.id);
          } else {
            // User exists - check if they already have a Google account linked
            const googleAccount = existingUser.accounts.find(acc => acc.provider === 'google');
            
            if (!googleAccount) {
              // User exists but no Google account linked - this will be handled by the adapter
              console.log('Linking Google account to existing user:', existingUser.id);
              
              // Update user info with Google data if they don't have a name/image
              if (!existingUser.name && user.name) {
                await prisma.user.update({
                  where: { id: existingUser.id },
                  data: { 
                    name: user.name,
                    image: user.image || existingUser.image,
                    emailVerified: existingUser.emailVerified || new Date() // Verify email if not already verified
                  }
                });
              }
            } else {
              console.log('Existing Google OAuth user found:', existingUser.id);
            }
          }
        } catch (error) {
          console.error('Error handling Google OAuth user:', error);
          return false; // Deny sign in if we can't handle user
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      } else if (token.email || trigger === "update") {
        // Fetch user data from database to get updated role, subscription info
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            include: { 
              subscription: true 
            }
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            // Add subscription data to token to force session update
            const currentDate = new Date();
            token.hasActiveSubscription = !!(dbUser.subscription && 
                                            dbUser.subscription.status === "ACTIVE" && 
                                            dbUser.subscription.currentPeriodEnd && 
                                            dbUser.subscription.currentPeriodEnd > currentDate);
            token.subscription = dbUser.subscription;
            token.lastUpdated = Date.now(); // Force token refresh
          }
        } catch (error) {
          console.error('Error fetching user data in JWT callback:', error);
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
    signIn: '/auth',
  },
  secret: env.NEXTAUTH_SECRET,
};