/*
  Warnings:

  - The primary key for the `subscription_plans` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `subscription_plans` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `planId` on the `subscriptions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."subscription_plans" DROP CONSTRAINT "subscription_plans_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."subscriptions" DROP COLUMN "planId",
ADD COLUMN     "planId" INTEGER NOT NULL;
