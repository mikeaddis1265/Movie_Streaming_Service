import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, AppError, ErrorCodes } from "@/lib/error-handler";
import { withAdminAuth } from "@/lib/auth-middleware";
import { z } from "zod";

// Get single movie (public)
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: params.id },
      include: {
        genres: true,
        actors: true,
        directors: true,
        ratings: {
          select: {
            score: true
          }
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            ratings: true,
            reviews: true,
            watchlists: true,
            watchHistory: true
          }
        }
      }
    });

    if (!movie) {
      throw new AppError(
        ErrorCodes.NOT_FOUND,
        "Movie not found",
        404
      );
    }

    // Calculate average rating
    const avgRating = movie.ratings.length > 0
      ? movie.ratings.reduce((sum, r) => sum + r.score, 0) / movie.ratings.length
      : null;

    return NextResponse.json({
      data: {
        movie: {
          ...movie,
          avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null
        }
      }
    });
  } catch (error) {
    return handleApiError(error);
  }
}

const UpdateMovieSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  releaseDate: z.string().optional(),
  posterUrl: z.string().url().optional(),
  trailerUrl: z.string().url().optional(),
  genres: z.array(z.string()).optional(),
  actors: z.array(z.string()).optional(),
  directors: z.array(z.string()).optional(),
});

// Update movie (admin only)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  return withAdminAuth(async (authenticatedReq) => {
    try {
      const body = await req.json();
      const updateData = UpdateMovieSchema.parse(body);

      // Check if movie exists
      const existingMovie = await prisma.movie.findUnique({
        where: { id: params.id }
      });

      if (!existingMovie) {
        throw new AppError(
          ErrorCodes.NOT_FOUND,
          "Movie not found",
          404
        );
      }

      // Prepare update data
      const movieUpdate: any = {
        ...(updateData.title && { title: updateData.title }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.releaseDate && { releaseDate: new Date(updateData.releaseDate) }),
        ...(updateData.posterUrl !== undefined && { posterUrl: updateData.posterUrl }),
        ...(updateData.trailerUrl !== undefined && { trailerUrl: updateData.trailerUrl }),
      };

      // Handle genre updates
      if (updateData.genres) {
        const genreConnections = await Promise.all(
          updateData.genres.map(async (genreName) => {
            const genre = await prisma.genre.upsert({
              where: { name: genreName },
              update: {},
              create: { name: genreName }
            });
            return { id: genre.id };
          })
        );

        movieUpdate.genres = {
          set: genreConnections
        };
      }

      // Handle actor updates
      if (updateData.actors) {
        const actorConnections = await Promise.all(
          updateData.actors.map(async (actorName) => {
            const actor = await prisma.actor.upsert({
              where: { name: actorName },
              update: {},
              create: { name: actorName }
            });
            return { id: actor.id };
          })
        );

        movieUpdate.actors = {
          set: actorConnections
        };
      }

      // Handle director updates
      if (updateData.directors) {
        const directorConnections = await Promise.all(
          updateData.directors.map(async (directorName) => {
            const director = await prisma.director.upsert({
              where: { name: directorName },
              update: {},
              create: { name: directorName }
            });
            return { id: director.id };
          })
        );

        movieUpdate.directors = {
          set: directorConnections
        };
      }

      const movie = await prisma.movie.update({
        where: { id: params.id },
        data: movieUpdate,
        include: {
          genres: true,
          actors: true,
          directors: true
        }
      });

      return NextResponse.json({
        data: {
          movie,
          message: "Movie updated successfully"
        }
      });
    } catch (error) {
      return handleApiError(error);
    }
  })(req);
}

// Delete movie (admin only)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  return withAdminAuth(async (authenticatedReq) => {
    try {
      const movie = await prisma.movie.findUnique({
        where: { id: params.id }
      });

      if (!movie) {
        throw new AppError(
          ErrorCodes.NOT_FOUND,
          "Movie not found",
          404
        );
      }

      await prisma.movie.delete({
        where: { id: params.id }
      });

      return NextResponse.json({
        data: {
          message: "Movie deleted successfully",
          deletedMovie: { id: movie.id, title: movie.title }
        }
      });
    } catch (error) {
      return handleApiError(error);
    }
  })(req);
}