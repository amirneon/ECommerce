-- CreateEnum
CREATE TYPE "StatusfinalOrder" AS ENUM ('Pending', 'Paid', 'Verify', 'Verified');

-- AlterTable
ALTER TABLE "FinalOrders" ADD COLUMN     "statusfinalOrder" "StatusfinalOrder" NOT NULL DEFAULT 'Pending';
