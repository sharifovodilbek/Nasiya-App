/*
  Warnings:

  - Added the required column `startDate` to the `Debt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Debt" ADD COLUMN     "startDate" TEXT NOT NULL;
