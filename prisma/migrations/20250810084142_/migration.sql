/*
  Warnings:

  - You are about to drop the column `star` on the `Seller` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Debtor" ADD COLUMN     "star" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Seller" DROP COLUMN "star";
