/*
  Warnings:

  - The primary key for the `Actor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Director` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Genre` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Movie` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `directorId` on the `Movie` table. All the data in the column will be lost.
  - You are about to drop the column `releaseYear` on the `Movie` table. All the data in the column will be lost.
  - The primary key for the `Rating` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Rating` table. All the data in the column will be lost.
  - You are about to drop the column `review` on the `Rating` table. All the data in the column will be lost.
  - The primary key for the `Subscription` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `WatchHistory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `lastPosition` on the `WatchHistory` table. All the data in the column will be lost.
  - You are about to drop the column `watchedAt` on the `WatchHistory` table. All the data in the column will be lost.
  - The primary key for the `Watchlist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `_MovieActors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MovieGenres` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `score` to the `Rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastWatched` to the `WatchHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `progress` to the `WatchHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Movie" DROP CONSTRAINT "Movie_directorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Rating" DROP CONSTRAINT "Rating_movieId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Rating" DROP CONSTRAINT "Rating_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WatchHistory" DROP CONSTRAINT "WatchHistory_movieId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WatchHistory" DROP CONSTRAINT "WatchHistory_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Watchlist" DROP CONSTRAINT "Watchlist_movieId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Watchlist" DROP CONSTRAINT "Watchlist_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_MovieActors" DROP CONSTRAINT "_MovieActors_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_MovieActors" DROP CONSTRAINT "_MovieActors_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_MovieGenres" DROP CONSTRAINT "_MovieGenres_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_MovieGenres" DROP CONSTRAINT "_MovieGenres_B_fkey";

-- DropIndex
DROP INDEX "public"."Actor_name_key";

-- DropIndex
DROP INDEX "public"."Director_name_key";

-- AlterTable
ALTER TABLE "public"."Actor" DROP CONSTRAINT "Actor_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Actor_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Actor_id_seq";

-- AlterTable
ALTER TABLE "public"."Director" DROP CONSTRAINT "Director_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Director_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Director_id_seq";

-- AlterTable
ALTER TABLE "public"."Genre" DROP CONSTRAINT "Genre_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Genre_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Genre_id_seq";

-- AlterTable
ALTER TABLE "public"."Movie" DROP CONSTRAINT "Movie_pkey",
DROP COLUMN "directorId",
DROP COLUMN "releaseYear",
ADD COLUMN     "posterUrl" TEXT,
ADD COLUMN     "releaseDate" TIMESTAMP(3),
ADD COLUMN     "trailerUrl" TEXT,
ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Movie_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Movie_id_seq";

-- AlterTable
ALTER TABLE "public"."Rating" DROP CONSTRAINT "Rating_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "rating",
DROP COLUMN "review",
ADD COLUMN     "score" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "movieId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Rating_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Rating_id_seq";

-- AlterTable
ALTER TABLE "public"."Subscription" DROP CONSTRAINT "Subscription_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "startDate" DROP DEFAULT,
ADD CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Subscription_id_seq";

-- AlterTable
ALTER TABLE "public"."User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "username" DROP NOT NULL,
ALTER COLUMN "password" DROP NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "public"."WatchHistory" DROP CONSTRAINT "WatchHistory_pkey",
DROP COLUMN "lastPosition",
DROP COLUMN "watchedAt",
ADD COLUMN     "lastWatched" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "progress" INTEGER NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "movieId" SET DATA TYPE TEXT,
ADD CONSTRAINT "WatchHistory_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "WatchHistory_id_seq";

-- AlterTable
ALTER TABLE "public"."Watchlist" DROP CONSTRAINT "Watchlist_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "movieId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Watchlist_id_seq";

-- DropTable
DROP TABLE "public"."_MovieActors";

-- DropTable
DROP TABLE "public"."_MovieGenres";

-- CreateTable
CREATE TABLE "public"."Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_GenreToMovie" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_GenreToMovie_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_ActorToMovie" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ActorToMovie_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_DirectorToMovie" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DirectorToMovie_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "_GenreToMovie_B_index" ON "public"."_GenreToMovie"("B");

-- CreateIndex
CREATE INDEX "_ActorToMovie_B_index" ON "public"."_ActorToMovie"("B");

-- CreateIndex
CREATE INDEX "_DirectorToMovie_B_index" ON "public"."_DirectorToMovie"("B");

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Watchlist" ADD CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Watchlist" ADD CONSTRAINT "Watchlist_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WatchHistory" ADD CONSTRAINT "WatchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WatchHistory" ADD CONSTRAINT "WatchHistory_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "public"."Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_GenreToMovie" ADD CONSTRAINT "_GenreToMovie_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_GenreToMovie" ADD CONSTRAINT "_GenreToMovie_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ActorToMovie" ADD CONSTRAINT "_ActorToMovie_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Actor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ActorToMovie" ADD CONSTRAINT "_ActorToMovie_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DirectorToMovie" ADD CONSTRAINT "_DirectorToMovie_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Director"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_DirectorToMovie" ADD CONSTRAINT "_DirectorToMovie_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Movie"("id") ON DELETE CASCADE ON UPDATE CASCADE;
