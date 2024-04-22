/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `Seller` will be added. If there are existing duplicate values, this will fail.
  - The required column `username` was added to the `Seller` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Seller" ADD COLUMN     "username" TEXT NOT NULL,
ALTER COLUMN "password" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Seller_username_key" ON "Seller"("username");
