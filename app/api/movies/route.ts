import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/error-handler";
import { withAdminAuth } from "@/lib/auth-middleware";
import { z } from "zod";

// Get all movies (public endpoint)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search') || '';
    const genre = searchParams.get('genre') || '';

    const skip = (page - 1) * pageSize;

    const where = {
      AND: [
        search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } }
          ]
        } : {},
        genre ? {
          genres: {
            some: {
              name: { contains: genre, mode: 'insensitive' as const }
            }
          }
        } : {}
      ]
    };

    const [movies, total] = await Promise.all([
      prisma.movie.findMany({
        where,
        include: {
          genres: true,
          actors: true,
          directors: true,
          _count: {
            select: {
              ratings: true,
              reviews: true,
              watchlists: true
            }
          }
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.movie.count({ where })
    ]);

    return NextResponse.json({
      data: {
        movies,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

const CreateMovieSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  releaseDate: z.string().optional(),
  posterUrl: z.string().url().optional(),
  trailerUrl: z.string().url().optional(),
  genres: z.array(z.string()).optional(),
  actors: z.array(z.string()).optional(),
  directors: z.array(z.string()).optional(),
});

// Create new movie (admin only)
export async function POST(req: Request) {
  return withAdminAuth(async (authenticatedReq) => {
    try {
      const body = await req.json();
      const { 
        title, 
        description, 
        releaseDate, 
        posterUrl, 
        trailerUrl,
        genres = [],
        actors = [],
        directors = []
      } = CreateMovieSchema.parse(body);

      // Create or connect genres
      const genreConnections = await Promise.all(
        genres.map(async (genreName) => {
          const genre = await prisma.genre.upsert({
            where: { name: genreName },
            update: {},
            create: { name: genreName }
          });
          return { id: genre.id };
        })
      );

      // Create or connect actors
      const actorConnections = await Promise.all(
        actors.map(async (actorName) => {
          const actor = await prisma.actor.upsert({
            where: { name: actorName },
            update: {},
            create: { name: actorName }
          });
          return { id: actor.id };
        })
      );

      // Create or connect directors
      const directorConnections = await Promise.all(
        directors.map(async (directorName) => {
          const director = await prisma.director.upsert({
            where: { name: directorName },
            update: {},
            create: { name: directorName }
          });
          return { id: director.id };
        })
      );

      const movie = await prisma.movie.create({
        data: {
          title,
          description,
          releaseDate: releaseDate ? new Date(releaseDate) : null,
          posterUrl,
          trailerUrl,
          genres: {
            connect: genreConnections
          },
          actors: {
            connect: actorConnections
          },
          directors: {
            connect: directorConnections
          }
        },
        include: {
          genres: true,
          actors: true,
          directors: true
        }
      });

      return NextResponse.json({
        data: {
          movie,
          message: "Movie created successfully"
        }
      });
    } catch (error) {
      return handleApiError(error);
    }
  })(req);
}