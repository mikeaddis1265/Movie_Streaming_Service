import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { MediaType } from "@prisma/client";

// GET favorites list
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== params.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: params.id },
      orderBy: { addedAt: "desc" },
    });

    return NextResponse.json({ data: favorites });
  } catch (error) {
    console.error("Favorites GET error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST add favorite
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== params.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tmdbId, mediaType } = body as {
      tmdbId?: number | string;
      mediaType?: string;
    };

    if (tmdbId === undefined || !mediaType) {
      return NextResponse.json(
        { error: "tmdbId and mediaType are required" },
        { status: 400 }
      );
    }

    const tmdbIdNum =
      typeof tmdbId === "string" ? parseInt(tmdbId, 10) : tmdbId;
    if (!Number.isFinite(tmdbIdNum)) {
      return NextResponse.json(
        { error: "tmdbId must be a number" },
        { status: 400 }
      );
    }

    const upper = mediaType.toUpperCase();
    if (upper !== "MOVIE" && upper !== "TV") {
      return NextResponse.json(
        { error: "mediaType must be MOVIE or TV" },
        { status: 400 }
      );
    }

    const favorite = await prisma.favorite.upsert({
      where: {
        userId_tmdbId_mediaType: {
          userId: params.id,
          tmdbId: tmdbIdNum,
          mediaType: upper as MediaType,
        },
      },
      update: {},
      create: {
        userId: params.id,
        tmdbId: tmdbIdNum,
        mediaType: upper as MediaType,
      },
    });

    return NextResponse.json(
      { message: "Added to favorites", data: favorite },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Favorites POST error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Already in favorites" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
