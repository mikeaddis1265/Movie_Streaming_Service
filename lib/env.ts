import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),

  // NextAuth
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),

  // Google OAuth (optional)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Email Service
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),

  // TMDb API  
  TMDB_API_KEY: z.string().optional(),
  TMDB_READ_ACCESS_TOKEN: z.string().optional(),

  // Chapa Payments
  CHAPA_SECRET_KEY: z.string().optional(),
  CHAPA_PUBLIC_KEY: z.string().optional(),
  CHAPA_CALLBACK_URL: z.string().optional(),
  CHAPA_RETURN_URL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");

      throw new Error(`Environment validation failed:\n${missingVars}`);
    }
    throw error;
  }
}

// Call this in your app initialization - with build-time safety
export const env = (() => {
  try {
    return validateEnv();
  } catch (error) {
    // During build time, some env vars might not be available
    // Return a safe fallback object
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV) {
      console.warn('Environment validation failed during build, using fallbacks');
      return {
        DATABASE_URL: process.env.DATABASE_URL || '',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || '',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASSWORD: process.env.SMTP_PASSWORD,
        TMDB_API_KEY: process.env.TMDB_API_KEY || '',
        TMDB_READ_ACCESS_TOKEN: process.env.TMDB_READ_ACCESS_TOKEN,
        CHAPA_SECRET_KEY: process.env.CHAPA_SECRET_KEY || '',
        CHAPA_PUBLIC_KEY: process.env.CHAPA_PUBLIC_KEY,
        CHAPA_CALLBACK_URL: process.env.CHAPA_CALLBACK_URL,
        CHAPA_RETURN_URL: process.env.CHAPA_RETURN_URL,
      } as Env;
    }
    throw error;
  }
})();
