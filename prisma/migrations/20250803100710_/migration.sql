/*
  Warnings:

  - You are about to drop the column `sellerId` on the `Debt` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Debt" DROP CONSTRAINT "Debt_sellerId_fkey";

-- AlterTable
ALTER TABLE "public"."Debt" DROP COLUMN "sellerId";
