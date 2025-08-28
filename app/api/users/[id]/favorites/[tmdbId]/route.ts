import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { MediaType } from "@prisma/client";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; tmdbId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.id !== params.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const mediaType = (searchParams.get("mediaType") || "").toUpperCase();
    if (mediaType !== "MOVIE" && mediaType !== "TV") {
      return NextResponse.json(
        { error: "mediaType parameter is required and must be MOVIE or TV" },
        { status: 400 }
      );
    }

    await prisma.favorite.delete({
      where: {
        userId_tmdbId_mediaType: {
          userId: params.id,
          tmdbId: parseInt(params.tmdbId, 10),
          mediaType: mediaType as MediaType,
        },
      },
    });

    return NextResponse.json({ message: "Removed from favorites" });
  } catch (error: any) {
    console.error("Favorites DELETE error:", error);
    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Favorite not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
