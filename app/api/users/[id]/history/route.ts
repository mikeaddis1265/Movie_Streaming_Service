// app/api/users/[id]/history/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { fetchMovieDetails, fetchTVDetails } from "@/lib/tmdbapi";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authentication and authorization check
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== params.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // 3. Get user's viewing history from database
    const [history, totalCount] = await Promise.all([
      prisma.watchHistory.findMany({
        where: { userId: params.id },
        orderBy: { watchedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.watchHistory.count({
        where: { userId: params.id },
      }),
    ]);

    // 4. Enrich with media details from TMDb
    const enrichedHistory = await Promise.all(
      history.map(async (item) => {
        try {
          let mediaDetails;
          if (item.mediaType === "MOVIE") {
            mediaDetails = await fetchMovieDetails(item.tmdbId.toString());
          } else {
            mediaDetails = await fetchTVDetails(item.tmdbId.toString());
          }

          return {
            ...item,
            mediaDetails: {
              title: mediaDetails.title || mediaDetails.name,
              poster_path: mediaDetails.poster_path,
              backdrop_path: mediaDetails.backdrop_path,
              overview: mediaDetails.overview,
            },
          };
        } catch (error) {
          console.error(
            `Failed to fetch details for ${item.mediaType} ${item.tmdbId}:`,
            error
          );
          return { ...item, mediaDetails: null };
        }
      })
    );

    // 5. Return paginated response
    return NextResponse.json({
      data: enrichedHistory,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Viewing history API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch viewing history" },
      { status: 500 }
    );
  }
}
