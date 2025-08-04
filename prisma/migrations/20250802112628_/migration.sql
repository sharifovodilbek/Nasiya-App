/*
  Warnings:

  - Added the required column `sellerId` to the `ImageOfDebt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerId` to the `ImageOfDebtor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."ImageOfDebt" ADD COLUMN     "sellerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."ImageOfDebtor" ADD COLUMN     "sellerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."ImageOfDebtor" ADD CONSTRAINT "ImageOfDebtor_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ImageOfDebt" ADD CONSTRAINT "ImageOfDebt_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
