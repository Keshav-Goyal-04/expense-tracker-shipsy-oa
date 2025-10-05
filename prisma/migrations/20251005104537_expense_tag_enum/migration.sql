/*
  Warnings:

  - Changed the type of `tag` on the `Expense` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ExpenseTag" AS ENUM ('FOOD', 'TRAVEL', 'BILLS', 'ENTERTAINMENT', 'OTHER');

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "tag",
ADD COLUMN     "tag" "ExpenseTag" NOT NULL;
