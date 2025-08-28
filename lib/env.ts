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
  TMDB_API_KEY: z.string().min(1, "TMDB_API_KEY is required"),
  TMDB_READ_ACCESS_TOKEN: z.string().optional(),

  // Chapa Payments
  CHAPA_SECRET_KEY: z.string().min(1, "CHAPA_SECRET_KEY is required"),
  CHAPA_PUBLIC_KEY: z.string().optional(),
  CHAPA_CALLBACK_URL: z.string().url().optional(),
  CHAPA_RETURN_URL: z.string().url().optional(),
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

// Call this in your app initialization
export const env = validateEnv();
