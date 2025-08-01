/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Seller` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `Seller` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'SELLER');

-- AlterTable
ALTER TABLE "public"."Admin" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'ADMIN',
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."Debt" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."Debtor" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."ImageOfDebtor" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."NumberOfDebtor" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."Seller" ADD COLUMN     "resetOtp" TEXT,
ADD COLUMN     "resetOtpExp" TIMESTAMP(3),
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'SELLER',
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "public"."Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_phone_key" ON "public"."Admin"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_email_key" ON "public"."Seller"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_phone_key" ON "public"."Seller"("phone");
