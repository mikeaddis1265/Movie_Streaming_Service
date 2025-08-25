import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user?.password) return null;
        // TODO: Re-enable email verification for production
        // Temporarily disabled for team development/testing
        // if (!user.emailVerified) {
        //   throw new Error("Email not verified");
        // }
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email as string,
          name: user.name || undefined,
          image: user.image || undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = (user as any).id || token.id;
      }
      // Mark Google accounts as verified implicitly(auto verify google user)
      if (account?.provider === "google") {
        const email = token.email as string | undefined;
        if (email) {
          await prisma.user.updateMany({
            where: { email, emailVerified: null },
            data: { emailVerified: new Date() },
          });
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    // You can define custom pages later
  },
  secret: process.env.NEXTAUTH_SECRET,
};
