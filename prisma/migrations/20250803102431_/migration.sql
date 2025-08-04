/*
  Warnings:

  - You are about to drop the column `sellerId` on the `ImageOfDebt` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ImageOfDebt" DROP CONSTRAINT "ImageOfDebt_sellerId_fkey";

-- AlterTable
ALTER TABLE "public"."ImageOfDebt" DROP COLUMN "sellerId";
